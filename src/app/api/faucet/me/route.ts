import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession, FAUCET_SESSION_COOKIE } from "@/lib/faucet/session";
import { isConfigured } from "@/lib/faucet/x";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = readSession(cookies().get(FAUCET_SESSION_COOKIE)?.value);
  return NextResponse.json({
    connected: Boolean(profile),
    configured: isConfigured(),
    profile,
  });
}
