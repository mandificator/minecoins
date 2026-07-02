import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const MUTATING = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // pool.promethium.work is the mining-pool subdomain: its root serves /pool.
  const host = req.headers.get("host") || "";
  if (host.startsWith("pool.") && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/pool";
    return NextResponse.rewrite(url);
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  // Protect the CRM pages (login page itself is public).
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect mutating docs API calls (reads stay public for the site).
  if (pathname.startsWith("/api/docs") && MUTATING.has(req.method)) {
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/docs/:path*"],
};
