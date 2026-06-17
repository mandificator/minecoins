"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlinkCursor from "@/components/effects/BlinkCursor";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(params.get("next") || "/admin");
        router.refresh();
      } else {
        setError(data?.error || "Login failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <div className="border border-border bg-bg-alt/60">
        <div className="border-b border-border px-3 py-2 font-mono text-xs">
          <span className="text-fg-dim">┌─[</span>
          <span className="uppercase tracking-widest text-neon-green">
            {" "}
            PROMETHIUM CRM{" "}
          </span>
          <span className="text-fg-dim">]─┐</span>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <p className="font-mono text-sm text-fg-dim">
            &gt; authenticate <BlinkCursor className="text-neon-green" />
          </p>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
              Admin password
            </span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-bg px-3 py-2 font-mono text-fg outline-none focus:border-neon-green"
            />
          </label>
          {error && <p className="text-xs text-amber">✗ {error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full border border-neon-green px-4 py-2 text-sm uppercase tracking-wider text-neon-green hover:bg-white/[0.03] disabled:opacity-40"
          >
            [ {busy ? "…" : "LOG IN"} ]
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
