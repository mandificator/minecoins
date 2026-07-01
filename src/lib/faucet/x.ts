import crypto from "node:crypto";
import { faucetConfig } from "./config";
import type { XProfile } from "./session";

// X (Twitter) OAuth 2.0 with PKCE + user lookup. If TWITTER_CLIENT_ID is unset
// the faucet runs in "demo mode" so the whole flow is testable without keys.

const AUTHORIZE = "https://twitter.com/i/oauth2/authorize";
const TOKEN = "https://api.twitter.com/2/oauth2/token";
const ME = "https://api.twitter.com/2/users/me";

export function isConfigured(): boolean {
  return Boolean(process.env.TWITTER_CLIENT_ID);
}

export function genVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function challenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function genState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function authUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "tweet.read users.read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTHORIZE}?${p.toString()}`;
}

export async function exchangeCode(
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    client_id: process.env.TWITTER_CLIENT_ID!,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (process.env.TWITTER_CLIENT_SECRET) {
    const basic = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
    ).toString("base64");
    headers.Authorization = `Basic ${basic}`;
  }
  const res = await fetch(TOKEN, { method: "POST", headers, body });
  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as { access_token: string };
}

export async function fetchProfile(token: string): Promise<XProfile> {
  const url = `${ME}?user.fields=created_at,public_metrics,verified,verified_type`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`users/me failed: ${res.status} ${await res.text()}`);
  const { data } = await res.json();
  return evaluate(data);
}

// Compute eligibility from a raw X user object.
export function evaluate(data: {
  id: string;
  username: string;
  name?: string;
  created_at?: string;
  public_metrics?: { followers_count?: number };
  verified?: boolean;
  verified_type?: string;
}): XProfile {
  const followers = data.public_metrics?.followers_count ?? 0;
  const created = data.created_at ? new Date(data.created_at).getTime() : Date.now();
  const accountAgeDays = Math.max(0, Math.floor((Date.now() - created) / 86_400_000));
  const verifiedType = data.verified_type ?? (data.verified ? "legacy" : null);
  const verified = Boolean(data.verified) && verifiedType !== "none";

  const reasons: string[] = [];
  if (accountAgeDays < faucetConfig.minAccountAgeDays) {
    reasons.push(
      `Account must be at least ${faucetConfig.minAccountAgeDays} days old (yours is ${accountAgeDays}).`,
    );
  }
  if (followers < faucetConfig.minFollowers) {
    reasons.push(
      `Account needs at least ${faucetConfig.minFollowers} followers (yours has ${followers}).`,
    );
  }

  return {
    id: data.id,
    username: data.username,
    name: data.name ?? data.username,
    followers,
    accountAgeDays,
    verified,
    verifiedType,
    eligible: reasons.length === 0,
    reasons,
  };
}
