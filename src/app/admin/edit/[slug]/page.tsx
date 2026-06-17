"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MarkdownRenderer from "@/components/docs/MarkdownRenderer";

type Mode = "split" | "edit";

export default function EditPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<Mode>("split");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/docs/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setStatus(d.error);
        } else {
          setTitle(d.frontmatter?.title || "");
          setDescription(d.frontmatter?.description || "");
          setContent(d.content || "");
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const save = useCallback(async () => {
    setSaving(true);
    setStatus("");
    const res = await fetch(`/api/docs/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? "✓ Saved." : `✗ ${data?.error || "Save failed."}`);
    setSaving(false);
  }, [slug, title, description, content]);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  if (loading) {
    return <p className="px-4 py-10 text-fg-dim">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 font-mono text-xs">
        <Link href="/admin" className="text-neon-cyan hover:underline">
          ◂ /admin
        </Link>
        <span className="text-fg-dim">~/content/docs/{slug}.md</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === "split" ? "edit" : "split")}
            className="border border-border px-2 py-1 text-fg hover:text-neon-green"
          >
            [ {mode === "split" ? "EDIT ONLY" : "SPLIT"} ]
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="border border-neon-green px-3 py-1 uppercase tracking-wider text-neon-green hover:bg-white/[0.03] disabled:opacity-40"
          >
            [ {saving ? "…" : "SAVE"} ]
          </button>
        </div>
      </div>

      {/* frontmatter */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
            title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-neon-green"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
            description
          </span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-neon-green"
          />
        </label>
      </div>

      <div
        className={`grid gap-4 ${
          mode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className="h-[70vh] w-full resize-none border border-border bg-bg p-4 font-mono text-sm leading-relaxed text-fg outline-none focus:border-neon-green"
        />
        {mode === "split" && (
          <div className="h-[70vh] overflow-y-auto border border-border bg-bg-alt/40 p-4">
            <MarkdownRenderer source={content} />
          </div>
        )}
      </div>

      {status && (
        <p
          className={`mt-3 text-xs ${
            status.startsWith("✓") ? "text-neon-green" : "text-amber"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
