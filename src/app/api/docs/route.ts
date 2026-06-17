import { NextResponse, type NextRequest } from "next/server";
import { createDoc, listDocs } from "@/lib/docs";

export const dynamic = "force-dynamic";

// GET /api/docs -> list of pages from _meta.json + existence
export async function GET() {
  return NextResponse.json({ pages: listDocs() });
}

// POST /api/docs -> create a new page (auth enforced in middleware)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.slug !== "string" || typeof body.title !== "string") {
    return NextResponse.json(
      { error: "slug and title are required." },
      { status: 400 }
    );
  }
  const result = createDoc(
    body.slug.trim(),
    { title: body.title.trim(), description: body.description?.trim() || "" },
    typeof body.content === "string" ? body.content : "",
    typeof body.order === "number" ? body.order : undefined
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
