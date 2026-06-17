import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "notify.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/notify -> append a "notify me" email to data/notify.json (local).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    let list: { email: string; at: string }[] = [];
    if (fs.existsSync(FILE)) {
      list = JSON.parse(fs.readFileSync(FILE, "utf8"));
    }
    if (!list.find((e) => e.email === email)) {
      list.push({ email, at: new Date().toISOString() });
      fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
    }
    return NextResponse.json({ ok: true });
  } catch {
    // On read-only hosts (e.g. Vercel) we can't persist. Don't pretend we did.
    return NextResponse.json(
      { error: "Storage is read-only on this host." },
      { status: 503 }
    );
  }
}
