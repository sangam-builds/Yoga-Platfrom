import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { encryptLimitations, decryptLimitations, maskLimitations } from "../onboarding.crypto.ts";

describe("Onboarding Crypto: AES-256-GCM Limitations Encryption", () => {
  test("1. Encrypts and decrypts health limitations correctly", () => {
    const rawData = {
      injuries: ["lower_back", "wrists"],
      pregnancy: false,
      notes: "Recovering from wrist sprain, prefer gentle modifications.",
    };

    const encrypted = encryptLimitations(rawData);

    assert.ok(encrypted.encryptedData);
    assert.ok(encrypted.iv);
    assert.ok(encrypted.tag);
    assert.equal(encrypted.keyVersion, "v1");

    // Plaintext should not appear in raw encrypted fields
    assert.ok(!encrypted.encryptedData.includes("lower_back"));
    assert.ok(!encrypted.encryptedData.includes("wrist"));

    const decrypted = decryptLimitations<typeof rawData>(encrypted);
    assert.deepEqual(decrypted, rawData);
  });

  test("2. Detects tampering and throws error on altered tag or ciphertext", () => {
    const rawData = { injuries: ["knee"] };
    const encrypted = encryptLimitations(rawData);

    // Tamper with encrypted ciphertext
    const tamperedPayload = {
      ...encrypted,
      encryptedData: encrypted.encryptedData.replace(/^[0-9a-f]/, "a"),
    };

    assert.throws(() => {
      decryptLimitations(tamperedPayload);
    });
  });

  test("3. Masks limitations safely for non-sensitive logs/views", () => {
    assert.deepEqual(maskLimitations(null), { hasLimitations: false, count: 0 });
    assert.deepEqual(maskLimitations([]), { hasLimitations: false, count: 0 });
    assert.deepEqual(maskLimitations(["none"]), { hasLimitations: false, count: 0 });
    assert.deepEqual(maskLimitations(["back", "knee"]), { hasLimitations: true, count: 2 });
  });
});
