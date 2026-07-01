import { NextResponse } from "next/server";
import { FAUCET_SESSION_COOKIE } from "@/lib/faucet/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(`${origin}/faucet#claim`);
  res.cookies.set(FAUCET_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
