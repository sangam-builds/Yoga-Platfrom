import { describe, it } from "node:test";
import assert from "node:assert";
import {
  computeCheckoutSignature,
  verifyCheckoutSignature,
  computeWebhookSignature,
  verifyWebhookSignature,
} from "../../src/modules/payments/providers/razorpay.signature";

describe("Razorpay Pure Signature Helpers", () => {
  const secret = "test_secret_key_123456";
  const orderId = "order_O8w9D5k2Hj9LmK";
  const paymentId = "pay_P4n8M2k9Ls3XyZ";

  it("should compute and verify valid checkout signature", () => {
    const signature = computeCheckoutSignature(orderId, paymentId, secret);
    assert.ok(signature.length === 64);

    const isValid = verifyCheckoutSignature(orderId, paymentId, signature, secret);
    assert.strictEqual(isValid, true);
  });

  it("should reject tampered orderId in checkout verification", () => {
    const signature = computeCheckoutSignature(orderId, paymentId, secret);
    const isValid = verifyCheckoutSignature("order_tampered", paymentId, signature, secret);
    assert.strictEqual(isValid, false);
  });

  it("should reject tampered paymentId in checkout verification", () => {
    const signature = computeCheckoutSignature(orderId, paymentId, secret);
    const isValid = verifyCheckoutSignature(orderId, "pay_tampered", signature, secret);
    assert.strictEqual(isValid, false);
  });

  it("should reject invalid/tampered signature", () => {
    const tampered = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const isValid = verifyCheckoutSignature(orderId, paymentId, tampered, secret);
    assert.strictEqual(isValid, false);
  });

  it("should reject empty inputs gracefully", () => {
    assert.strictEqual(verifyCheckoutSignature("", paymentId, "sig", secret), false);
    assert.strictEqual(verifyCheckoutSignature(orderId, "", "sig", secret), false);
    assert.strictEqual(verifyCheckoutSignature(orderId, paymentId, "", secret), false);
    assert.strictEqual(verifyCheckoutSignature(orderId, paymentId, "sig", ""), false);
  });

  it("should compute and verify valid webhook signature", () => {
    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: paymentId, amount: 149900 } } },
    });

    const signature = computeWebhookSignature(rawBody, secret);
    assert.ok(signature.length === 64);

    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    assert.strictEqual(isValid, true);
  });

  it("should reject webhook with modified body", () => {
    const rawBody = JSON.stringify({ event: "payment.captured", amount: 149900 });
    const signature = computeWebhookSignature(rawBody, secret);

    const tamperedBody = JSON.stringify({ event: "payment.captured", amount: 199900 });
    const isValid = verifyWebhookSignature(tamperedBody, signature, secret);
    assert.strictEqual(isValid, false);
  });

  it("should reject webhook with wrong secret", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = computeWebhookSignature(rawBody, secret);

    const isValid = verifyWebhookSignature(rawBody, signature, "different_secret");
    assert.strictEqual(isValid, false);
  });
});
