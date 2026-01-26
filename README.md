# Temp Mail SaaS - Next.js 16 Frontend

A secure, fast, and SEO-optimized **Temporary Email Service** built with **Next.js 16**, **Zustand**, **Tailwind CSS v4**, and deployed to **Cloudflare Pages**.

## 🚀 Project Overview

This frontend provides:

- ✨ **Instant disposable email generation** (no signup required)
- 📧 **Real-time email inbox** with 5-second polling
- 🔒 **Secure email viewer** with XSS protection (DOMPurify)
- 🎯 **Programmatic SEO** with dynamic landing pages
- 📱 **Responsive UI** with smooth animations
- 💾 **Session persistence** using localStorage
- 📊 **AdSense integration** (placeholder comments)

## 📁 Project Structure

```
temp-mail-next-js/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global Tailwind styles
│   ├── privacy/                  # Privacy policy page
│   ├── terms/                    # Terms of service page
│   └── temp-mail-for-[service]/  # Dynamic SEO pages
│
├── src/
│   ├── components/               # React components
│   │   ├── Hero/                 # Email display + buttons
│   │   ├── Inbox/                # Email list view
│   │   ├── EmailViewer/          # Sanitized email viewer
│   │   ├── modals/               # Modal components
│   │   └── common/               # Shared UI components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTempMail.ts        # Session management
│   │   ├── useFetchEmails.ts     # Email polling
│   │   ├── useLocalStorage.ts    # localStorage hook
│   │   └── usePolling.ts         # Polling utility
│   │
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts          # Session state
│   │   ├── inboxStore.ts         # Email list state
│   │   └── uiStore.ts            # UI/modal state
│   │
│   ├── api/                      # HTTP client
│   │   ├── client.ts             # Axios instance
│   │   └── endpoints.ts          # API routes
│   │
│   ├── utils/                    # Utility functions
│   │   ├── sanitizer.ts          # DOMPurify wrapper
│   │   ├── formatters.ts         # Date/text formatting
│   │   ├── validators.ts         # Input validation
│   │   └── constants.ts          # App constants
│   │
│   └── types/                    # TypeScript definitions
│       └── index.ts              # API & domain types
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS + Tailwind
├── tsconfig.json                 # TypeScript configuration
├── wrangler.json                 # Cloudflare Pages config
├── _headers                      # CSP & security headers
└── package.json                  # Dependencies & scripts
```

## 🛠️ Tech Stack

### Core

- **Next.js 16.1.4** (App Router, Turbopack)
- **React 19.2.3** (with hooks)
- **TypeScript 5.3.3**
- **Tailwind CSS v4**

### State Management

- **Zustand 5.0.10** (lightweight, no boilerplate)
- **Zustand Persist** (auto-save to localStorage)

### HTTP & Requests

- **Axios 1.7.2** (with interceptors for auth headers)

### Security

- **isomorphic-dompurify 2.11.0** (XSS prevention)

### UI/UX

- **lucide-react 0.408.0** (icons)
- **framer-motion 11.0.8** (animations)
- **date-fns 3.3.1** (date formatting)

### Typography

- **@tailwindcss/typography** (prose styles for emails)

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or later
- npm 10.x or later

### 1. Installation

```bash
# Navigate to project
cd "c:\khaled\اكواد\Temp Mail Next js"

# Dependencies already installed, but to reinstall:
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create `.env.local`:

```env
# Cloudflare Worker API endpoint
NEXT_PUBLIC_API_URL=https://api.tempmail.example.com

# Google AdSense ID (optional)
NEXT_PUBLIC_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

### 3. Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Production Build

```bash
npm run build
npm start
```

### 5. Deploy to Cloudflare Pages

```bash
# Build generates static HTML in ./out/
npm run build

# Upload ./out/ to Cloudflare Pages
# Visit: https://dash.cloudflare.com/
```

## 📚 Key Features

### 1. Session Management (`useTempMail` Hook)

```typescript
const { sessionId, tempMailAddress, changeEmailAddress } = useTempMail();

// On mount: checks localStorage for active session
// If expired or missing: creates new session via API
// Auto-refreshes before 24h expiration
```

### 2. Email Polling (`useFetchEmails` Hook)

```typescript
useFetchEmails({
  enabled: !!sessionId,
  pollingInterval: 5000, // 5 seconds
  onError: handleError,
});

// Polls GET /api/inbox every 5 seconds
// Updates Zustand store in real-time
```

### 3. XSS Protection

```typescript
// sanitizeEmailHTML uses DOMPurify config
const cleanHTML = sanitizeEmailHTML(email.body);
return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;

// Allowed tags: p, a, img, table, code, etc.
// Blocked: script, iframe, event handlers
```

### 4. Zustand Stores

**Auth Store:**

- Session persistence to localStorage
- 24-hour TTL validation
- Methods: `setSession()`, `clearSession()`, `isSessionActive()`

**Inbox Store:**

- Email list management
- Single email selection
- Methods: `addEmail()`, `removeEmail()`, `updateEmail()`

**UI Store:**

- Modal state
- Toast notifications
- Dark mode toggle

### 5. SEO Pages

```typescript
// app/temp-mail-for-[service]/page.tsx
export async function generateStaticParams() {
  return SEO_SERVICES.map((s) => ({ service: s.slug }));
}
// Pre-generates: /temp-mail-for-facebook, /temp-mail-for-instagram, etc.
// Each has unique metadata for better SERP ranking
```

### 6. API Integration

All requests go through Axios with:

- ✅ Automatic auth header injection
- ✅ Session ID management
- ✅ Error handling & retries
- ✅ Timeout: 10 seconds

```typescript
// lib/api/client.ts
const apiClient = new ApiClient();
await apiClient.createNewSession();
await apiClient.getInbox(sessionId);
await apiClient.getEmailDetail(emailId);
await apiClient.deleteEmail(emailId);
```

## 🔒 Security

### CSP Headers (via `_headers`)

```
default-src 'self'
script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self' https://api.tempmail.example.com
frame-src 'self' https://googleads.g.doubleclick.net
```

### XSS Prevention

- DOMPurify sanitizes all email HTML
- No `eval()` or `dangerouslySetInnerHTML` without sanitization
- Event handlers stripped from email content

### Session Security

- Sessions stored in localStorage (not cookies)
- 24-hour expiration
- Auto-refresh before expiration
- Validation on every API call

## 📊 Performance Optimizations

- **Turbopack** enabled for 3-4x faster builds
- **Code splitting** by route
- **Zustand bundle size** < 1KB (gzip)
- **Static export** for Cloudflare Pages (zero cold starts)
- **Lazy loading** of email viewer modal
- **Shimmer skeletons** for loading states

## 🎨 UI Components

### Hero Component

- Large email display
- Copy-to-clipboard button
- Refresh/change email button
- Responsive design

### Inbox List

- Email preview cards
- Sender avatar + name
- Subject & message preview
- Relative time (e.g., "2 hours ago")
- Delete button with confirmation

### Email Viewer

- Full email with sender info
- Sanitized HTML rendering
- Responsive modal/expandable
- Close button

### Ad Slots

- `<AdSlot slot="top" />`
- `<AdSlot slot="middle" />`
- `<AdSlot slot="bottom" />`
- AdSense ID from env vars

## 🔧 Configuration Files

### `next.config.js`

- Static export for Cloudflare Pages
- Image optimization disabled
- Environment variables

### `tailwind.config.js`

- Custom brand colors
- Shimmer animations
- @tailwindcss/typography plugin

### `tsconfig.json`

- Path aliases: `@/*` → `./src/*`
- Strict mode enabled
- ES2020 target

### `_headers`

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 📝 Constants

All configurable values in `src/utils/constants.ts`:

- `EMAIL_POLL_INTERVAL` = 5000ms
- `SESSION_TTL` = 24 hours
- `SEO_SERVICES` = array of landing pages
- `STORAGE_KEYS` = localStorage key names

## 🧪 Development Tips

### Hot Reload

Changes to any `.tsx` or `.ts` file auto-reload (Turbopack)

### Debugging Zustand Store

```typescript
// In browser console
import { useAuthStore } from "@/store/authStore";
useAuthStore.getState(); // See all state
useAuthStore.subscribe((state) => console.log(state)); // Subscribe to changes
```

### Testing Email Content Sanitization

```typescript
import { sanitizeEmailHTML } from "@/utils/sanitizer";
const dirty = '<script>alert("XSS")</script><p>Safe</p>';
const clean = sanitizeEmailHTML(dirty); // returns '<p>Safe</p>'
```

### API Mocking (for development)

Update `NEXT_PUBLIC_API_URL` in `.env.local` to point to your local worker or mock server

## 📞 API Contract

### Expected Backend Endpoints

**POST `/api/new_session`**

```json
// Response
{
  "sessionId": "abc123",
  "tempMailAddress": "user123@tempmail.dev",
  "expiresAt": "2026-01-27T12:00:00Z"
}
```

**GET `/api/inbox?sessionId=abc123`**

```json
// Response
{
  "sessionId": "abc123",
  "emails": [
    {
      "id": "email1",
      "from": "sender@example.com",
      "subject": "Welcome",
      "body": "Plain text",
      "htmlBody": "<p>HTML</p>",
      "timestamp": "2026-01-26T12:00:00Z",
      "read": false
    }
  ],
  "totalCount": 1
}
```

**GET `/api/email/:emailId`**

```json
// Response (full email details)
{
  "id": "email1",
  "from": "sender@example.com",
  "subject": "Welcome",
  "htmlBody": "<p>Full HTML</p>",
  "attachments": []
}
```

**DELETE `/api/email/:emailId`**

```
// Returns 204 No Content
```

## 🚀 Cloudflare Pages Deployment

1. **Build locally:**

   ```bash
   npm run build  # Creates ./out/ directory
   ```

2. **Upload to Cloudflare Pages:**
   - Login to dash.cloudflare.com
   - Select Pages → Connect to Git or Direct Upload
   - Upload the `./out/` folder

3. **Configure domain:**
   - Add custom domain in Cloudflare dashboard
   - Headers are served from `_headers` file

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints:** sm (640px), md (768px), lg (1024px)
- **Touch-friendly** buttons (min 44px height)
- **Optimized for:** iPhone, iPad, Desktop

## 🎯 Future Enhancements

- [ ] Attachment download support
- [ ] Email search/filtering
- [ ] Multiple email addresses (premium feature)
- [ ] Email forwarding rules
- [ ] Dark mode toggle
- [ ] Push notifications for new emails
- [ ] Rate limiting / API key auth
- [ ] Analytics dashboard

## 📄 License

Proprietary SaaS - Temp Mail Service

## ✉️ Support

For questions or issues:

- API Issues: Check `src/api/client.ts`
- UI Issues: Check component files in `src/components/`
- State Management: Check `src/store/`
- Type Issues: Check `src/types/index.ts`

---

**Built with ❤️ using Next.js 16 + Zustand + Tailwind CSS v4**
"# Temp-Mail" 
