import { NextResponse } from "next/server";
import { getRedirectUri } from "@/lib/faucet/config";
import { authUrl, challenge, genState, genVerifier, isConfigured } from "@/lib/faucet/x";
import {
  cookieOptions,
  FAUCET_SESSION_COOKIE,
  signSession,
  type XProfile,
} from "@/lib/faucet/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  // Demo mode: no X app configured — inject a sample eligible session so the
  // whole flow is testable.
  if (!isConfigured()) {
    const demo: XProfile = {
      id: "demo",
      username: "prom_miner",
      name: "Demo Miner",
      followers: 420,
      accountAgeDays: 365,
      verified: false,
      verifiedType: null,
      eligible: true,
      reasons: [],
      demo: true,
    };
    const res = NextResponse.redirect(`${origin}/faucet?connected=demo#claim`);
    res.cookies.set(FAUCET_SESSION_COOKIE, signSession(demo), cookieOptions());
    return res;
  }

  const verifier = genVerifier();
  const state = genState();
  const res = NextResponse.redirect(
    authUrl(getRedirectUri(origin), state, challenge(verifier)),
  );
  res.cookies.set("prom_pkce", verifier, cookieOptions(600));
  res.cookies.set("prom_state", state, cookieOptions(600));
  return res;
}
