# ZenFlow Production Deployment Guide (Vercel)

This repository is pre-configured for automated zero-configuration deployment to **Vercel**.

---

## 1. Quick Vercel Setup

1. **Push your code to GitHub**:
   ```bash
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and sign in.
3. Select your repository (**`minor-project`** or **`zenflow`**) and click **Import**.
4. In the **Environment Variables** section, copy and paste the variables listed in Section 2 below.
5. Click **Deploy**. Vercel will install dependencies, generate the Prisma Client, compile Next.js, and provide your live production URL.

---

## 2. Environment Variables Checklist (Vercel Project Settings)

Add the following environment variables in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Recommended Value / Source | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Transaction Pooler URL (`:6543`) from Supabase | Connects to PostgreSQL pooler with `?pgbouncer=true` |
| `DIRECT_URL` | Session Direct URL (`:5432`) from Supabase | Direct connection used for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` or anon key | Supabase public anonymous key |
| `RAZORPAY_KEY_ID` | `rzp_live_...` (or test `rzp_test_...`) | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Secret from Razorpay Dashboard | Razorpay Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret | Used to verify incoming payments securely |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Matches `RAZORPAY_KEY_ID` | Public key for Razorpay checkout popup |
| `GEMINI_API_KEY` | Key from Google AI Studio | Powers the ZenFlow AI Wellness Assistant |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Default Gemini model |
| `ADMIN_EMAILS` | `admin@zenflow.yoga,your-email@gmail.com` | Comma-separated admin whitelist |

---

## 3. Supabase Authentication Setup

In your [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**:

1. **Site URL**:
   Set to your Vercel deployment URL (e.g. `https://zenflow.vercel.app` or your custom domain `https://zenflow.yoga`).
2. **Redirect URLs**:
   Add the following patterns:
   - `https://zenflow.vercel.app/**`
   - `https://zenflow.vercel.app/auth/callback`
   - `https://*.vercel.app/**` (allows preview deployments to authenticate)

---

## 4. Razorpay Webhook Configuration

In your [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Settings** → **Webhooks**:

1. Click **Add New Webhook**.
2. **Webhook URL**: `https://<your-domain>/api/webhooks/razorpay`
3. **Secret**: Enter your `RAZORPAY_WEBHOOK_SECRET`.
4. **Active Events**:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`

---

## 5. Production Database Migrations

Whenever database schema changes are made, apply them safely to your production Supabase database:

```bash
npx prisma migrate deploy
```

*(Never use `prisma db push` in production as it can cause data loss).*
