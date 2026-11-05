import crypto from "crypto";

/**
 * Pure HMAC SHA-256 signature verification functions.
 * Does not import env or external SDKs.
 * Uses constant-time comparison (crypto.timingSafeEqual) to prevent timing attacks.
 */

export function computeHmacSha256(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");

  if (bufA.length === 0 || bufB.length === 0 || bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies Razorpay browser Checkout signature:
 * Expected payload is: `${orderId}|${paymentId}`
 */
export function verifyRazorpayCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const { orderId, paymentId, signature, secret } = params;

  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = computeHmacSha256(payload, secret);

  return timingSafeEqualHex(signature, expectedSignature);
}

/**
 * Verifies Razorpay Webhook signature:
 * Expected payload is the raw unprocessed HTTP request body string.
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret: string;
}): boolean {
  const { rawBody, signature, secret } = params;

  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = computeHmacSha256(rawBody, secret);

  return timingSafeEqualHex(signature, expectedSignature);
}

