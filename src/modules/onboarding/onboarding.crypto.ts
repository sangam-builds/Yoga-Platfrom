import crypto from "crypto";

const DEFAULT_DEV_KEY = "zenflow-development-secret-encryption-key-32b!";

function getEncryptionKey(): Buffer {
  const secret = process.env.ONBOARDING_ENCRYPTION_KEY || DEFAULT_DEV_KEY;
  // Derive a fixed 32-byte key using SHA-256 to support any secret string length
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  tag: string;
  keyVersion: string;
}

/**
 * Encrypts sensitive health/limitations data using AES-256-GCM.
 * Never stores or returns plaintext medical data.
 */
export function encryptLimitations(data: unknown, keyVersion: string = "v1"): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const serialized = JSON.stringify(data ?? {});
  let encrypted = cipher.update(serialized, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    tag,
    keyVersion,
  };
}

/**
 * Decrypts AES-256-GCM encrypted limitations payload.
 * Throws if auth tag verification fails (corrupted/tampered data).
 */
export function decryptLimitations<T = any>(payload: {
  encryptedData: string;
  iv: string;
  tag: string;
  keyVersion?: string;
}): T | null {
  if (!payload.encryptedData || !payload.iv || !payload.tag) {
    return null;
  }

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

  let decrypted = decipher.update(payload.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted) as T;
}

/**
 * Safe presentation helper: masks sensitive values for logs or non-sensitive views.
 */
export function maskLimitations(limitations?: string[] | null): { hasLimitations: boolean; count: number } {
  if (!limitations || limitations.length === 0 || (limitations.length === 1 && limitations[0] === "none")) {
    return { hasLimitations: false, count: 0 };
  }
  return { hasLimitations: true, count: limitations.length };
}
