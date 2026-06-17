"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Page = {
  slug: string;
  title: string;
  description?: string;
  exists: boolean;
  order: number;
};

export default function AdminHome() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // new page form
  const [showNew, setShowNew] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/docs");
    const data = await res.json();
    setPages(data.pages || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function move(slug: string, dir: "up" | "down") {
    await fetch(`/api/docs/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: dir }),
    });
    load();
  }

  async function remove(slug: string) {
    if (!confirm(`Delete page "${slug}"? This removes the .md file.`)) return;
    await fetch(`/api/docs/${slug}`, { method: "DELETE" });
    load();
  }

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug.trim(), title: newTitle.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setShowNew(false);
      setNewSlug("");
      setNewTitle("");
      router.push(`/admin/edit/${newSlug.trim()}`);
    } else {
      setError(data?.error || "Could not create page.");
    }
  }

  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3 font-mono text-xs">
        <span>
          <span className="text-fg-dim">┌─[</span>
          <span className="uppercase tracking-widest text-neon-green">
            {" "}
            PROMETHIUM CRM{" "}
          </span>
          <span className="text-fg-dim">]─┐</span>
        </span>
        <div className="flex gap-2">
          <Link
            href="/docs"
            className="border border-border px-2 py-1 text-neon-cyan hover:bg-white/[0.03]"
          >
            [ VIEW SITE ↗ ]
          </Link>
          <button
            onClick={logout}
            className="border border-border px-2 py-1 text-amber hover:bg-white/[0.03]"
          >
            [ LOG OUT ]
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg text-fg">Documentation pages</h1>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="border border-neon-green px-3 py-1.5 text-xs uppercase tracking-wider text-neon-green hover:bg-white/[0.03]"
        >
          [ + NEW PAGE ]
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={createPage}
          className="mb-6 space-y-3 border border-border bg-bg-alt/60 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
                Slug (a-z, 0-9, hyphens)
              </span>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="my-new-page"
                className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-neon-green"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
                Title
              </span>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My New Page"
                className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-neon-green"
              />
            </label>
          </div>
          {error && <p className="text-xs text-amber">✗ {error}</p>}
          <button
            type="submit"
            className="border border-neon-green px-3 py-1.5 text-xs uppercase tracking-wider text-neon-green hover:bg-white/[0.03]"
          >
            [ CREATE ]
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-fg-dim">Loading…</p>
      ) : (
        <div className="border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-alt/70 text-left text-xs uppercase tracking-widest text-fg-dim">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p, i) => (
                <tr
                  key={p.slug}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-fg-dim">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2 font-mono text-neon-cyan">
                    {p.slug}
                    {!p.exists && (
                      <span className="ml-2 text-[10px] text-amber">
                        (missing file)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-fg">{p.title}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1 font-mono text-xs">
                      <button
                        onClick={() => move(p.slug, "up")}
                        disabled={i === 0}
                        className="border border-border px-1.5 py-0.5 text-fg hover:text-neon-green disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(p.slug, "down")}
                        disabled={i === pages.length - 1}
                        className="border border-border px-1.5 py-0.5 text-fg hover:text-neon-green disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <Link
                        href={`/admin/edit/${p.slug}`}
                        className="border border-border px-2 py-0.5 text-neon-cyan hover:bg-white/[0.03]"
                      >
                        edit
                      </Link>
                      <button
                        onClick={() => remove(p.slug)}
                        className="border border-border px-2 py-0.5 text-amber hover:bg-white/[0.03]"
                      >
                        del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
