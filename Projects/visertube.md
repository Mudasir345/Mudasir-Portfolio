# ViserTube — Full-Stack Video Streaming Platform

> **Developer:** Mudasir Choudhry &nbsp;|&nbsp; **GitHub:** [github.com/Mudasir345/visertube](https://github.com/Mudasir345/visertube) &nbsp;|&nbsp; **Email:** mudasirchoudhry345@gmail.com

---

## Overview

**ViserTube** is a production-grade, full-stack video streaming and monetization SaaS platform built on Laravel 11. Inspired by the architecture of modern video-sharing platforms, it delivers a complete ecosystem for content creators, advertisers, and platform administrators — offering video hosting, channel management, multi-gateway payments, a dual-mode advertising engine, real-time analytics, and creator monetization — all under one unified codebase.

The platform was designed with scalability, security, and extensibility as first-class concerns, following industry-standard MVC patterns, PSR-4 autoloading, and SOLID principles throughout.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **PHP 8.3** | Server-side runtime |
| **Laravel 11** | MVC application framework |
| **Laravel Sanctum** | API token authentication |
| **Laravel Socialite** | OAuth 2.0 social login (Google, etc.) |
| **Laravel Sanctum** | Stateful / token-based API auth |
| **Eloquent ORM** | Database abstraction & relationships |
| **MySQL** | Primary relational database |
| **Queue (Database Driver)** | Background job processing |
| **php-ffmpeg / php-ffmpeg** | Server-side video processing & transcoding |
| **Intervention Image v3** | Image processing & thumbnail generation |
| **HTMLPurifier (ezyang)** | XSS-safe HTML sanitization |
| **GuzzleHTTP** | External HTTP client for API integrations |
| **PHPMailer / SendGrid / Mailjet** | Transactional email delivery |
| **Twilio / Vonage / MessageBird** | SMS OTP & notification delivery |
| **AWS SDK (S3 + Flysystem)** | Cloud object storage driver |
| **Google Authenticator (TOTP)** | Two-factor authentication |

### Payment Gateways (32 Integrations)
| Category | Gateways |
|---|---|
| **Card / Traditional** | Stripe, Stripe.js, Stripe V3, Authorize.Net, Razorpay, Paystack, PayPal, PayPal SDK, Paytm, 2Checkout, Checkout.com, NMI |
| **Crypto** | BTCPay, Binance, CoinGate, Coinpayments, Coinpayments Fiat, CoinbaseCommerce, Blockchain, NowPayments Hosted, NowPayments Checkout |
| **Regional / Alternative** | bKash, Aamarpay, Cashmaal, Flutterwave, Instamojo, MercadoPago, Mollie, Payeer, PerfectMoney, Skrill, SslCommerz |
| **Manual** | Admin-defined manual payment methods |

### Frontend
| Technology | Purpose |
|---|---|
| **Blade Templates** | Server-side view rendering |
| **Custom CSS Framework** | Proprietary admin + user panel UI |
| **Vanilla JavaScript & jQuery** | DOM interactions, AJAX, infinite scroll |
| **ApexCharts** | Real-time analytics charts |

### DevOps & Infrastructure
| Tool | Purpose |
|---|---|
| **XAMPP / Apache** | Local development server |
| **Composer** | PHP dependency management |
| **npm / package.json** | Frontend asset toolchain |
| **Laravel Artisan** | CLI tooling for migrations, caching, queues |
| **Git / GitHub** | Version control |
| **Laravel Debugbar** | Development profiling |
| **PHPUnit** | Unit & feature testing |
| **Spatie Ignition** | Error reporting & debugging |

---

## System Architecture

```
visertube/
├── index.php               # XAMPP public entry point
├── .htaccess               # Apache URL rewriting
└── core/                   # Laravel application root
    ├── app/
    │   ├── Constants/      # Global status & file-path constants
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   │   ├── Admin/      # 29 admin controllers
    │   │   │   ├── User/       # 16 user/creator controllers
    │   │   │   └── Gateway/    # 32 payment gateway adapters
    │   │   ├── Middleware/     # 15 custom middleware classes
    │   │   └── Helpers/        # Global helper functions
    │   ├── Lib/            # Core libraries (Captcha, FileManager, FormProcessor, GoogleAuthenticator, SocialLogin, etc.)
    │   ├── Models/         # 58 Eloquent models
    │   ├── Notify/         # Multi-channel notification system
    │   ├── Rules/          # Custom Laravel validation rules
    │   ├── Traits/         # Reusable trait mixins (AdsManager, StorageDriver, GlobalStatus, etc.)
    │   └── View/           # Blade view composers
    ├── database/
    │   └── migrations/     # 27 sequential schema migrations
    ├── resources/
    │   └── views/          # Blade templates (admin, user, public)
    └── routes/
        ├── web.php         # Public routes
        ├── user.php        # Authenticated user routes
        ├── admin.php       # Admin panel routes
        └── ipn.php         # Payment IPN callback routes
```

### Route Architecture

| Route Group | Middleware | Scope |
|---|---|---|
| `web.php` | Public | Homepage, video playback, search, embed, ads redirect |
| `user.php` | `auth`, `CheckStatus`, `KycMiddleware` | Creator dashboard, uploads, earnings, advertiser panel |
| `admin.php` | `RedirectIfNotAdmin` | Full platform management |
| `ipn.php` | None (gateway-signed) | Payment provider callbacks |

---

## Database Design

The platform is built on **27 schema migrations** covering all core entities. Key tables:

| Table | Purpose |
|---|---|
| `users` | Creators, advertisers, subscribers — unified user model with KYC, monetization & advertiser status |
| `videos` | Full video metadata: slug, type (upload / embed code / URL), category, visibility, stock flag, shorts flag |
| `video_files` | Multi-resolution file records per video |
| `video_resolutions` | Supported resolution definitions |
| `video_download_resolutions` | Per-video downloadable resolution configs |
| `video_download_links` | External/direct download links per resolution |
| `subtitles` | Multi-language subtitle files per video |
| `video_tags` | Tagging system for search & related video matching |
| `playlists` + `playlist_videos` | Many-to-many playlist management |
| `advertisements` | Full ad config: type, budget, geo-targeting, schedule, campaign link |
| `advertisement_analytics` | Per-ad click & impression tracking |
| `advertisement_reached` | Daily per-user reach counters |
| `advertisement_schedules` | Custom date-range ad scheduling |
| `campaigns` | Advertiser campaign containers with budget management |
| `ad_play_times` | Per-video ad injection timestamps |
| `impressions` | Per-video daily view impression aggregation |
| `user_reactions` | Like/dislike records per user per video |
| `comments` | Threaded comments with parent-child nesting |
| `watch_histories` | Per-user viewing history with session-based deduplication |
| `watch_laters` | User save-for-later queue |
| `subscribers` (follows) | Channel subscription graph |
| `purchased_videos` + `purchased_playlists` + `purchased_plans` | Multi-tier commerce records |
| `plans` + `plan_videos` | Subscription plan definitions |
| `deposits` | Payment deposit lifecycle |
| `withdrawals` | Creator earnings withdrawal lifecycle |
| `transactions` | Unified ledger for all financial events |
| `gateways` + `gateway_currencies` | Payment gateway configuration |
| `support_tickets` + `support_messages` + `support_attachments` | Help desk system |
| `notification_templates` | Admin-managed email/SMS template storage |
| `frontend` | CMS-style page builder content |
| `extensions` | Plugin/extension registry |
| `storages` | External storage driver configuration records |

---

## Core Feature Modules

### 🎬 Video Engine
- **Triple-source video support:** uploaded files, raw embed codes (YouTube, Vimeo, etc.), and direct video URLs — all managed through a unified `video_type` flag
- **Multi-resolution playback** with per-video `VideoFile` records
- **Shorts support** — dedicated vertical short-form video workflow with its own feed, infinite-scroll player, and separate route group
- **Embed player** — publicly embeddable iframe player at `/embed/{id}/{slug}`
- **Custom download modal** — configurable per-video download options with resolution tiers and labeled links
- **Multi-language subtitles** — `.vtt` / `.srt` subtitle tracks per video, per language
- **Tag-based related video algorithm** — matches by category and shared tags with controlled randomization
- **Session-based view deduplication** — 20-minute cooldown window before a repeat visit increments the view counter
- **Trending algorithm** — combines recency (7-day window), manual trending flag, and view count ranking

### 🔴 Advertising Engine (Dual-Mode)

The platform ships with **two parallel ad systems** toggled by a global `ads_module` flag:

**Mode 1 — Simple Ads (Legacy):**
- Click-based and impression-based ad types
- Per-category targeting
- Fixed available-click budget model
- Per-click creator earnings (`per_click_earn`)

**Mode 2 — Advanced Campaign Ads:**
- Advertisers create **Campaigns** (budget containers) and **Ad Sets** inside them
- **4 ad types:** Skippable, Non-Skippable, In-Feed, All-Views / Shorts
- **Geo-targeting:** Target specific countries or globally with country exclusion lists
- **Category targeting:** Target specific video categories or globally with exclusions
- **Custom scheduling:** Run all campaign dates linearly or set custom date-range schedules per ad
- **Daily budget & reach caps:** Ads stop serving once daily reach/engagement limits are hit
- **Campaign payment lifecycle:** Payment must succeed before ads begin serving
- **Eligibility engine:** Real-time per-request ad eligibility check combining campaign status, payment status, date validity, country, category, schedule, and daily reach/engagement caps
- **Analytics dashboard:** Click, impression, and reached-user charts with daily/monthly granularity

### 💰 Monetization & Creator Economy
- **Creator monetization program** with configurable minimum views and subscriber thresholds
- Creators apply for monetization; admin approves or rejects
- **Earnings ledger:** Separate tracking for ad revenue, stock video sales, playlist sales, and plan sales
- **Wallet system** with full withdrawal functionality to multiple payout methods
- **Commission system:** Admin takes configurable percentage on video/playlist/plan sales
- **Interactive earnings chart** — date-range filterable, grouped by day or month

### 📦 Multi-Tier Commerce
- **Stock Videos** — creators list premium individual videos for one-time purchase
- **Purchasable Playlists** — curated collections sold as a bundle with optional subscription gating
- **Subscription Plans** — recurring access to a curated library of videos and playlists (Netflix-style tier)
- **Plan management** — admin and users can create, edit, and assign videos/playlists to plans
- All purchases are validated at playback time with comprehensive eligibility logic

### 🎯 Channel & Community
- Full **channel pages** with about, playlists, shorts, and monthly plan tabs
- **Subscribe / Unsubscribe** with live subscriber count updates (JSON API)
- **Threaded comments** with nested replies, pagination, and real-time reaction state
- **Like / Dislike** with toggle behavior and live counter via JSON API
- **Watch History** with per-user lock toggle and individual/bulk removal
- **Watch Later** queue management
- **User notifications** — in-app notification feed with mark-as-read, delete individual/all, and redirect-on-click

### 🛡️ Security & Auth
- **Multi-factor authentication** via Google Authenticator (TOTP-based 2FA)
- **KYC verification** system with dynamic form builder and document upload
- **Social OAuth login** via Laravel Socialite (Google etc.)
- **Email & SMS OTP verification** — dual-channel identity confirmation
- **CSRF protection** on all state-changing routes
- **Middleware stack:** Session auth, user status check (banned/inactive guard), KYC enforcement, advertiser status gate, maintenance mode bypass, language switching, registration step enforcement
- **XSS protection** via HTMLPurifier on user-submitted content
- **Encrypted file paths** — video file paths are AES-encrypted in the URL to prevent direct enumeration

### 📤 Storage Architecture
- **Multi-driver storage:** Local disk and **AWS S3** (via `league/flysystem-aws-s3-v3`) natively supported
- **Storage pool management** — admin configures multiple storage servers; system distributes uploads across available space
- **Video streaming** — files are served through a secure controller action, not direct filesystem URLs

### 🌍 Internationalization & CMS
- **Multi-language support** — admin-managed language packs switchable per session
- **Page Builder** — CMS-style section editor for the homepage and custom pages
- **Policy pages** — dynamic legal pages (Privacy, Terms, etc.) controlled from the admin panel
- **Cookie consent** — GDPR-compliant cookie notice with persistent acceptance

### 🛠️ Admin Panel (Full Platform Control)
- **Dashboard** — platform-wide statistics
- **User management** — list, filter (active/banned/KYC/email unverified), view login history, adjust balance, send notifications
- **Video management** — approve/reject pending videos, edit metadata, manage resolutions
- **Advertiser management** — approve/reject advertiser applications, review ad sets
- **Subscription plan builder**
- **Payment gateway configuration** — enable/disable any of the 32 gateways, configure keys, set currencies
- **Withdrawal management** — approve/reject creator withdrawal requests
- **Notification center** — send bulk push/email/SMS notifications via templates
- **Report center** — transaction, deposit, and withdrawal reports
- **Support ticket system** — full helpdesk with threaded replies
- **System settings** — general config, SEO, maintenance mode, cron jobs, extension registry
- **Frontend builder** — control homepage sections, sliders, and policy pages

### ⚙️ Background Jobs
- **Cron controller** — handles scheduled tasks (cache clearing, expired ad cleanup, etc.)
- **Database queue driver** — all heavy tasks processed asynchronously

---

## Key Engineering Decisions

### Eloquent Query Scopes
Every core model uses named query scopes extensively, making the codebase highly readable and composable:

```php
Video::published()->public()->regular()->withoutOnlyPlaylist()
    ->withWhereHas('user', fn($q) => $q->active())
    ->with('videoFiles')
    ->paginate(getPaginate());
```

This style — chaining semantic scopes — is consistently applied across all 58 models and all controllers.

### Session-Based View Deduplication
Rather than naive view++ on page load, the platform tracks a per-video session token with a 20-minute TTL:

```php
private function viewsHistory($video) {
    $playedVideos = json_decode(session()->get('played_videos', '[]'), true);
    if (@$playVideo->exp <= now()) {
        $playedVideos[$video->id] = ['id' => $video->id, 'exp' => Carbon::now()->addMinutes(20)->toDateTimeString()];
        session()->put('played_videos', json_encode($playedVideos));
        $video->views += 1;
        $video->save();
    }
}
```

### Real-Time Ad Eligibility Engine
The `Advertisement::eligible()` method is a self-contained eligibility oracle evaluated on every ad-fetch request. It checks six independent conditions in sequence — campaign status, budget availability, country targeting, category targeting, schedule validity, and daily caps — before yielding an ad for display.

### Encrypted Video Paths
Video file IDs are AES-encrypted before being embedded in the frontend, and decrypted server-side on request, preventing sequential enumeration of video assets.

---

## Project Highlights for Portfolio

| Metric | Value |
|---|---|
| **Total PHP Models** | 58 |
| **Total Controllers** | 50+ |
| **Database Migrations** | 27 |
| **Payment Gateway Integrations** | 32 |
| **Middleware Classes** | 15 |
| **Route Files** | 5 (web, user, admin, IPN, console) |
| **Ad Types Supported** | 6 (Skippable, Non-Skippable, In-Feed, All-Views, Shorts, Click/Impression) |
| **Video Source Types** | 3 (Upload, Embed Code, URL) |
| **Storage Backends** | 2 (Local, AWS S3) |
| **Notification Channels** | 3 (In-App, Email, SMS) |
| **Auth Methods** | 3 (Password, Social OAuth, 2FA/TOTP) |

---

## What This Project Demonstrates

- **Full-stack systems design** — end-to-end ownership of a complex, multi-tenant SaaS product
- **Advanced Laravel proficiency** — Eloquent relationships, query scopes, middleware pipelines, job queues, event/notification systems
- **Multi-payment integration** — unified adapter pattern across 32 different payment providers
- **Advertising platform engineering** — geo-targeting, scheduling, budget management, real-time eligibility, and analytics
- **Monetization architecture** — creator economy with multi-stream earnings, subscription commerce, and withdrawal flows
- **Security implementation** — TOTP 2FA, OAuth, KYC, XSS sanitization, encrypted paths, CSRF
- **Database modeling at scale** — 27 migrations with complex many-to-many relations, pivots, and polymorphic patterns
- **Video delivery engineering** — server-side streaming, multi-resolution support, embed code rendering, and shorts infrastructure

---

*Built by Mudasir Choudhry — mudasirchoudhry345@gmail.com — github.com/Mudasir345*
