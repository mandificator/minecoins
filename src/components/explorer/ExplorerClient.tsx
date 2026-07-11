"use client";

import { useEffect, useState } from "react";
import { Corners } from "@/components/ui/Panel";

type Json = Record<string, any>;

const API = "/api/explorer";

async function getJson(path: string): Promise<Json> {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  return r.json();
}

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function fmtDur(s: number | undefined | null) {
  if (s === undefined || s === null) return "—";
  if (s < 90) return `${Math.round(s)}s`;
  return `${(s / 60).toFixed(1)} min`;
}

function hashfmt(h: number | undefined | null) {
  if (!h) return "—";
  const u = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
  let i = 0, v = h;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return `${v.toFixed(2)} ${u[i]}`;
}

export default function ExplorerClient() {
  const [chain, setChain] = useState<Json | null>(null);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<Json | null>(null);
  const [kind, setKind] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rich, setRich] = useState<Json | null>(null);
  const [showRich, setShowRich] = useState(false);

  useEffect(() => {
    getJson("/chain").then(setChain).catch(() => setChain({ online: false }));
    getJson("/richlist").then(setRich).catch(() => {});
  }, []);

  async function search(raw?: string) {
    const term = (raw ?? q).trim();
    if (!term) return;
    setLoading(true);
    setErr("");
    setResult(null);
    setKind("");
    try {
      let data: Json | null = null;
      let k = "";
      if (/^(prom1|prom)[0-9a-zA-Z]{6,}$/.test(term)) {
        data = await getJson(`/address/${encodeURIComponent(term)}`);
        k = "address";
      } else if (/^\d+$/.test(term)) {
        data = await getJson(`/block/${term}`);
        k = "block";
      } else if (/^[0-9a-fA-F]{64}$/.test(term)) {
        data = await getJson(`/block/${term}`);
        k = "block";
        if (data?.error) {
          data = await getJson(`/tx/${term}`);
          k = "tx";
        }
      } else {
        setErr("Enter a block height, block hash, transaction id, or a prom… address.");
        setLoading(false);
        return;
      }
      if (data?.error) setErr(data.error);
      else if (data?.online === false) setErr(data.message || "Chain is launching.");
      else {
        setResult(data);
        setKind(k);
      }
    } catch {
      setErr("Lookup failed. Try again.");
    }
    setLoading(false);
  }

  const launching = chain && chain.online === false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="dash-title mb-1 font-bold text-title">PROMETHIUM EXPLORER</h1>
      <p className="mb-6 text-sm text-fg-dim">
        Verify it yourself — every block, transaction, and address on the
        Promethium Chain. Read-only.
      </p>
      <p className="mb-6 text-xs text-fg-dim">Chain state is anchored to Solana twice a day — <a href="/imprints" className="text-neon-cyan hover:underline">verify the imprints →</a></p>

      {launching && (
        <div className="dash-panel relative mb-6 p-4 text-sm text-fg-dim">
          The chain is launching — the explorer goes live with Promethium
          mainnet. The tools and API are ready now.
        </div>
      )}

      {chain && chain.online && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="HEIGHT" value={fmt(chain.height)} />
          <Stat label="DIFFICULTY" value={fmt(chain.difficulty)} />
          <Stat label="NET HASHRATE" value={hashfmt(chain.networkHashps)} />
          <Stat label="POOL HASHRATE" value={hashfmt(chain.poolHashps)} />
          <Stat label="AVG BLOCK" value={fmtDur(chain.avgBlockTime)} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="block height / block hash / txid / prom… address"
          className="flex-1 border border-title bg-transparent px-3 py-2 font-mono text-sm text-fg outline-none focus:border-fg"
        />
        <button type="submit" className="dash-label border border-title px-4 py-2 hover:bg-white/[0.06]">
          SEARCH
        </button>
      </form>

      {loading && <p className="text-sm text-fg-dim">Looking…</p>}
      {err && <p className="text-sm text-title">! {err}</p>}

      {result && kind === "address" && <AddressView d={result} />}
      {result && kind === "block" && <BlockView d={result} onOpen={search} />}
      {result && kind === "tx" && <TxView d={result} />}

      {chain && chain.online && chain.latest?.length > 0 && !result && (
        <div className="mt-8">
          <h2 className="dash-label mb-2">LATEST BLOCKS</h2>
          <div className="font-mono text-xs">
            {chain.latest.map((b: Json) => (
              <button
                key={b.hash}
                onClick={() => search(String(b.height))}
                className="flex w-full justify-between border-b border-line py-1.5 text-left hover:text-title"
              >
                <span>#{b.height}</span>
                <span className="text-fg-dim">{b.txCount} tx</span>
                <span className="text-fg-dim">{new Date(b.time * 1000).toUTCString().slice(17, 25)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {rich && rich.online && rich.top?.length > 0 && !result && (
        <div className="mt-8">
          <button onClick={() => setShowRich((v) => !v)} className="dash-label mb-2 hover:underline">
            RICH LIST — TOP HOLDERS {showRich ? "▾" : "▸"}
          </button>
          {showRich && (
            <div className="font-mono text-xs">
              <div className="mb-1 text-fg-dim">
                {rich.holders} holders · {fmt(rich.totalMined)} PROM mined
              </div>
              {rich.top.slice(0, 25).map((h: Json) => (
                <button
                  key={h.address}
                  onClick={() => search(h.address)}
                  className="flex w-full justify-between gap-3 border-b border-line py-1 text-left hover:text-title"
                >
                  <span className="text-fg-dim">#{h.rank}</span>
                  <span className="flex-1 truncate">{h.address}</span>
                  <span className="text-title">{fmt(h.balance)}</span>
                  <span className="text-fg-dim">{h.pct}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 border-t border-line pt-4 text-xs text-fg-dim">
        Use it from your agent:{" "}
        <a href="/downloads/explorer-skill.md" className="text-title hover:underline">
          download explorer-skill.md
        </a>{" "}
        ·{" "}
        <a href="/docs/explorer" className="text-title hover:underline">
          explorer documentation
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-panel relative p-2">
      <Corners />
      <div className="dash-note">{label}</div>
      <div className="truncate text-title">{value}</div>
    </div>
  );
}

function Row({ k, v, mono = true }: { k: string; v: any; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5">
      <span className="text-fg-dim">{k}</span>
      <span className={`text-right ${mono ? "font-mono" : ""} break-all text-fg`}>{String(v)}</span>
    </div>
  );
}

function BlockView({ d, onOpen }: { d: Json; onOpen: (q: string) => void }) {
  return (
    <div className="text-sm">
      <h2 className="dash-label mb-2">BLOCK #{d.height}</h2>
      <Row k="hash" v={d.hash} />
      <Row k="time" v={new Date(d.time * 1000).toUTCString()} />
      <Row k="miner" v={d.miner || "—"} />
      <Row k="reward" v={`${fmt(d.reward)} PROM`} />
      <Row k="transactions" v={d.txCount} />
      <Row k="size" v={`${d.size} bytes`} />
      {d.previousBlockHash && (
        <button onClick={() => onOpen(d.previousBlockHash)} className="dash-note mt-3 hover:underline">
          ◂ previous block
        </button>
      )}
    </div>
  );
}

function TxView({ d }: { d: Json }) {
  return (
    <div className="text-sm">
      <h2 className="dash-label mb-2">TRANSACTION</h2>
      <Row k="txid" v={d.txid} />
      <Row k="confirmations" v={d.confirmations} />
      <Row k="coinbase" v={d.coinbase ? "yes (block reward)" : "no"} />
      <Row k="total out" v={`${fmt(d.totalOut)} PROM`} />
      <div className="mt-3 text-xs text-fg-dim">OUTPUTS</div>
      {(d.vout || []).map((o: Json, i: number) => (
        <Row key={i} k={o.address || o.type || "—"} v={`${fmt(o.value)} PROM`} />
      ))}
    </div>
  );
}

function AddressView({ d }: { d: Json }) {
  return (
    <div className="text-sm">
      <h2 className="dash-label mb-2">ADDRESS</h2>
      <Row k="address" v={d.address} />
      <Row k="balance" v={`${fmt(d.balance)} PROM`} />
      <Row k="unspent outputs" v={d.utxos} />
      <Row k="blocks mined" v={d.minedCount} />
      {d.minedCount > 0 && (
        <Row k="mined block heights" v={(d.minedBlocks || []).join(", ")} />
      )}
      {d.note && <p className="mt-2 text-xs text-fg-dim">{d.note}</p>}
    </div>
  );
}
