/**
 * Minimal single-password admin auth.
 *
 * A session is a signed token: `<expiry>.<hex-hmac>` where the HMAC is
 * HMAC-SHA256(SESSION_SECRET, expiry). We use the Web Crypto API so the exact
 * same verification runs in both the Edge middleware and Node route handlers.
 */

export const SESSION_COOKIE = "mc_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.SESSION_SECRET || "insecure-dev-secret-change-me";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

/** Constant-time-ish string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmac(expiry);
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiryNum = Number(expiry);
  if (!Number.isFinite(expiryNum) || expiryNum < Date.now()) return false;
  const expected = await hmac(expiry);
  return safeEqual(sig, expected);
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  return safeEqual(input, pw);
}
