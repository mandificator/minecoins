import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const DOCS_DIR = path.join(process.cwd(), "content", "docs");
const META_PATH = path.join(DOCS_DIR, "_meta.json");

export type MetaPage = { slug: string; title: string };
export type Meta = { pages: MetaPage[] };

export type DocFrontmatter = {
  title: string;
  description?: string;
};

export type Doc = {
  slug: string;
  frontmatter: DocFrontmatter;
  content: string; // markdown body (no frontmatter)
  raw: string; // full file incl. frontmatter
};

export type DocListItem = MetaPage & {
  exists: boolean;
  description?: string;
  order: number;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

function docPath(slug: string): string {
  return path.join(DOCS_DIR, `${slug}.md`);
}

export function readMeta(): Meta {
  try {
    const raw = fs.readFileSync(META_PATH, "utf8");
    const parsed = JSON.parse(raw) as Meta;
    if (!parsed.pages) return { pages: [] };
    return parsed;
  } catch {
    return { pages: [] };
  }
}

export function writeMeta(meta: Meta): void {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + "\n", "utf8");
}

/** Ordered list of pages from _meta.json, with existence + description. */
export function listDocs(): DocListItem[] {
  const meta = readMeta();
  return meta.pages.map((p, i) => {
    const fp = docPath(p.slug);
    let description: string | undefined;
    const exists = fs.existsSync(fp);
    if (exists) {
      try {
        const { data } = matter(fs.readFileSync(fp, "utf8"));
        description = (data as DocFrontmatter).description;
      } catch {
        /* ignore parse errors when listing */
      }
    }
    return { ...p, exists, description, order: i };
  });
}

export function getDoc(slug: string): Doc | null {
  if (!isValidSlug(slug)) return null;
  const fp = docPath(slug);
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as DocFrontmatter,
    content,
    raw,
  };
}

/** All slugs that exist on disk AND are in meta (used for static params). */
export function getAllDocSlugs(): string[] {
  return listDocs()
    .filter((d) => d.exists)
    .map((d) => d.slug);
}

export function firstDocSlug(): string | null {
  const list = listDocs();
  return list.length ? list[0].slug : null;
}

/** prev/next navigation in meta order, only across existing pages. */
export function getAdjacent(slug: string): {
  prev: MetaPage | null;
  next: MetaPage | null;
} {
  const pages = listDocs().filter((d) => d.exists);
  const idx = pages.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? pages[idx - 1] : null,
    next: idx < pages.length - 1 ? pages[idx + 1] : null,
  };
}

function buildRaw(fm: DocFrontmatter, body: string): string {
  return matter.stringify(body, {
    title: fm.title,
    ...(fm.description ? { description: fm.description } : {}),
  });
}

/** Create a new doc and append it to _meta.json. Returns false if it exists. */
export function createDoc(
  slug: string,
  fm: DocFrontmatter,
  body = "",
  order?: number
): { ok: boolean; error?: string } {
  if (!isValidSlug(slug))
    return { ok: false, error: "Invalid slug (use a-z, 0-9, hyphens)." };
  const fp = docPath(slug);
  if (fs.existsSync(fp)) return { ok: false, error: "Page already exists." };

  const content =
    body.trim().length > 0 ? body : `# ${fm.title}\n\nStart writing here.\n`;
  fs.writeFileSync(fp, buildRaw(fm, content), "utf8");

  const meta = readMeta();
  if (!meta.pages.find((p) => p.slug === slug)) {
    const entry: MetaPage = { slug, title: fm.title };
    if (typeof order === "number" && order >= 0 && order <= meta.pages.length) {
      meta.pages.splice(order, 0, entry);
    } else {
      meta.pages.push(entry);
    }
    writeMeta(meta);
  }
  return { ok: true };
}

/** Overwrite an existing doc's frontmatter + body, sync title into meta. */
export function updateDoc(
  slug: string,
  fm: DocFrontmatter,
  body: string
): { ok: boolean; error?: string } {
  if (!isValidSlug(slug)) return { ok: false, error: "Invalid slug." };
  const fp = docPath(slug);
  fs.writeFileSync(fp, buildRaw(fm, body), "utf8");

  const meta = readMeta();
  const page = meta.pages.find((p) => p.slug === slug);
  if (page) {
    page.title = fm.title;
  } else {
    meta.pages.push({ slug, title: fm.title });
  }
  writeMeta(meta);
  return { ok: true };
}

export function deleteDoc(slug: string): { ok: boolean; error?: string } {
  if (!isValidSlug(slug)) return { ok: false, error: "Invalid slug." };
  const fp = docPath(slug);
  if (fs.existsSync(fp)) fs.rmSync(fp);
  const meta = readMeta();
  meta.pages = meta.pages.filter((p) => p.slug !== slug);
  writeMeta(meta);
  return { ok: true };
}

/** Move a page up/down in _meta.json order. dir = -1 (up) | 1 (down). */
export function reorderDoc(slug: string, dir: -1 | 1): { ok: boolean } {
  const meta = readMeta();
  const idx = meta.pages.findIndex((p) => p.slug === slug);
  if (idx === -1) return { ok: false };
  const target = idx + dir;
  if (target < 0 || target >= meta.pages.length) return { ok: true };
  const [item] = meta.pages.splice(idx, 1);
  meta.pages.splice(target, 0, item);
  writeMeta(meta);
  return { ok: true };
}
