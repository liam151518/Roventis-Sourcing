"use node";

// AES-256-GCM encryption for user-supplied AI API keys.
//
// Master key is read from the ADVISOR_ENCRYPTION_KEY env var
// (32 bytes, base64-encoded). Stored in Convex env, never in code.
//
// For each key we generate a fresh 12-byte IV and store it
// alongside the ciphertext. The GCM auth tag is also stored so
// we can detect tampering. Plaintext keys never leave the
// action runtime - they are decrypted only at the moment of an
// outbound provider call and then dropped from memory.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm" as const;
const KEY_BYTES = 32; // AES-256
const IV_BYTES = 12; // GCM standard
const AUTH_TAG_BYTES = 16;

function getMasterKey(): Buffer {
  const raw = process.env.ADVISOR_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ADVISOR_ENCRYPTION_KEY env var is missing on the Convex deployment. Set it via `npx convex env set ADVISOR_ENCRYPTION_KEY <base64>`."
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `ADVISOR_ENCRYPTION_KEY must be ${KEY_BYTES} bytes (base64-encoded). Got ${buf.length} bytes.`
    );
  }
  return buf;
}

export interface EncryptedKey {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
}

/** Encrypt a plaintext API key. Returns base64 components for storage. */
export function encryptApiKey(plaintext: string): EncryptedKey {
  if (!plaintext || plaintext.length < 8) {
    throw new Error("API key looks invalid (too short).");
  }
  const key = getMasterKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  if (authTag.length !== AUTH_TAG_BYTES) {
    throw new Error("Unexpected GCM auth tag length");
  }
  return {
    ciphertext: ct.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/** Decrypt a stored ciphertext back to the plaintext API key. */
export function decryptApiKey(parts: EncryptedKey): string {
  const key = getMasterKey();
  const iv = Buffer.from(parts.iv, "base64");
  const ct = Buffer.from(parts.ciphertext, "base64");
  const authTag = Buffer.from(parts.authTag, "base64");
  if (iv.length !== IV_BYTES) {
    throw new Error("Invalid IV length");
  }
  if (authTag.length !== AUTH_TAG_BYTES) {
    throw new Error("Invalid auth tag length");
  }
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

/** Build a masked preview like "sk-...AbCd" for UI display. */
export function maskApiKey(plaintext: string): string {
  if (!plaintext) return "";
  // Trim whitespace, then show last 4 chars only
  const trimmed = plaintext.trim();
  if (trimmed.length <= 4) return "****";
  return `...${trimmed.slice(-4)}`;
}

/**
 * Scrub a value that might contain a key from a string (used in error
 * messages / logs). Replaces any contiguous run of letters/digits/dashes
 * of length >= 20 with "***REDACTED***".
 */
export function scrubKeyFromString(input: string): string {
  return input.replace(/[A-Za-z0-9_\-]{20,}/g, "***REDACTED***");
}