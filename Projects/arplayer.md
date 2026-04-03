# 🎬 AR Player — Enterprise Video Hosting & Monetization Platform

> A full-stack SaaS platform for secure video hosting, subscription-based access, multi-site iframe embedding with domain locking, and real-time analytics — built from scratch to production.

![Version](https://img.shields.io/badge/version-4.0.0-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-18-61dafb)
![MySQL](https://img.shields.io/badge/mysql-8.0%2B-orange)
![License](https://img.shields.io/badge/license-private-red)

---

## 📌 Overview

**AR Player** is a production-grade, self-hosted video platform designed for content creators and businesses who need full control over their video content, monetization, and embedding strategy.

Unlike YouTube or Vimeo embeds — where the platform controls your audience — AR Player puts everything in your hands:

- You control **who can watch** (via subscription tiers & paywalls)
- You control **where content is embedded** (cryptographic domain locking)
- You control **ad monetization** (pre-roll, mid-roll, pause ads)
- You control **revenue** (manual payment gateway, coupon system)

It was designed, developed, and deployed end-to-end as a multi-tenant SaaS platform.

---

## 🚀 Live Demo

> 🌐 **Production:** [https://arplayer.smartbillcalculator.online](https://arplayer.smartbillcalculator.online)
> 
> 🔑 **Admin Login:** `/admin/login`  
> 👤 **User Login:** `/user/login`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite** | Lightning-fast build tool & dev server |
| **React Router v6** | Client-side SPA routing |
| **Vanilla CSS (Custom Design System)** | Full custom dark-mode UI, no UI library dependency |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js (v18+)** | Runtime |
| **Express.js v4** | REST API framework |
| **MySQL 8 / MariaDB 10.11** | Relational database |
| **mysql2** | Promise-based MySQL driver with connection pooling |
| **JSON Web Tokens (JWT)** | Dual-token auth (admin + user) |
| **bcryptjs** | Secure password hashing |
| **AES-256-CBC (Node Crypto)** | Embed token encryption |
| **Multer** | File uploads (ad assets, payment proofs) |
| **node-fetch** | Server-side video proxying |
| **nodemailer** | Email notifications |
| **express-rate-limit** | API rate limiting / DDoS protection |
| **PapaParse** | CSV bulk import for videos |

### Infrastructure
| Technology | Purpose |
|---|---|
| **cPanel + Node.js App** | Production hosting |
| **Apache + Passenger** | Process manager (cPanel) |
| **GitHub** | Version control |
| **.htaccess** | MIME type fixes, routing |

---

## ✨ Core Features

### 🔐 Security Architecture
- **Dual JWT System**: Separate short-lived tokens for admins (8h) and long-lived tokens for users (7d)
- **Cryptographic Embed Tokens**: AES-256-CBC encrypted tokens with HMAC integrity checks. The actual video URL is NEVER exposed to the browser.
- **Domain Locking**: Each embed code is locked to a specific authorized domain via HTTP Referer validation + CSP `frame-ancestors` headers. Embedding on an unauthorized domain returns `403 Unauthorized Origin`.
- **Rate Limiting**: API endpoints protected against abuse with `express-rate-limit`
- **DevTools Protection**: Configurable client-side protection against inspect-element abuse
- **Right-Click / Download Prevention**: Configurable per-player settings
- **Auto Subscription Downgrade**: If a subscription expires, the middleware automatically downgrades the user role from `premium → free`

---

### 🎥 Video Player (Custom-Built)
A 1,400+ line fully custom React video player with zero third-party player dependency:

| Feature | Details |
|---|---|
| **Multi-source Support** | HLS, MP4, Backblaze B2, YouTube embed |
| **Adaptive Playback** | Quality selector, playback speed (0.25x–2x) |
| **Full Controls** | Play/Pause, Volume, Seek bar with hover preview, Fullscreen, Picture-in-Picture, Theater Mode |
| **Chapters** | Jump-to-chapter support with chapter markers on seekbar |
| **Subtitles/CC** | WebVTT subtitle support |
| **Skip Buttons** | +10s / -10s skip with animated flash feedback |
| **Keyboard Shortcuts** | Space, Arrow keys, M, F, etc. |
| **Ad Engine** | Pre-roll, Mid-roll, Pause ads — with skip countdown |
| **Paywall** | Configurable free-preview timer, blur effect, upgrade CTA |
| **Watermark** | Configurable floating watermark (text, opacity, position: diagonal, corner) |
| **YouTube Mode** | Full YouTube iframe API integration for YouTube-sourced content |
| **Video Proxy** | All non-YouTube video URLs are proxied through the server to hide source CDN |

---

### 📢 Ad Monetization System

The Ad Manager lets operators configure video-level ad configurations:

| Ad Type | Supported Formats |
|---|---|
| **Pre-roll** | Video URL, Image URL, HTML Code, File Upload |
| **Mid-roll** | Multiple time-triggered video ads with custom skip timers |
| **Pause Ad** | 1-2 image/HTML ads shown when user pauses — with configurable delay & position |

Admin controls: enable/disable per ad type, skippable toggle, skip-after timer, click-through URLs.

---

### 💰 Subscription & Payment System

| Component | Details |
|---|---|
| **Subscription Plans** | Fully configurable plans (price, duration, features, badge) |
| **Free Trial** | Configurable trial period (days) — one-time per user |
| **Manual Payments** | User uploads payment proof screenshot + selects payment method |
| **Admin Approval** | Admin reviews, approves/rejects payments. On approval, subscription is automatically activated. |
| **Coupon System** | Percentage, fixed, free-days, or fully-free coupons with per-user limits and expiry dates |
| **Payment Methods** | Configurable: EasyPaisa, JazzCash, PayPal, Wise, USDT (TRC20), Bank Transfer |
| **Auto Downgrade** | Expired subscriptions automatically flip role to `free` via middleware |

---

### 🔗 Embed Code Generator

The flagship feature. The workflow:

1. Admin selects a **site profile** (an authorized domain) + a **video**.
2. Server generates an **AES-256-CBC encrypted token** containing `videoId`, `siteId`, and optional `expiry`.
3. An `<iframe>` embed code is generated pointing to the AR Player domain.
4. Pasting the iframe into any other website: the server validates the `Referer` header against the site's registered domain. If it doesn't match — the iframe is blocked.
5. The actual video URL is **never sent to the browser** — only streamed through the proxy.

```html
<!-- Generated embed code — domain locked -->
<iframe 
  src="https://arplayer.yourdomain.com/embed?token=<encrypted_token>"
  width="100%" height="600" frameborder="0" allowfullscreen
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  referrerpolicy="strict-origin-when-cross-origin">
</iframe>
```

---

### 📊 Analytics Dashboard

4-tab analytics dashboard with real-time data:

| Tab | Metrics |
|---|---|
| **Overview** | Views today, Ad impressions, Active subscribers, Top videos by views, Recent events feed |
| **Plans** | Per-plan KPIs: active subs, new this month, total revenue, revenue this month. Plan popularity bar chart |
| **Subscribers** | User table (filterable: All/Premium/Trial/Expiring/Expired), Expiring-in-7-days alert, Plan distribution |
| **Revenue** | Today's earnings, MTD revenue, All-time revenue, Per-plan revenue share table, Recent transactions feed. Auto-refreshes every 30 seconds. |

---

### 🏗️ Admin Panel

Protected by JWT authentication. Full CRUD management for:

| Section | Capabilities |
|---|---|
| **Dashboard** | KPI overview, recent activity, quick actions |
| **Site Manager** | Create/edit authorized sites (name, domain) |
| **Video Manager** | Add/edit videos, bulk CSV import, thumbnail, chapters, subtitles |
| **Ad Manager** | Per-video ad configuration (pre-roll, mid-roll, pause) |
| **Embed Generator** | Generate & save embed codes |
| **Subscription Plans** | Create/edit plans with a live drag-and-drop plan builder |
| **User Management** | View users, grant subscriptions, ban/unban accounts |
| **Payment Requests** | Review, approve, or reject payment proofs |
| **Analytics** | Full analytics dashboard (see above) |
| **Settings** | 30+ global settings: watermark, paywall, trial, security, payment methods |
| **CSV Import** | Bulk video import from CSV |

---

### 👤 User Portal

A complete user-facing SPA:

| Page | Features |
|---|---|
| **Register** | Email + password, auto trial activation |
| **Login** | JWT auth, persistent session |
| **Dashboard** | Watch history, watchlist, subscription status |
| **Browse Videos** | Category filter, search, pagination |
| **Watch Video** | Full player with in-player sidebar, keyboard shortcuts panel, profile badge |
| **Watchlist** | Save/remove videos |
| **Subscribe** | Interactive pricing page, coupon application, payment method selection, proof upload |
| **My Subscription** | Active plan details, payment history, trial status |
| **Profile** | Edit username, phone |
| **Change Password** | Secure password update |

---

## 🗄️ Database Schema

**13 tables**, fully relational with foreign keys and cascading deletes:

```
admin_credentials      — Admin login (bcrypt hashed)
site_profiles          — Authorized embedding domains
video_sources          — Videos with metadata
ad_configurations      — Per-video ad settings
embed_sessions         — Token tracking
users                  — User accounts with roles
subscription_plans     — Available subscription plans
user_subscriptions     — User subscription records
coupon_codes           — Discount coupon definitions
coupon_usage_log       — Per-user coupon usage tracking
payment_requests       — Manual payment submissions & review
analytics_events       — View, play, pause, ad events
global_settings        — Platform-wide configuration (30+ keys)
```

---

## 🏛️ Architecture

```
ar-player/
├── client/                    # React SPA (Vite)
│   └── src/
│       ├── pages/             # 24 pages (Admin + User)
│       ├── components/        # VideoPlayer, AdDisplay, AdminLayout, etc.
│       ├── hooks/             # useApi, useUserApi (axios-like wrappers)
│       └── utils/             # Toast notification system
│
└── server/                    # Node.js + Express API
    ├── index.js               # Entry point, static serving, domain-lock middleware
    ├── routes/
    │   ├── admin.js           # ~1200 lines — full admin REST API
    │   ├── user.js            # ~900 lines — user REST API
    │   ├── embed.js           # Embed config + subscription check
    │   └── proxy.js           # Video proxy (hides CDN URLs)
    ├── middleware/
    │   └── auth.js            # JWT middleware (requireAdmin, requireUser, requireActiveSubscription, optionalUser)
    ├── lib/
    │   ├── db.js              # MySQL connection pool
    │   ├── migrate.js         # Auto-migration on startup
    │   └── tokenManager.js    # AES-256-CBC token encrypt/decrypt
    └── dist/                  # Built React app (served in production)
```

---

## 🔒 Key API Endpoints

### Admin API (`/api/admin/*` — JWT protected)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Admin login |
| `GET` | `/analytics` | Dashboard stats |
| `GET` | `/analytics/plans` | Plan performance |
| `GET` | `/analytics/subscribers` | Subscriber management |
| `GET` | `/analytics/revenue` | Revenue dashboard |
| `CRUD` | `/videos` | Video management |
| `CRUD` | `/sites` | Site profile management |
| `CRUD` | `/ads` | Ad configuration |
| `POST` | `/embed/generate` | Generate encrypted embed token |
| `POST` | `/embed/save` | Save embed to library |
| `CRUD` | `/plans` | Subscription plan management |
| `GET` | `/users` | User management |
| `PUT` | `/users/:id/grant` | Grant subscription to user |
| `PUT` | `/users/:id/ban` | Ban/unban user |
| `GET` | `/payments` | Payment request management |
| `PUT` | `/payments/:id/approve` | Approve payment + activate subscription |
| `CRUD` | `/settings` | Global settings management |
| `POST` | `/videos/csv-import` | Bulk video CSV import |

### User API (`/api/user/*` — JWT protected)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register + auto-trial |
| `POST` | `/login` | Login + JWT |
| `GET` | `/profile` | Get profile + subscription |
| `PUT` | `/profile` | Update profile |
| `GET` | `/videos` | Browse videos (with subscription check) |
| `GET` | `/videos/:id/play` | Get embed token for playback |
| `GET` | `/watchlist` | Get/manage watchlist |
| `POST` | `/subscribe` | Submit payment request |
| `GET` | `/subscription` | Get subscription details |

### Embed API (`/api/embed/*` — Public with token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/config?token=...` | Get video config (validates token + referrer) |
| `GET` | `/subscription-check` | Check user's subscription for paywall |

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js v18+
- MySQL 8.0+ or MariaDB 10.11+

### 1. Clone & Install
```bash
git clone https://github.com/Mudasir345/ar-player.git
cd ar-player

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit .env with your DB credentials, JWT secrets, etc.
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ar_player_v4
DB_USER=your_db_user
DB_PASS=your_db_password

NODE_ENV=development
PORT=3001

JWT_SECRET=your-32-char-admin-jwt-secret
USER_JWT_SECRET=your-32-char-user-jwt-secret
TOKEN_ENCRYPT_KEY=your-32char-aes-key!!

PLAYER_BASE_URL=http://localhost:3001
AUTHORIZED_DOMAINS=localhost,127.0.0.1
ENABLE_REFERRER_VALIDATION=false
```

### 3. Initialize Database
```bash
mysql -u root -p < init.sql
```

### 4. Run (Development)
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

### 5. Build (Production)
```bash
cd client && npm run build
# Copy client/dist/* to server/dist/
cd server && node index.js
```

---

## 🚢 Production Deployment (cPanel)

1. Build the React frontend: `cd client && npm run build`
2. Copy `client/dist/*` contents into `server/dist/`
3. Upload `server/` directory to cPanel (e.g., `public_html/arplayer/`)
4. Create MySQL database via cPanel
5. Setup Node.js App in cPanel → set startup file to `index.js`
6. Configure `.env` with production values
7. Run "NPM Install" in cPanel Node.js App panel
8. Start/Restart the application

The server intelligently selects the newest `dist/` folder (compares `index.html` mtime), making both local dev and production deployment work seamlessly.

---

## 🎨 UI Design System

A fully custom dark-mode design system built in pure CSS:

- **Color palette**: Deep navy backgrounds (`#080d18`), electric cyan accent (`#00d4ff`), violet secondary (`#7c3aed`)
- **Typography**: Google Fonts — `Outfit` (headings), `Inter` (body)
- **Design language**: Glassmorphism panels, gradient borders, pulsing status indicators, smooth transitions
- **Responsive**: Mobile sidebar with toggle, responsive grid layouts
- **Animations**: Spinner animations, live-status pulse, skip flash feedback, hover micro-interactions

---

## 📈 Project Stats

| Metric | Value |
|---|---|
| Total source files | 40+ |
| Lines of code (approx.) | ~12,000+ |
| API endpoints | 50+ |
| Database tables | 13 |
| React pages | 24 |
| React components | 15+ |
| Build time | ~3s (Vite) |

---

## 👨‍💻 Developer

**Muhammad Mudasir**  
Full-Stack Developer  
📧 mudasirchoudhry345@gmail.com  
🔗 GitHub: [Mudasir345](https://github.com/Mudasir345/ar-player)

---

> *Built with a focus on security-first design, clean API architecture, and production-grade deployment. Every feature was designed to solve a real business need — from cryptographic video protection to automated subscription lifecycle management.*
