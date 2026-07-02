"use client";

import { useEffect, useState } from "react";

type Json = Record<string, any>;
const API = "/api/pool";

async function getJson(path: string): Promise<Json> {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  return r.json();
}

function fmt(n: number | undefined, d = 4) {
  if (n === undefined || n === null) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: d });
}
function hashfmt(h: number | undefined) {
  if (!h) return "0 H/s";
  const u = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
  let i = 0, v = h;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return `${v.toFixed(2)} ${u[i]}`;
}
function durfmt(s: number | undefined | null) {
  if (s === undefined || s === null) return "—";
  return s < 90 ? `${Math.round(s)}s` : `${(s / 60).toFixed(1)} min`;
}

export default function PoolClient() {
  const [pool, setPool] = useState<Json | null>(null);
  const [top, setTop] = useState<Json[]>([]);
  const [q, setQ] = useState("");
  const [miner, setMiner] = useState<Json | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getJson("").then((d) => { setPool(d.pool || null); setTop(d.top || []); }).catch(() => {});
  }, []);

  async function search(raw?: string) {
    const addr = (raw ?? q).trim();
    if (!addr) return;
    setLoading(true); setErr(""); setMiner(null);
    try {
      const d = await getJson(`/miner/${encodeURIComponent(addr)}`);
      if (d.online === false) setErr("Pool stats warming up — try again shortly.");
      else if (!d.found) setErr(`No pool activity found for that address yet. Mine to the pool with your address as the username.`);
      else setMiner(d);
    } catch { setErr("Lookup failed. Try again."); }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-amber">PROMETHIUM POOL</h1>
      <p className="mb-6 text-sm text-fg-dim">
        Shared PPLNS mining — combine hashpower, earn a proportional share of every
        block the pool finds, paid to your own address. 0% fee. Payouts daily.
      </p>

      {/* connect box */}
      <div className="mb-6 rounded border border-fg-dim/25 p-3 font-mono text-xs text-fg-dim">
        <div className="text-amber">Connect a miner:</div>
        <div>stratum+tcp://stratum.promethium.work:3337</div>
        <div>username = your prom1… payout address · password = anything</div>
      </div>

      {/* default pool stats */}
      {pool && (
        <div className="mb-8 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-3">
          <Stat label="POOL HASHRATE" value={hashfmt(pool.hashrate)} />
          <Stat label="ACTIVE MINERS" value={fmt(pool.active_miners, 0)} />
          <Stat label="TOTAL MINERS" value={fmt(pool.miners, 0)} />
          <Stat label="BLOCKS FOUND" value={fmt(pool.blocks_won, 0)} />
          <Stat label="AVG BLOCK TIME" value={durfmt(pool.avg_block_time)} />
          <Stat label="PROM PAID OUT" value={fmt(pool.total_paid, 2)} />
          <Stat label="PENDING PAYOUT" value={fmt(pool.total_pending, 2)} />
        </div>
      )}

      {/* search */}
      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="mb-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="your prom1… address — see what you'll be paid + what you've received"
          className="flex-1 rounded border border-fg-dim/40 bg-transparent px-3 py-2 font-mono text-sm text-fg outline-none focus:border-amber"
        />
        <button type="submit" className="rounded border border-amber px-4 py-2 text-sm font-bold text-amber hover:bg-amber/10">
          CHECK
        </button>
      </form>

      {loading && <p className="text-sm text-fg-dim">Looking…</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}

      {miner && (
        <div className="mb-8 rounded border border-amber/40 p-4 font-mono text-sm">
          <div className="mb-2 break-all text-xs text-fg-dim">{miner.address}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="PENDING (NEXT PAYOUT)" value={`${fmt(miner.pending)} PROM`} />
            <Stat label="RECEIVED TO DATE" value={`${fmt(miner.paid)} PROM`} />
            <Stat label="YOUR HASHRATE" value={hashfmt(miner.hashrate)} />
          </div>
          <p className="mt-3 text-xs text-fg-dim">
            Pending is what you'll receive at the next daily payout (once ≥ 0.1 PROM).
            Received is your total paid so far.
          </p>
        </div>
      )}

      {/* top earners */}
      {top.length > 0 && !miner && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-amber">TOP MINERS</h2>
          <div className="font-mono text-xs">
            <div className="flex justify-between border-b border-fg-dim/20 py-1 text-fg-dim">
              <span>address</span><span>paid + pending</span>
            </div>
            {top.map((m, i) => (
              <button key={m.address} onClick={() => { setQ(m.address); search(m.address); }}
                className="flex w-full justify-between gap-3 border-b border-fg-dim/10 py-1 text-left hover:text-amber">
                <span className="text-fg-dim">#{i + 1}</span>
                <span className="flex-1 truncate">{m.address}</span>
                <span className="text-amber">{fmt(m.paid + m.pending, 2)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-fg-dim/20 pt-4 text-xs text-fg-dim">
        Agent setup: <a href="/downloads/pool-skill.md" className="text-amber hover:underline">pool-skill.md</a>
        {" · "}<a href="/docs/mining-pool" className="text-amber hover:underline">docs</a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-fg-dim/25 p-2">
      <div className="text-[10px] text-fg-dim">{label}</div>
      <div className="truncate text-amber">{value}</div>
    </div>
  );
}
