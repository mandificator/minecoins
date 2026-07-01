import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRedirectUri } from "@/lib/faucet/config";
import { exchangeCode, fetchProfile } from "@/lib/faucet/x";
import { cookieOptions, FAUCET_SESSION_COOKIE, signSession } from "@/lib/faucet/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = cookies();
  const savedState = c.get("prom_state")?.value;
  const verifier = c.get("prom_pkce")?.value;

  // Relative Location so redirects land on the public domain even when the app
  // is proxied and sees an internal host.
  const back = (q: string) =>
    new NextResponse(null, { status: 302, headers: { Location: `/faucet?${q}#claim` } });

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    return back("error=oauth_state");
  }

  try {
    const { access_token } = await exchangeCode(code, verifier, getRedirectUri(origin));
    const profile = await fetchProfile(access_token);

    const res = back("connected=1");
    res.cookies.set(FAUCET_SESSION_COOKIE, signSession(profile), cookieOptions());
    res.cookies.set("prom_pkce", "", { path: "/", maxAge: 0 });
    res.cookies.set("prom_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    console.error("[faucet] oauth callback error:", e);
    return back("error=oauth");
  }
}
