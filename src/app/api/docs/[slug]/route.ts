import { NextResponse, type NextRequest } from "next/server";
import { deleteDoc, getDoc, reorderDoc, updateDoc } from "@/lib/docs";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

// GET /api/docs/[slug] -> raw content + frontmatter
export async function GET(_req: NextRequest, { params }: Params) {
  const doc = getDoc(params.slug);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    slug: doc.slug,
    frontmatter: doc.frontmatter,
    content: doc.content,
    raw: doc.raw,
  });
}

// PUT /api/docs/[slug] -> overwrite the file, or reorder via { move: "up"|"down" }
export async function PUT(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (body.move === "up" || body.move === "down") {
    reorderDoc(params.slug, body.move === "up" ? -1 : 1);
    return NextResponse.json({ ok: true });
  }

  if (typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }
  const result = updateDoc(
    params.slug,
    { title: body.title.trim(), description: body.description?.trim() || "" },
    typeof body.content === "string" ? body.content : ""
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/docs/[slug]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const result = deleteDoc(params.slug);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
