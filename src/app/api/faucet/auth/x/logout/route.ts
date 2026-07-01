import { NextResponse } from "next/server";
import { FAUCET_SESSION_COOKIE } from "@/lib/faucet/session";

export const runtime = "nodejs";

export async function GET() {
  const res = new NextResponse(null, {
    status: 302,
    headers: { Location: "/faucet#claim" },
  });
  res.cookies.set(FAUCET_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
