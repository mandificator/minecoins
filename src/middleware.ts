import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const MUTATING = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Permissive CORS for the public, read-only explorer API so browser-based tools
// (e.g. the inscription viewer) can fetch tx / witness data cross-origin.
const EXPLORER_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public explorer API: allow cross-origin reads (and answer CORS preflight).
  if (pathname.startsWith("/api/explorer")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: EXPLORER_CORS });
    }
    const res = NextResponse.next();
    for (const [k, v] of Object.entries(EXPLORER_CORS)) res.headers.set(k, v);
    return res;
  }

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
  matcher: ["/", "/admin/:path*", "/api/docs/:path*", "/api/explorer/:path*"],
};
