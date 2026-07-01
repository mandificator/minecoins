import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/faucet/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protected read of collected submissions. Set FAUCET_ADMIN_TOKEN and call with
// header  x-admin-token: <token>. Disabled entirely when the token is unset.
export async function GET(req: Request) {
  const token = process.env.FAUCET_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "admin_disabled" }, { status: 403 });
  }
  if (req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const submissions = await getSubmissions();
  return NextResponse.json({ count: submissions.length, submissions });
}
