# 🌿 ZenFlow — Yoga Class Subscription & Wellness Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_SSR-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

A modern, responsive, full-stack **Yoga Class Subscription & Wellness Platform** designed with a calm, premium aesthetic. Built with Next.js App Router, Supabase Authentication & SSR, Prisma ORM with PostgreSQL, and Tailwind CSS.

---

## ✨ Features

- **🧘‍♀️ Serene Wellness Landing Page**:
  - Custom brand identity with Sage Green (`#6B8F71`), Soft Cream (`#F8F7F2`), and Deep Forest Green (`#233D32`).
  - Smooth-scrolling navigation with mobile hamburger menu.
  - Two-column Hero section with trust metrics and schedule highlights.
  - Feature highlights with Lucide icons.
  - Curated Yoga Programs (Hatha, Vinyasa, Power, Meditation, Beginner, Restorative).
  - Transparent Membership Tiers (Free Trial, Monthly, Annual).
  - Certified Instructors showcases & practitioner testimonials.
  - About Us philosophy and studio contact information.

- **🔐 Full-Featured Authentication (Supabase)**:
  - **Google OAuth Single Sign-On** with official branded UI.
  - **Email & Password** signup and login with client-side validation.
  - **Password Strength Meter** with real-time feedback (Weak / Medium / Strong).
  - Accessible inputs with show/hide password toggles and ARIA attributes.
  - Server-side session verification and edge-safe session refresh middleware.
  - OAuth callback route handler (`/auth/callback`).

- **📊 Protected User Dashboard (`/dashboard`)**:
  - Server-side authentication guard with automatic redirect to `/login`.
  - Displays authenticated user's name, email, avatar/initials, and sign-in provider.
  - One-click secure Logout with router cache refresh.

- **🗄️ Comprehensive Database Schema (Prisma 6 + PostgreSQL)**:
  - Complete schema for a production yoga platform (`prisma/schema.prisma`):
    - Users & NextAuth accounts
    - Plans, Subscriptions & Invoices
    - Yoga Classes, Sessions, Poses & Bookings
    - Waitlists, Attendance & Video Event webhooks
    - Gamification: Streaks, Badges & Certificates
    - Journals, Reviews, Notifications & AI Assistant logs
  - Configured for Supabase's transaction-mode pooler and direct migration connections.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) & `@supabase/ssr` |
| **ORM & Database** | [Prisma 6](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (Supabase) |

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma           # Complete PostgreSQL schema (40+ models)
├── public/                     # Static assets & SVG icons
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── auth/callback/      # OAuth and email verification code exchange
│   │   ├── dashboard/          # Protected user profile & dashboard
│   │   ├── login/              # Login page with Google & Email auth
│   │   ├── signup/             # Registration page with strength meter
│   │   ├── globals.css         # Tailwind theme & color variables
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # ZenFlow public landing page
│   ├── components/
│   │   ├── auth/               # AuthCard, LoginForm, SignupForm, GoogleSignInButton, LogoutButton
│   │   ├── landing/            # Navbar, Hero, Features, YogaClasses, Membership, Instructors, AboutUs, Testimonials, Contact, FinalCTA, Footer
│   │   └── ui/                 # Reusable Button and Input primitives
│   ├── lib/
│   │   └── prisma.ts           # Global Prisma Client singleton (hot-reload safe)
│   ├── utils/supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── middleware.ts       # Session refreshing helper
│   │   └── server.ts           # Server component Supabase client
│   └── middleware.ts           # Next.js session refresh middleware
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules (protects all .env files)
├── next.config.ts              # Next.js configuration (Unsplash remote patterns)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18.18+ or v20+
- An active [Supabase](https://supabase.com/) project (free tier works great)

### 2. Clone the Repository

```bash
git clone https://github.com/<your-username>/zenflow-yoga-platform.git
cd zenflow-yoga-platform
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create `.env.local` (read by Next.js) and `.env` (read by Prisma CLI) by copying `.env.example`:

```bash
cp .env.example .env.local
cp .env.example .env
```

Open `.env.local` and `.env` and fill in your Supabase credentials:

```env
# Supabase API (Find in Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"

# PostgreSQL Database Connections (Find in Supabase Dashboard -> Project Settings -> Database)
# Transaction Pooler (port 6543) - used at runtime
DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@<pooler-host>:6543/postgres?pgbouncer=true"

# Direct Connection (port 5432) - used for Prisma migrations
DIRECT_URL="postgresql://postgres.<project-ref>:<db-password>@<pooler-host>:5432/postgres"
```

> **Security Note**: Both `.env` and `.env.local` are already ignored in `.gitignore`. Never commit them to GitHub.

### 5. Push Database Schema to Supabase

Sync the Prisma schema to your PostgreSQL database:

```bash
npm run db:push
```

To browse or manage your database visually in your browser:

```bash
npm run db:studio
```

### 6. Enable Google Authentication (Optional)

In your [Supabase Dashboard](https://supabase.com/dashboard):
1. Navigate to **Authentication** -> **Providers** -> **Google**.
2. Toggle **Enable Google provider**.
3. Add your Google OAuth Client ID and Secret from the [Google Cloud Console](https://console.cloud.google.com/).
4. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` to your Authorized Redirect URIs in Google Cloud Console.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js local development server |
| `npm run build` | Generates Prisma client and creates an optimized production build |
| `npm run start` | Starts the Next.js production server |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run db:generate` | Regenerates the `@prisma/client` types from `schema.prisma` |
| `npm run db:push` | Pushes the schema state directly to the database without migration files |
| `npm run db:migrate` | Runs Prisma development migrations |
| `npm run db:studio` | Launches Prisma Studio GUI at `http://localhost:5555` |

---

## 🧭 Application Routes

| Route | Description | Access |
|---|---|---|
| `/` | ZenFlow landing page (Hero, Classes, Pricing, Instructors, About, Contact) | Public |
| `/login` | Sign-in page with Google SSO and Email/Password | Public |
| `/signup` | Registration page with password strength indicator and Google SSO | Public |
| `/dashboard` | User dashboard displaying member name and session controls | Protected (Authenticated only) |
| `/admin/login` | Dedicated Staff & Administrator Login Portal | Public |
| `/admin` | Admin Management Console & Operational Metrics | Protected (ADMIN Role only) |
| `/admin/users` | RBAC User & Role Management (Promote/Demote Roles) | Protected (ADMIN Role only) |
| `/admin/classes` | Classes & Schedule Management Console | Protected (ADMIN Role only) |
| `/admin/audit` | Security & RBAC Audit Stream | Protected (ADMIN Role only) |
| `/unauthorized` | 403 Access Denied Screen for non-admins | Public |
| `/auth/callback` | OAuth exchange route handler | System / Auth |

---

## 🛡️ Role-Based Access Control (RBAC) & Admin Access

ZenFlow enforces a **Defense-in-Depth** security model across Next.js Edge Middleware and Server Component layout boundaries:

### 1. Default Admin Credentials
For initial deployment or local evaluation, the default administrator can be initialized in one click at `/admin/login` or via CLI:

- **Email**: `admin@zenflow.yoga`
- **Password**: `AdminZenFlow2026!`
- **Role**: `ADMIN`

To provision an admin via CLI directly to PostgreSQL:
```bash
npm run db:admin
# Or specify custom email and name:
npx tsx scripts/create-admin.ts custom-admin@zenflow.yoga "Super Admin"
```

### 2. RBAC Permissions Matrix

| Permission | `ADMIN` | `INSTRUCTOR` | `STUDENT` |
|---|:---:|:---:|:---:|
| `ACCESS_ADMIN` (Admin Portal) | ✅ | ❌ | ❌ |
| `MANAGE_USERS` (View & edit user records) | ✅ | ❌ | ❌ |
| `MANAGE_ROLES` (Promote/demote roles) | ✅ | ❌ | ❌ |
| `MANAGE_CLASSES` (Create & alter classes) | ✅ | ❌ | ❌ |
| `VIEW_AUDIT_LOGS` (Security audit ledger) | ✅ | ❌ | ❌ |
| `TEACH_CLASSES` (Host sessions & mark attendance) | ✅ | ✅ | ❌ |
| `BOOK_CLASSES` (Join & practice) | ✅ | ✅ | ✅ |

### 3. Route Protection Layers

- **Edge Middleware (`src/middleware.ts`)**: Intercepts `/admin/*` paths before route rendering. Unauthenticated requests are immediately routed to `/admin/login`. Authenticated non-admin users (`STUDENT`) are redirected to `/unauthorized`.
- **Server Guard (`src/lib/rbac/server.ts` -> `requireAdmin()`)**: Executes in `src/app/admin/layout.tsx` to verify the user against the database before any admin page or data is serialized.
- **Audit Logging**: Any administrative change (such as promoting a student to instructor or administrator) is cryptographically recorded in the `AuditLog` table.

---

## 👨‍💻 Author

Developed by [Sangam Gupta](https://github.com/sangam-builds) • Built with ❤️ using modern Next.js 16, Supabase & Tailwind CSS

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
