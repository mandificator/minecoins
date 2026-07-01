import crypto from "node:crypto";

// HMAC-signed cookie session holding the connected X profile + eligibility, so
// the claim endpoint can trust it without another API round-trip. Reuses the
// site's SESSION_SECRET.

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

export type XProfile = {
  id: string;
  username: string;
  name: string;
  followers: number;
  accountAgeDays: number;
  verified: boolean;
  verifiedType: string | null;
  eligible: boolean;
  reasons: string[];
  demo?: boolean;
};

export const FAUCET_SESSION_COOKIE = "prom_faucet_session";

export function signSession(profile: XProfile): string {
  const payload = Buffer.from(JSON.stringify(profile)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSession(cookie?: string | null): XProfile | null {
  if (!cookie) return null;
  try {
    const [payload, sig] = cookie.split(".");
    if (!payload || !sig) return null;
    const expect = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as XProfile;
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
