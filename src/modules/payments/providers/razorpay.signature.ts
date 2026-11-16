import crypto from "node:crypto";

/**
 * Computes HMAC SHA256 signature for Razorpay Checkout verification:
 * HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function computeCheckoutSignature(
  orderId: string,
  paymentId: string,
  secret: string
): string {
  if (!orderId || !paymentId || !secret) {
    return "";
  }
  const payload = `${orderId}|${paymentId}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies Razorpay Checkout signature using constant-time comparison
 * to eliminate timing-attack vulnerabilities.
 */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  const expected = computeCheckoutSignature(orderId, paymentId, secret);
  if (!expected || expected.length !== signature.length) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * Computes HMAC SHA256 signature for raw Razorpay webhook payload:
 * HMAC_SHA256(raw_body, webhook_secret)
 */
export function computeWebhookSignature(rawBody: string, secret: string): string {
  if (!rawBody || !secret) {
    return "";
  }
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * Verifies Razorpay Webhook signature using constant-time comparison.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expected = computeWebhookSignature(rawBody, secret);
  if (!expected || expected.length !== signature.length) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
