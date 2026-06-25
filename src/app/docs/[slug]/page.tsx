import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoc, getAdjacent } from "@/lib/docs";
import MarkdownRenderer from "@/components/docs/MarkdownRenderer";
import FaqAccordion from "@/components/docs/FaqAccordion";

const DOC_HEADER_IMAGES_DIR = path.join(process.cwd(), "public", "img", "docs");

function docHeaderImage(slug: string): string | null {
  const fp = path.join(DOC_HEADER_IMAGES_DIR, `${slug}.png`);
  return fs.existsSync(fp) ? `/img/docs/${slug}.png` : null;
}

// Render docs from disk on each request so CRM edits appear immediately
// (on local / VPS) without a rebuild.
export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const doc = getDoc(params.slug);
  if (!doc) return { title: "Not found" };
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const doc = getDoc(params.slug);
  if (!doc) notFound();

  const { prev, next } = getAdjacent(params.slug);
  const headerImage = docHeaderImage(params.slug);

  return (
    <article className="min-w-0">
      <div className="mb-8 text-fg-dim">~/docs/{params.slug}</div>

      {headerImage && (
        <div className="mb-8 flex justify-center">
          <Image
            src={headerImage}
            alt=""
            width={314}
            height={280}
            className="h-auto w-1/3 border-0"
          />
        </div>
      )}

      {params.slug === "faq" ? (
        <FaqAccordion />
      ) : (
        <MarkdownRenderer source={doc.content} />
      )}

      {/* prev / next */}
      <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="glitch-hover text-fg hover:text-title"
          >
            ◂ Prev
            <span className="block text-fg-dim">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="glitch-hover text-right text-fg hover:text-title"
          >
            Next ▸
            <span className="block text-fg-dim">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
