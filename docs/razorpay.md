# Razorpay Test Mode Setup & Integration Guide

This document details the configuration, testing workflow, official test credentials, and go-live checklist for the Razorpay Payment Gateway integration on the ZenFlow Yoga Platform.

---

## 1. Environment & Credentials Configuration

In non-production environments (`NODE_ENV=development` or `NODE_ENV=test`), the system enforces that the Razorpay Key ID **must** begin with `rzp_test_`. Any attempt to start with a live key in non-production triggers an immediate runtime exception.

Add the following credentials to your `.env.local` file:

```env
# Razorpay API Credentials (Test Mode)
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your_test_key_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"

# Client-facing Key (Safe for browser bundle)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
```

> **Where to find them:**  
> Log into the [Razorpay Dashboard](https://dashboard.razorpay.com/) → Toggle to **Test Mode** (top-right badge) → **Account & Settings** → **API Keys** → Generate Test Key.

---

## 2. Webhook Configuration (Local Development)

Webhooks allow asynchronous confirmation of payments, failed attempts, and administrative refunds.

1. Start an HTTPS tunnel pointing to your local Next.js server (port 3000):
   ```bash
   ngrok http 3000
   ```
2. In Razorpay Dashboard (**Test Mode**) → **Account & Settings** → **Webhooks** → **Add New Webhook**:
   - **Webhook URL**: `https://<your-ngrok-subdomain>.ngrok-free.app/api/webhooks/razorpay`
   - **Secret**: Enter a secure random string (copy into `RAZORPAY_WEBHOOK_SECRET` in `.env.local`).
   - **Active Events**:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
     - `refund.processed`
3. Click **Save**.

---

## 3. Official Razorpay Test Payment Instruments

Razorpay provides dedicated test card numbers and virtual payment addresses (UPI) for verifying both successful checkout flows and failure handling.

### A. Test Cards

> **Note for Indian Razorpay Accounts:** Razorpay test accounts are domestic by default. Using an international card will result in *"This business accepts domestic (Indian) card payments only"*. Use the **Domestic Visa** or **Domestic RuPay** card below.

| Test Scenario | Card Number | Expiry | CVV | OTP Behavior |
|---|---|---|---|---|
| **Domestic Visa (Success)** | `4100 2800 0000 1007` | Any future date (e.g. `12/30`) | `123` | Any 4+ digit OTP (e.g. `1234`) or click **Submit** |
| **Domestic Mastercard (Success)** | `5555 5100 0008 1006` | Any future date | `123` | Any 4+ digit OTP or click **Submit** |
| **Domestic RuPay (Success)** | `6527 6589 0000 1005` | Any future date | `123` | Any 4+ digit OTP or click **Submit** |
| **Success (International)** | `4012 0000 0000 0002` | Any future date | `123` | Direct success / No OTP (requires International payments enabled) |
| **Insufficient Funds** | `4000 0000 0000 0002` | Any future date | `123` | Fails with Insufficient Funds |
| **Card Declined / Do Not Honor** | `4000 0000 0000 0005` | Any future date | `123` | Fails with Card Declined |
| **3D Secure OTP Failure** | `4111 1111 1111 1111` | Any future date | `123` | Click "Cancel" on bank OTP page |

### B. Test UPI Virtual Payment Addresses (VPA)

| Test Scenario | Virtual Payment Address (VPA) | Behavior |
|---|---|---|
| **Instant Success** | `success@razorpay` | Auto-approves payment |
| **Payment Declined** | `failure@razorpay` | Simulates user or bank decline |

---

## 4. End-to-End Verification Checklist

### Student Journey:
1. Navigate to `/dashboard/membership`.
2. Select **Monthly Flow** (₹1,499/mo) or **10-Class Pack** (₹1,999).
3. Optional: apply promo code `FLOW20` to verify server-side 20% discount calculation.
4. Click **Upgrade to Plan**.
5. In the Razorpay modal, select **Card** (`4111 1111 1111 1111`) or **UPI** (`success@razorpay`).
6. After completion, verify:
   - The **Success Modal** appears with plan name, amount paid, and receipt ID.
   - The Current Plan card immediately updates to **Monthly Flow**, status **ACTIVE**, and Unlimited credits.
   - The billing history table at the bottom of the page logs the transaction.
   - Navigating to the student **Overview** page shows the updated **Membership & Credits** card with renewal date and entitlements.

### Admin Journey:
1. Navigate to `/admin/payments`.
2. Confirm the new transaction appears with customer details, amount, status pill (`SUCCEEDED`), and Razorpay Order/Payment IDs.
3. Open the **Details** drawer to review timeline and gateway identifiers.
4. Test issuing a partial or full refund:
   - Click **Refund** → Enter amount and reason → Confirm.
   - Check that the payment status changes to `REFUNDED` or `PARTIALLY_REFUNDED`.
5. Navigate to `/admin/health`:
   - Verify the Razorpay gateway status is **Healthy**.
   - Review incoming webhook events in the event log.
   - Click **Replay** on an event to verify idempotent replay safety.

---

## 5. Security & Idempotency Architecture

1. **Zero Client Trust**: All pricing, discounts, proration, and currency checks are performed strictly on the server in integer paise.
2. **Signature Integrity**: Cryptographic HMAC-SHA256 signatures are evaluated using constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
3. **Atomic Claim**: Payment verification and webhook handlers call `confirmPaymentAtomically()` inside a single database transaction (`runTransaction`). If the payment was already claimed, duplicate calls return the existing record without double-granting credits or duplicate events.
4. **Credential Isolation**: Client components only receive `NEXT_PUBLIC_RAZORPAY_KEY_ID`. `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are never exposed to the browser.
5. **Redacted Logs**: Pino logging automatically redacts card, UPI, signatures, passwords, and secrets.

---

## 6. Go-Live Production Checklist

Before deploying with live Razorpay credentials:
- [ ] Complete business KYC and activate international payments (if applicable) in Razorpay Dashboard.
- [ ] Generate Live API keys (`rzp_live_...`). Store them in production environment secrets (never commit to git).
- [ ] Configure live webhook endpoint (`https://yourdomain.com/api/webhooks/razorpay`) with dedicated live secret.
- [ ] Verify that the header environment badge in `/admin` transitions from **TEST MODE** (amber) to **PRODUCTION** (green).
- [ ] Conduct a 1-rupee live test transaction and verify receipt delivery.
