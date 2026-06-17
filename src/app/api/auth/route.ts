import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  adminPassword,
  checkPassword,
  createSessionToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = body?.action ?? "login";

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (!adminPassword()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD not configured on the server." },
      { status: 500 }
    );
  }

  if (!checkPassword(String(body?.password ?? ""))) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
