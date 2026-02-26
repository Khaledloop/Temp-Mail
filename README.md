# Temp Mail Platform - Single Source Documentation

This file is the only maintained project documentation.
All old markdown summary/status/index reports were consolidated into this file.

## 1) What this project is

Temp Mail platform split into two deployables:

1. Frontend app (Next.js 16) for UI, SEO pages, inbox rendering, and client state.
2. Backend worker (Cloudflare Worker) for session/token logic, inbox APIs, email ingest, rate limiting, and admin APIs.

Current frontend repository path:

- `C:\khaled\Code\Temp Mail Next js`

Current backend worker source path (outside this repo):

- `C:\khaled\Code\worker.js`

## 2) Architecture

```text
Browser
  -> Next.js app (Cloudflare Pages/Workers via OpenNext)
      -> Cloudflare Worker API (steep-haze-0f59)
          -> D1 database (DB binding)

Inbound email
  -> Cloudflare Email Routing
      -> Worker.email() handler
          -> D1/KV-like storage keys
          -> shown later in frontend /api/inbox polling
```

Why both Next.js and Worker are used:

- Next.js is best for pages, UI, rendering, SEO, middleware, and frontend app behavior.
- Worker is best for Cloudflare-native serverless APIs and email event handling (`email()` trigger).

## 3) Frontend responsibilities (this repo)

Main responsibilities:

- Render home, inbox, blog, tools, and static SEO pages.
- Manage session/inbox/UI state with Zustand.
- Poll backend inbox API.
- Sanitize email content before rendering.
- Apply middleware headers/redirects.

Important files:

- `app/page.tsx`
- `src/components/home/HomeClient.tsx`
- `src/hooks/useTempMail.ts`
- `src/hooks/useFetchEmails.ts`
- `src/hooks/usePolling.ts`
- `src/api/client.ts`
- `middleware.ts`
- `next.config.js`

Backend endpoint base URL is read from:

- `.env.local` -> `NEXT_PUBLIC_API_URL`

## 4) Backend responsibilities (worker.js)

Main responsibilities in `C:\khaled\Code\worker.js`:

- CORS allowlist validation.
- Session lifecycle:
  - `POST /api/new_session`
  - `POST /api/change_email`
- Recovery key flow:
  - `GET /api/recovery/key`
  - `POST /api/recovery/restore`
- Inbox/message flow:
  - `GET /api/inbox`
  - `GET /api/message/:id`
  - `DELETE /api/message/:id`
- Domain discovery:
  - `GET /api/domains`
- Admin routes under `/api/admin/*`.
- Email ingest via Worker `email()` event.
- Rate limiting per IP and per time window.
- Metrics and lightweight analytics.

## 5) Data layer

D1 schema file in this repo:

- `schema.sql`

Tables:

1. `app_kv`:
   - KV emulation table for keys like session/index/metrics.
2. `sessions`:
   - Declared in schema, but active worker logic uses `app_kv` keys heavily.
3. `emails`:
   - Declared in schema, but active worker logic stores message objects in `app_kv` keys (`msg:*`, `idx:*`).

Note:

- The current worker design behaves as a KV-on-D1 pattern, not purely relational D1 tables.

## 6) Security model

Frontend:

- CSP and security headers in `next.config.js` and `middleware.ts`.
- HTML sanitization with `isomorphic-dompurify` before rendering.

Backend (worker):

- CORS restricted to allowed origins.
- Bearer token auth for user APIs.
- Admin secret check for admin APIs.
- IP-based rate limits.
- Reserved local-part protection and domain allowlist.

## 7) Config and environment

Frontend `.env.local` (example):

```env
NEXT_PUBLIC_API_URL="https://steep-haze-0f59.khaledalpyly0099881.workers.dev"
NEXT_PUBLIC_BASE_URL="https://tempmaillab.com"
NEXT_PUBLIC_SANITY_PROJECT_ID="d4mhb2a4"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2025-02-01"
```

Worker bindings/config:

- `wrangler.json` in this repo is backend-oriented and includes D1 binding `DB`.
- Worker also expects secrets/vars such as:
  - `ADMIN_SECRET`
  - `FORWARD_TO` (optional)
  - `UNLIMITED_EMAIL_CREATION_IPS` (optional)

Frontend Cloudflare runtime config:

- `wrangler.frontend.jsonc`
- `open-next.config.ts`

## 8) Local development

Frontend:

```bash
npm install
npm run dev
```

Preview/deploy frontend on Cloudflare via OpenNext:

```bash
npm run preview
npm run deploy
```

Worker development/deploy is handled from worker project/location (outside this repo).

## 9) Request/response contracts used by frontend

The frontend expects these worker API contracts:

1. `POST /api/new_session`
   - returns `{ token, email }`
2. `GET /api/inbox`
   - auth: `Authorization: Bearer <token>`
   - returns `Email[]`
3. `GET /api/message/:id`
   - returns message object for authenticated inbox owner
4. `DELETE /api/message/:id`
   - returns success status
5. `POST /api/change_email`
   - returns `{ token, email }`
6. `GET /api/domains`
   - returns `{ domains: string[] }`
7. Recovery:
   - `GET /api/recovery/key`
   - `POST /api/recovery/restore`

Frontend mapping is implemented in:

- `src/api/client.ts`

## 10) Frontend folder map

```text
app/                     Next.js app router pages and route handlers
src/api/                 API client and endpoint constants
src/components/          UI components
src/hooks/               Custom hooks for polling/session/data
src/store/               Zustand stores (auth/inbox/ui)
src/utils/               sanitizer/formatters/constants/helpers
public/                  Static assets
```

## 11) Deployment overview

Production services in Cloudflare dashboard:

1. Worker service:
   - API and email ingest
   - example: `steep-haze-0f59`
2. Pages/Next service:
   - frontend web app
   - example: `temp-mail`

Required production checks:

1. `NEXT_PUBLIC_API_URL` points to the correct worker URL.
2. Worker CORS allowlist includes frontend domain.
3. D1 binding (`DB`) exists in worker config.
4. Email routing events are attached to worker `email()` handler.

## 12) Known behavior and limits

From current worker logic:

- Session TTL: 30 days.
- Message retention in KV-like keys: short-lived (`MSG_TTL` currently 15 minutes in code).
- New email creation limits:
  - 2 per minute per IP
  - 30 per day per IP
- Domain rotation across allowed creation domains.

If these values are changed in `worker.js`, update this section.

## 13) Maintenance rule

Documentation policy for this repository:

1. Keep only this file (`README.md`) as the canonical docs.
2. When architecture/config/API changes, update this file in the same change.
3. Do not reintroduce separate status/summary/index markdown files.
