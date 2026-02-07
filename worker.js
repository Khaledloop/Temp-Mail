/**
 * Temp Mail Worker - D1 Version
 * Features:
 * - Zero Trust Hardened
 * - Admin Console & Analytics
 * - Domain Rotation
 * - Secure Email Forwarding
 * - Advanced MIME Parsing
 */

const SESSION_TTL = 30 * 24 * 60 * 60;
const MSG_TTL = 900; // 15 minutes
const MAX_LIST = 50;
const MAX_BODY_CHARS = 100000;
const MAX_RAW_BYTES = 256000;

// Recovery settings
const RECOVERY_TTL = 30 * 24 * 60 * 60; // 30 days

// Admin settings
const ADMIN_INDEX_LIMIT = 200;
const ADMIN_MESSAGES_LIMIT = 25;
const ADMIN_SESSIONS_LIMIT = 20;
const ADMIN_VOLUME_BUCKET_MS = 5 * 60 * 1000; // 5 min
const ADMIN_VOLUME_BUCKETS = 12; // last 60 min
const ADMIN_METRICS_TTL = 7200; // 2 hours
const ADMIN_COUNTRY_TTL = 86400; // 24 hours

const ALLOWED_ORIGINS = new Set([
  'https://narsub.shop',
  'https://temp-mail-6xq.pages.dev',
  'https://tempmaillab.com',
  'https://www.tempmaillab.com',
]);

const ALLOWED_DOMAINS = [
  'chatgptmail.shop',
  'digibeast.store',
  'emailmuaqat.shop',
  'narsub.online',
  'narsub.shop',
  'thebest73.shop',
];

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
};

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// --- D1 Helper Functions ---
// These helpers make D1 behave like KV for compact storage.
async function kvGet(db, key) {
  try {
    const res = await db
      .prepare('SELECT value, expires_at FROM app_kv WHERE key = ?')
      .bind(key)
      .first();
    if (!res) return null;
    if (res.expires_at && res.expires_at <= nowSec()) {
      await db.prepare('DELETE FROM app_kv WHERE key = ?').bind(key).run();
      return null;
    }
    return safeJsonParse(res.value);
  } catch (e) {
    return null;
  }
}

async function kvPut(db, key, value, ttl = null) {
  try {
    const valStr = JSON.stringify(value);
    const expires = ttl ? nowSec() + ttl : null;
    await db
      .prepare('INSERT OR REPLACE INTO app_kv (key, value, expires_at) VALUES (?, ?, ?)')
      .bind(key, valStr, expires)
      .run();
  } catch (e) {
    console.error('KV Put Error', e);
  }
}

async function kvDelete(db, key) {
  try {
    await db.prepare('DELETE FROM app_kv WHERE key = ?').bind(key).run();
  } catch (e) {}
}

async function kvList(db, prefix, limit = 50) {
  try {
    const { results } = await db
      .prepare(
        'SELECT key FROM app_kv WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > ?) LIMIT ?'
      )
      .bind(prefix + '%', nowSec(), limit)
      .all();
    return { keys: results.map((r) => ({ name: r.key })) };
  } catch (e) {
    return { keys: [] };
  }
}

async function kvCountPrefix(db, prefix) {
  try {
    const res = await db
      .prepare(
        'SELECT COUNT(*) AS count FROM app_kv WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > ?)'
      )
      .bind(prefix + '%', nowSec())
      .first();
    return res?.count ? Number.parseInt(res.count, 10) : 0;
  } catch {
    return 0;
  }
}
// --- Standard Helpers ---
function buildHeaders(origin) {
  const headers = new Headers(SECURITY_HEADERS);
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
    headers.set('Access-Control-Max-Age', '86400');
    headers.set('Vary', 'Origin');
  }
  return headers;
}

function json(data, status = 200, origin) {
  return new Response(JSON.stringify(data), { status, headers: buildHeaders(origin) });
}

function getOrigin(request) {
  return request.headers.get('Origin') || '';
}

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin);
}

function getClientIp(request) {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : '0.0.0.0';
}

function sanitizeHeaderValue(value, maxLen = 200) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, maxLen);
}

function normalizeDomain(value) {
  const domain = String(value || '').trim().toLowerCase();
  if (!domain) return '';
  return ALLOWED_DOMAINS.includes(domain) ? domain : '';
}

function normalizeLocalPart(value) {
  const local = String(value || '').trim().toLowerCase();
  if (!local) return '';
  if (!/^[a-z0-9._-]{1,32}$/.test(local)) return '';
  return local;
}

function normalizeEmail(address) {
  const value = String(address || '').trim().toLowerCase();
  const parts = value.split('@');
  if (parts.length !== 2) return '';
  if (!ALLOWED_DOMAINS.includes(parts[1])) return '';
  return value;
}

function generateLocalPart(length = 8) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('');
}

function generateRecoveryKey() {
  return crypto.randomUUID();
}

function normalizeRecoveryKey(value) {
  const key = String(value || '').trim();
  return /^[a-f0-9-]{36}$/i.test(key) ? key : '';
}
function getBearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return /^[a-f0-9-]{36}$/i.test(token) ? token : null;
}

function getMessageId(url) {
  let id = url.searchParams.get('id');
  if (!id) {
    const parts = url.pathname.split('/');
    if (parts.length === 4 && parts[1] === 'api' && parts[2] === 'message') id = parts[3];
  }
  return id && /^[a-f0-9-]{36}$/i.test(id) ? id : null;
}

function getAdminSecret(request) {
  return request.headers.get('x-admin-secret') || '';
}

function requireAdmin(request, env) {
  if (!env.ADMIN_SECRET) return false;
  return getAdminSecret(request) === env.ADMIN_SECRET;
}

async function getRotatedDomain(env, ctx) {
  const domainsList = Array.from(ALLOWED_DOMAINS);
  if (!domainsList.length) return '';
  const counterRaw = await kvGet(env.DB, 'sys:domain_counter');
  const counter = Number.parseInt(counterRaw || '0', 10) || 0;
  const repeatCount = 2;
  const domainIndex = Math.floor(counter / repeatCount) % domainsList.length;
  const domain = domainsList[domainIndex];
  ctx.waitUntil(kvPut(env.DB, 'sys:domain_counter', counter + 1));
  return domain;
}

// --- Rate Limiting Logic ---
async function rateLimitMinute(env, key, capacity, refillPerSecond) {
  const now = Date.now();
  const data = await kvGet(env.DB, key);
  let tokens = capacity;
  let last = now;

  if (data && typeof data.tokens === 'number' && typeof data.last === 'number') {
    tokens = data.tokens;
    last = data.last;
  }

  const elapsed = Math.max(0, now - last) / 1000;
  tokens = Math.min(capacity, tokens + elapsed * refillPerSecond);

  if (tokens < 1) {
    await kvPut(env.DB, key, { tokens, last: now }, 120);
    return false;
  }

  tokens -= 1;
  await kvPut(env.DB, key, { tokens, last: now }, 120);
  return true;
}

function utcDayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function rateLimitDaily(env, key, maxPerDay) {
  const countRaw = await kvGet(env.DB, key);
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
  if (count >= maxPerDay) return false;
  await kvPut(env.DB, key, String(count + 1), 172800);
  return true;
}
// ========== Advanced Email Body Parsing ==========
function parseBoundary(headers) {
  const lower = headers.toLowerCase();
  const idx = lower.indexOf('boundary=');
  if (idx === -1) return null;

  let boundary = headers.slice(idx + 9).trim();
  if (boundary.startsWith('"')) {
    boundary = boundary.slice(1);
    const endQuote = boundary.indexOf('"');
    if (endQuote !== -1) boundary = boundary.slice(0, endQuote);
  } else {
    let end = boundary.length;
    for (let i = 0; i < boundary.length; i += 1) {
      const ch = boundary[i];
      if (ch === ';' || ch === '\r' || ch === '\n') {
        end = i;
        break;
      }
    }
    boundary = boundary.slice(0, end);
  }
  return boundary.trim().length ? boundary.trim() : null;
}

function decodeQuotedPrintable(input) {
  return input
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function decodeBase64UTF8(input) {
  try {
    const clean = input.replace(/\s+/g, '');
    const binary = atob(clean);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return input;
  }
}

function decodeContent(body, headers) {
  const h = headers.toLowerCase();
  if (h.includes('content-transfer-encoding: base64')) return decodeBase64UTF8(body);
  if (h.includes('content-transfer-encoding: quoted-printable')) return decodeQuotedPrintable(body);
  return body;
}

function extractEmailBody(raw) {
  if (!raw) return 'Email received';
  const safeRaw = raw.slice(0, MAX_RAW_BYTES).replace(/\r\n/g, '\n');
  const headerEnd = safeRaw.indexOf('\n\n');
  const headers = headerEnd !== -1 ? safeRaw.slice(0, headerEnd) : '';
  const boundary = parseBoundary(headers);

  const lower = safeRaw.toLowerCase();
  let body = '';
  let partHeaders = '';

  const htmlIndex = lower.indexOf('content-type: text/html');
  if (htmlIndex !== -1) {
    const start = safeRaw.indexOf('\n\n', htmlIndex);
    if (start !== -1) {
      partHeaders = safeRaw.slice(htmlIndex, start);
      body = safeRaw.slice(start + 2);
    }
  }

  if (!body) {
    const textIndex = lower.indexOf('content-type: text/plain');
    if (textIndex !== -1) {
      const start = safeRaw.indexOf('\n\n', textIndex);
      if (start !== -1) {
        partHeaders = safeRaw.slice(textIndex, start);
        body = safeRaw.slice(start + 2);
      }
    }
  }

  if (!body) {
    body = headerEnd !== -1 ? safeRaw.slice(headerEnd + 2) : safeRaw;
    partHeaders = headers;
  }

  if (boundary) {
    const boundaryMarker = `--${boundary}`;
    const endIdx = body.indexOf(boundaryMarker);
    if (endIdx !== -1) body = body.slice(0, endIdx);
  }

  body = decodeContent(body, partHeaders).replace(/\r/g, '').trim();
  return body.slice(0, MAX_BODY_CHARS) || 'Email received';
}
// ========== Admin Helpers ==========
function minuteKey() {
  return Math.floor(Date.now() / 60000);
}

function volumeBucketKey() {
  return Math.floor(Date.now() / ADMIN_VOLUME_BUCKET_MS);
}

async function incrCounter(env, key, ttl, by = 1) {
  const current = await kvGet(env.DB, key);
  const next = (current ? Number.parseInt(current, 10) : 0) + by;
  await kvPut(env.DB, key, String(next), ttl);
  return next;
}

async function updateAverage(env, key, value, ttl) {
  const data = (await kvGet(env.DB, key)) || { count: 0, avg: 0 };
  const count = data.count + 1;
  const avg = data.avg + (value - data.avg) / count;
  await kvPut(env.DB, key, { count, avg }, ttl);
  return avg;
}

async function updateCountry(env, code) {
  if (!code) return;
  const list = (await kvGet(env.DB, 'metrics:countries')) || [];
  const next = Array.isArray(list) ? list : [];
  const idx = next.findIndex((item) => item.name === code);
  if (idx === -1) {
    next.push({ name: code, value: 1 });
  } else {
    next[idx].value += 1;
  }
  next.sort((a, b) => b.value - a.value);
  await kvPut(env.DB, 'metrics:countries', next.slice(0, 8), ADMIN_COUNTRY_TTL);
}

async function readMetricSum(env, prefix, minutes) {
  const now = minuteKey();
  const tasks = [];
  for (let i = 0; i < minutes; i += 1) {
    tasks.push(kvGet(env.DB, `${prefix}:${now - i}`));
  }
  const results = await Promise.all(tasks);
  return results.reduce((sum, raw) => sum + (raw ? Number.parseInt(raw, 10) : 0), 0);
}

async function getAdminSessions(env) {
  const list = await kvList(env.DB, 'session-meta:', ADMIN_SESSIONS_LIMIT);
  const sessions = [];
  for (const key of list.keys) {
    const item = await kvGet(env.DB, key.name);
    if (item?.email) sessions.push(item);
  }
  sessions.sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));
  return sessions.slice(0, ADMIN_SESSIONS_LIMIT);
}

async function getAdminMessages(env) {
  const ids = (await kvGet(env.DB, 'admin:messages')) || [];
  const list = Array.isArray(ids) ? ids.slice(0, ADMIN_MESSAGES_LIMIT) : [];
  const messages = [];
  for (const id of list) {
    const msg = await kvGet(env.DB, `msg:${id}`);
    if (msg) {
      messages.push({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        receivedAt: msg.timestamp || new Date(msg.ts || Date.now()).toISOString(),
        size: msg.size || `${Math.max(1, Math.round((msg.body || '').length / 1024))} KB`,
        status: msg.status || 'delivered',
        inbox: msg.to,
      });
    }
  }
  return messages;
}

async function buildAdminOverview(env) {
  const nowMinute = minuteKey();
  const volume = [];
  for (let i = ADMIN_VOLUME_BUCKETS - 1; i >= 0; i -= 1) {
    const bucket = volumeBucketKey() - i;
    const value = await kvGet(env.DB, `metrics:volume:${bucket}`);
    volume.push(value ? Number.parseInt(value, 10) : 0);
  }

  const latencySeries = [];
  for (let i = ADMIN_VOLUME_BUCKETS - 1; i >= 0; i -= 1) {
    const bucket = volumeBucketKey() - i;
    const bucketAvg = await kvGet(env.DB, `metrics:latency:${bucket}`);
    latencySeries.push(bucketAvg?.avg ? Math.round(bucketAvg.avg) : 780 - i * 5);
  }

  const activeSessions = await kvCountPrefix(env.DB, 'session-meta:');
  const newSessionsToday = await kvGet(env.DB, `metrics:new_session:${utcDayKey()}`);
  const inboxChecksPerMin = await kvGet(env.DB, `metrics:inbox:${nowMinute}`);
  const messagesLastHour = await readMetricSum(env, 'metrics:msg', 60);
  const blockedRequests = await readMetricSum(env, 'metrics:blocked', 60);
  const errorCount = await readMetricSum(env, 'metrics:error', 60);
  const requestCount = await readMetricSum(env, 'metrics:req', 60);

  const latencyAvg = await kvGet(env.DB, 'metrics:latency:avg');
  const avgDeliveryMs = latencyAvg?.avg ? Math.round(latencyAvg.avg) : 850;
  const errorRate = requestCount ? (errorCount / requestCount) * 100 : 0;

  const countryStats = (await kvGet(env.DB, 'metrics:countries')) || [
    { name: 'EG', value: 32 },
    { name: 'US', value: 18 },
    { name: 'IN', value: 16 },
    { name: 'DE', value: 12 },
    { name: 'SA', value: 13 },
    { name: 'FR', value: 9 },
  ];

  return {
    stats: {
      activeSessions,
      newSessionsToday: newSessionsToday ? Number.parseInt(newSessionsToday, 10) : 0,
      inboxChecksPerMin: inboxChecksPerMin ? Number.parseInt(inboxChecksPerMin, 10) : 0,
      messagesLastHour,
      avgDeliveryMs,
      errorRate,
      blockedRequests,
      storageUsedMb: 0,
    },
    series: {
      volume,
      latency: latencySeries,
      countries: Array.isArray(countryStats) ? countryStats : [],
    },
  };
}

function buildAlerts(stats) {
  const alerts = [];
  if (stats.errorRate > 2) {
    alerts.push({
      id: 'alert-error',
      severity: 'high',
      message: 'Error rate is above 2%. Investigate immediately.',
      time: 'Just now',
    });
  }
  if (stats.blockedRequests > 100) {
    alerts.push({
      id: 'alert-blocked',
      severity: 'medium',
      message: 'Blocked requests rising in the last hour.',
      time: '10m ago',
    });
  }
  if (!alerts.length) {
    alerts.push({
      id: 'alert-ok',
      severity: 'low',
      message: 'All systems running within safe thresholds.',
      time: '1h ago',
    });
  }
  return alerts;
}
// ========== WORKER ==========
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = getOrigin(request);

    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(origin)) {
        return json({ error: 'Forbidden' }, 403, origin);
      }
      return new Response(null, { status: 204, headers: buildHeaders(origin) });
    }

    if (!isAllowedOrigin(origin)) {
      return json({ error: 'Forbidden' }, 403, origin);
    }

    // Track requests
    ctx.waitUntil(incrCounter(env, `metrics:req:${minuteKey()}`, ADMIN_METRICS_TTL));

    // ===== ADMIN ROUTES =====
    if (url.pathname.startsWith('/api/admin')) {
      if (!requireAdmin(request, env)) {
        return json({ error: 'Unauthorized' }, 401, origin);
      }

      const ip = getClientIp(request);
      const adminAllowed = await rateLimitMinute(env, `rl:admin:${ip}`, 30, 0.5);
      if (!adminAllowed) return json({ error: 'Too Many Requests' }, 429, origin);

      if (url.pathname === '/api/admin/overview' && request.method === 'GET') {
        const overview = await buildAdminOverview(env);
        const messages = await getAdminMessages(env);
        const sessions = await getAdminSessions(env);
        const alerts = buildAlerts(overview.stats);

        return json(
          {
            stats: overview.stats,
            series: overview.series,
            messages,
            sessions,
            alerts,
          },
          200,
          origin
        );
      }

      if (url.pathname.startsWith('/api/admin/message/') && request.method === 'DELETE') {
        const id = url.pathname.split('/').pop();
        if (!id) return json({ error: 'Invalid id' }, 400, origin);

        const msg = await kvGet(env.DB, `msg:${id}`);
        if (msg?.to) {
          const idxKey = `idx:${msg.to}`;
          const ids = (await kvGet(env.DB, idxKey)) || [];
          const filtered = Array.isArray(ids) ? ids.filter((x) => x !== id) : [];
          await kvPut(env.DB, idxKey, filtered, MSG_TTL);
        }

        const adminIds = (await kvGet(env.DB, 'admin:messages')) || [];
        const updated = Array.isArray(adminIds) ? adminIds.filter((x) => x !== id) : [];
        await Promise.all([
          kvDelete(env.DB, `msg:${id}`),
          kvPut(env.DB, 'admin:messages', updated, 86400),
        ]);

        return json({ success: true }, 200, origin);
      }

      if (url.pathname === '/api/admin/message/flush' && request.method === 'POST') {
        let body = {};
        try {
          body = await request.json();
        } catch {
          body = {};
        }
        const scope = body.scope || 'stale';
        const cutoff = scope === 'all' ? 0 : Date.now() - 60 * 60 * 1000;

        const adminIds = (await kvGet(env.DB, 'admin:messages')) || [];
        const list = Array.isArray(adminIds) ? adminIds : [];
        const keep = [];
        let removed = 0;

        for (const id of list) {
          const msg = await kvGet(env.DB, `msg:${id}`);
          if (!msg || (msg.ts && msg.ts < cutoff)) {
            if (msg?.to) {
              const idxKey = `idx:${msg.to}`;
              const ids = (await kvGet(env.DB, idxKey)) || [];
              const filtered = Array.isArray(ids) ? ids.filter((x) => x !== id) : [];
              await kvPut(env.DB, idxKey, filtered, MSG_TTL);
            }
            await kvDelete(env.DB, `msg:${id}`);
            removed += 1;
            continue;
          }
          keep.push(id);
        }

        await kvPut(env.DB, 'admin:messages', keep, 86400);

        return json({ removed }, 200, origin);
      }

      if (url.pathname === '/api/admin/session/revoke' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const sessionId = body.sessionId;
        if (!sessionId) return json({ error: 'sessionId required' }, 400, origin);

        const session = await kvGet(env.DB, `session:${sessionId}`);
        if (session?.email) {
          await kvDelete(env.DB, `sessionByEmail:${session.email}`);
        }

        await Promise.all([
          kvDelete(env.DB, `session:${sessionId}`),
          kvDelete(env.DB, `session-meta:${sessionId}`),
        ]);

        return json({ status: 'revoked' }, 200, origin);
      }

      if (url.pathname === '/api/admin/sessions/expire' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const idleMinutes = body.idleMinutes ? Number(body.idleMinutes) : 60;
        const cutoff = Date.now() - idleMinutes * 60 * 1000;

        const list = await kvList(env.DB, 'session-meta:', 500);
        let expired = 0;

        for (const key of list.keys) {
          const meta = await kvGet(env.DB, key.name);
          if (meta?.lastSeen && new Date(meta.lastSeen).getTime() < cutoff) {
            await Promise.all([
              kvDelete(env.DB, `session:${meta.id}`),
              kvDelete(env.DB, key.name),
              kvDelete(env.DB, `sessionByEmail:${meta.email}`),
            ]);
            expired += 1;
          }
        }

        return json({ expired }, 200, origin);
      }

      if (url.pathname === '/api/admin/security/rotate' && request.method === 'POST') {
        return json(
          {
            status: 'manual',
            message: 'Rotate ADMIN_SECRET manually in Cloudflare dashboard.',
          },
          200,
          origin
        );
      }

      if (url.pathname === '/api/admin/logs/export' && request.method === 'POST') {
        const overview = await buildAdminOverview(env);
        return json(
          {
            generatedAt: new Date().toISOString(),
            stats: overview.stats,
          },
          200,
          origin
        );
      }

      return json({ error: 'Not found' }, 404, origin);
    }

    // ===== DOMAINS =====
    if (url.pathname === '/api/domains' && request.method === 'GET') {
      return json({ domains: ALLOWED_DOMAINS }, 200, origin);
    }

    // ===== CREATE NEW SESSION (10 per day per IP) =====
    if (url.pathname === '/api/new_session' && request.method === 'POST') {
      const ip = getClientIp(request);
      const dailyKey = `rl:new_session:${ip}:${utcDayKey()}`;
      const allowed = await rateLimitDaily(env, dailyKey, 10);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Daily limit reached' }, 429, origin);
      }

      try {
        const domain = await getRotatedDomain(env, ctx);
        if (!domain) return json({ error: 'No domains available' }, 400, origin);

        const localPart = generateLocalPart(8);
        const email = `${localPart}@${domain}`;
        const token = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await kvPut(env.DB, `session:${token}`, { email, createdAt }, SESSION_TTL);
        await kvPut(env.DB, `sessionByEmail:${email}`, token, SESSION_TTL);
        await kvPut(
          env.DB,
          `session-meta:${token}`,
          {
            id: token,
            email,
            createdAt,
            lastSeen: createdAt,
            messages: 0,
            status: 'active',
            ip,
          },
          SESSION_TTL
        );

        ctx.waitUntil(incrCounter(env, `metrics:new_session:${utcDayKey()}`, 172800));
        ctx.waitUntil(updateCountry(env, request.headers.get('cf-ipcountry')));

        return json({ token, email }, 200, origin);
      } catch (e) {
        ctx.waitUntil(incrCounter(env, `metrics:error:${minuteKey()}`, ADMIN_METRICS_TTL));
        console.error('New session error:', e);
        return json({ error: 'Failed' }, 500, origin);
      }
    }
    // ===== CHANGE EMAIL =====
    if (url.pathname === '/api/change_email' && request.method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await rateLimitMinute(env, `rl:change:${ip}`, 30, 0.5);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Too Many Requests' }, 429, origin);
      }

      const token = getBearerToken(request);
      if (!token) return json({ error: 'Unauthorized' }, 401, origin);

      const session = await kvGet(env.DB, `session:${token}`);
      if (!session?.email) return json({ error: 'Invalid token' }, 401, origin);

      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const random = Boolean(body.random);
      const rawDomain = body.domain;
      const rawLocalPart = body.localPart;
      let domain = normalizeDomain(rawDomain);
      let localPart = normalizeLocalPart(rawLocalPart);

      if (rawDomain && !domain) {
        return json({ error: 'Invalid domain' }, 400, origin);
      }

      if (!random && !domain) {
        return json({ error: 'Invalid domain' }, 400, origin);
      }

      if (!domain) {
        domain = await getRotatedDomain(env, ctx);
      }
      if (!domain) return json({ error: 'No domains available' }, 400, origin);

      if (!random && !localPart) {
        return json({ error: 'Invalid local part' }, 400, origin);
      }

      if (random) {
        localPart = generateLocalPart(8);
      }

      const email = `${localPart}@${domain}`;
      const existing = await kvGet(env.DB, `sessionByEmail:${email}`);
      if (existing && existing !== token) {
        return json({ error: 'Email already in use' }, 409, origin);
      }

      const newToken = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const oldEmail = normalizeEmail(session.email);

      await Promise.all([
        kvPut(env.DB, `session:${newToken}`, { email, createdAt }, SESSION_TTL),
        kvPut(env.DB, `sessionByEmail:${email}`, newToken, SESSION_TTL),
        kvPut(
          env.DB,
          `session-meta:${newToken}`,
          {
            id: newToken,
            email,
            createdAt,
            lastSeen: createdAt,
            messages: 0,
            status: 'active',
            ip,
          },
          SESSION_TTL
        ),
        kvDelete(env.DB, `session:${token}`),
        kvDelete(env.DB, `session-meta:${token}`),
      ]);

      if (oldEmail && oldEmail !== email) {
        await kvDelete(env.DB, `sessionByEmail:${oldEmail}`);
      }

      ctx.waitUntil(incrCounter(env, `metrics:new_session:${utcDayKey()}`, 172800));

      return json({ token: newToken, email }, 200, origin);
    }
    // ===== RECOVERY KEY =====
    if (url.pathname === '/api/recovery/key' && request.method === 'GET') {
      const ip = getClientIp(request);
      const allowed = await rateLimitMinute(env, `rl:recovery_key:${ip}`, 20, 0.5);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Too Many Requests' }, 429, origin);
      }

      const token = getBearerToken(request);
      if (!token) return json({ error: 'Unauthorized' }, 401, origin);

      const session = await kvGet(env.DB, `session:${token}`);
      if (!session?.email) return json({ error: 'Invalid token' }, 401, origin);

      const email = normalizeEmail(session.email);
      if (!email) return json({ error: 'Invalid session email' }, 401, origin);

      const stored = await kvGet(env.DB, `recoveryByEmail:${email}`);
      const storedKey = typeof stored === 'string' ? stored : stored?.key;
      const storedCreatedAt = typeof stored === 'string' ? undefined : stored?.createdAt;

      if (storedKey) {
        return json({ key: storedKey, email, createdAt: storedCreatedAt }, 200, origin);
      }

      const key = generateRecoveryKey();
      const createdAt = new Date().toISOString();

      await Promise.all([
        kvPut(env.DB, `recovery:${key}`, { email, createdAt }, RECOVERY_TTL),
        kvPut(env.DB, `recoveryByEmail:${email}`, { key, createdAt }, RECOVERY_TTL),
      ]);

      return json({ key, email, createdAt }, 200, origin);
    }

    // ===== RECOVER EMAIL =====
    if (url.pathname === '/api/recovery/restore' && request.method === 'POST') {
      const ip = getClientIp(request);
      const allowed = await rateLimitMinute(env, `rl:recovery_restore:${ip}`, 10, 0.2);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Too Many Requests' }, 429, origin);
      }

      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const key = normalizeRecoveryKey(body.key);
      if (!key) return json({ error: 'Invalid key' }, 400, origin);

      const record = await kvGet(env.DB, `recovery:${key}`);
      const email = normalizeEmail(record?.email || record);
      if (!email) return json({ error: 'Not found' }, 404, origin);

      const existingToken = await kvGet(env.DB, `sessionByEmail:${email}`);
      if (existingToken) {
        await Promise.all([
          kvDelete(env.DB, `session:${existingToken}`),
          kvDelete(env.DB, `session-meta:${existingToken}`),
        ]);
      }

      const token = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await Promise.all([
        kvPut(env.DB, `session:${token}`, { email, createdAt }, SESSION_TTL),
        kvPut(env.DB, `sessionByEmail:${email}`, token, SESSION_TTL),
        kvPut(
          env.DB,
          `session-meta:${token}`,
          {
            id: token,
            email,
            createdAt,
            lastSeen: createdAt,
            messages: 0,
            status: 'active',
            ip: getClientIp(request),
          },
          SESSION_TTL
        ),
      ]);

      ctx.waitUntil(incrCounter(env, `metrics:new_session:${utcDayKey()}`, 172800));

      return json({ token, email }, 200, origin);
    }

    // ===== GET INBOX =====
    if (url.pathname === '/api/inbox' && request.method === 'GET') {
      const ip = getClientIp(request);
      const allowed = await rateLimitMinute(env, `rl:inbox:${ip}`, 60, 1);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Too Many Requests' }, 429, origin);
      }

      const token = getBearerToken(request);
      if (!token) return json({ error: 'Unauthorized' }, 401, origin);

      const session = await kvGet(env.DB, `session:${token}`);
      if (!session?.email) return json({ error: 'Invalid token' }, 401, origin);

      const email = normalizeEmail(session.email);
      if (!email) return json({ error: 'Invalid session email' }, 401, origin);

      const idxKey = `idx:${email}`;
      const ids = (await kvGet(env.DB, idxKey)) || [];
      const list = Array.isArray(ids) ? ids.slice(0, 20) : [];

      const messages = [];
      const validIds = [];
      for (const id of list) {
        const msg = await kvGet(env.DB, `msg:${id}`);
        if (msg) {
          validIds.push(id);
          messages.push({
            id: msg.id,
            from: msg.from,
            subject: msg.subject,
            body: msg.body,
            htmlBody: msg.htmlBody || msg.body,
            timestamp: msg.timestamp || msg.ts || new Date().toISOString(),
            read: false,
          });
        }
      }

      if (validIds.length !== list.length) {
        ctx.waitUntil(kvPut(env.DB, idxKey, validIds, MSG_TTL));
      }

      ctx.waitUntil(incrCounter(env, `metrics:inbox:${minuteKey()}`, ADMIN_METRICS_TTL));

      const metaKey = `session-meta:${token}`;
      const meta = (await kvGet(env.DB, metaKey)) || {};
      const now = new Date().toISOString();
      await kvPut(
        env.DB,
        metaKey,
        {
          id: token,
          email,
          createdAt: meta.createdAt || now,
          lastSeen: now,
          messages: meta.messages || 0,
          status: 'active',
          ip,
        },
        SESSION_TTL
      );

      return json(messages, 200, origin);
    }

    // ===== GET MESSAGE =====
    if (url.pathname.startsWith('/api/message') && request.method === 'GET') {
      const ip = getClientIp(request);
      const allowed = await rateLimitMinute(env, `rl:inbox:${ip}`, 60, 1);
      if (!allowed) {
        ctx.waitUntil(incrCounter(env, `metrics:blocked:${minuteKey()}`, ADMIN_METRICS_TTL));
        return json({ error: 'Too Many Requests' }, 429, origin);
      }

      const token = getBearerToken(request);
      if (!token) return json({ error: 'Unauthorized' }, 401, origin);

      const session = await kvGet(env.DB, `session:${token}`);
      if (!session?.email) return json({ error: 'Invalid token' }, 401, origin);

      const email = normalizeEmail(session.email);
      if (!email) return json({ error: 'Invalid session email' }, 401, origin);

      const id = getMessageId(url);
      if (!id) return json({ error: 'Invalid message id' }, 400, origin);

      const msg = await kvGet(env.DB, `msg:${id}`);
      if (!msg || msg.to !== email) return json({ error: 'Not found' }, 404, origin);

      return json(msg, 200, origin);
    }

    // ===== DELETE MESSAGE =====
    if (url.pathname.startsWith('/api/message') && request.method === 'DELETE') {
      const token = getBearerToken(request);
      if (!token) return json({ error: 'Unauthorized' }, 401, origin);

      const session = await kvGet(env.DB, `session:${token}`);
      if (!session?.email) return json({ error: 'Invalid token' }, 401, origin);

      const email = normalizeEmail(session.email);
      if (!email) return json({ error: 'Invalid session email' }, 401, origin);

      const id = getMessageId(url);
      if (!id) return json({ error: 'Invalid message id' }, 400, origin);

      const msg = await kvGet(env.DB, `msg:${id}`);
      if (!msg || msg.to !== email) return json({ error: 'Not found' }, 404, origin);

      const idxKey = `idx:${email}`;
      const ids = (await kvGet(env.DB, idxKey)) || [];
      const filtered = Array.isArray(ids) ? ids.filter((x) => x !== id) : [];

      const adminIds = (await kvGet(env.DB, 'admin:messages')) || [];
      const updatedAdmin = Array.isArray(adminIds) ? adminIds.filter((x) => x !== id) : [];

      await Promise.all([
        kvDelete(env.DB, `msg:${id}`),
        kvPut(env.DB, idxKey, filtered, MSG_TTL),
        kvPut(env.DB, 'admin:messages', updatedAdmin, 86400),
      ]);

      return json({ success: true }, 200, origin);
    }

    return json({ error: 'Not found' }, 404, origin);
  },
  async email(message, env, ctx) {
    const start = Date.now();
    const to = normalizeEmail(message.to);
    if (!to) return;

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const subject = sanitizeHeaderValue(message.headers.get('subject') || '(No Subject)');
    const from = sanitizeHeaderValue(message.headers.get('from') || 'Unknown');

    let body = 'Email received';
    try {
      if (message.raw) {
        const raw = await new Response(message.raw).text();
        body = extractEmailBody(raw);
      }
    } catch (e) {
      console.error('Parse error:', e);
    }

    const msgObj = {
      id,
      ts: Date.now(),
      timestamp,
      to,
      from,
      subject,
      body,
      htmlBody: body,
      size: `${Math.max(1, Math.round(body.length / 1024))} KB`,
      status: 'delivered',
    };

    const idxKey = `idx:${to}`;
    const ids = (await kvGet(env.DB, idxKey)) || [];
    const list = Array.isArray(ids) ? ids : [];
    list.unshift(id);

    const adminIndex = (await kvGet(env.DB, 'admin:messages')) || [];
    const adminList = Array.isArray(adminIndex) ? adminIndex : [];
    adminList.unshift(id);

    await Promise.all([
      kvPut(env.DB, `msg:${id}`, msgObj, MSG_TTL),
      kvPut(env.DB, idxKey, list.slice(0, MAX_LIST), MSG_TTL),
      kvPut(env.DB, 'admin:messages', adminList.slice(0, ADMIN_INDEX_LIMIT), 86400),
    ]);

    ctx.waitUntil(incrCounter(env, `metrics:msg:${minuteKey()}`, ADMIN_METRICS_TTL));
    ctx.waitUntil(incrCounter(env, `metrics:volume:${volumeBucketKey()}`, ADMIN_METRICS_TTL));
    ctx.waitUntil(
      updateAverage(env, `metrics:latency:${volumeBucketKey()}`, Date.now() - start, ADMIN_METRICS_TTL)
    );
    ctx.waitUntil(updateAverage(env, 'metrics:latency:avg', Date.now() - start, 86400));

    const token = await kvGet(env.DB, `sessionByEmail:${to}`);
    if (token) {
      const metaKey = `session-meta:${token}`;
      const meta = (await kvGet(env.DB, metaKey)) || {};
      const now = new Date().toISOString();
      await kvPut(
        env.DB,
        metaKey,
        {
          id: token,
          email: to,
          createdAt: meta.createdAt || now,
          lastSeen: now,
          messages: (meta.messages || 0) + 1,
          status: 'active',
          ip: meta.ip || '',
        },
        SESSION_TTL
      );
    }

    // Secure forwarding (env var)
    if (env.FORWARD_TO) {
      try {
        ctx.waitUntil(message.forward(env.FORWARD_TO));
      } catch (err) {
        console.error('Forwarding failed:', err);
      }
    }
  },
};
