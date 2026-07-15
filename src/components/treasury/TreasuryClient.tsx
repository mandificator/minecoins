"use client";

import { useEffect, useState } from "react";
import Panel, { Corners } from "@/components/ui/Panel";
import { Flaps, UtcClock } from "@/components/dashboard/DashWidgets";

const POLL_MS = 20000;

type PromSide =
  | { online: true; bridgeDeposit: { address: string; balance: number; utxos: number } }
  | { online: false; message?: string };

type SolAddr = { role: string; address: string; sol: number; usdc: number; prom: number };

type Treasury = {
  prom: PromSide;
  solana: { mint: string; supply: number; addresses: SolAddr[]; inTheWild: number };
};

function fmt(n: number | undefined | null, d = 2) {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

function short(addr: string) {
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-6)}` : addr;
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="dash-panel relative p-4">
      <Corners />
      <div className="dash-note">{label}</div>
      <div className="dash-stat truncate text-title">{value}</div>
      {sub && <div className="dash-note">{sub}</div>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 last:border-b-0">
      <span className="text-fg-dim">{k}</span>
      <span className="break-all text-right font-mono text-fg">{v}</span>
    </div>
  );
}

export default function TreasuryClient() {
  const [data, setData] = useState<Treasury | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const r = await fetch("/api/treasury", { cache: "no-store" })
        .then((res) => res.json())
        .catch(() => null);
      if (!cancelled && r) setData(r);
    }
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const prom = data?.prom;
  const promOnline = prom && "online" in prom && prom.online;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="dash-title font-bold text-title">TREASURY</h1>
        <div className="dash-note flex items-baseline gap-4">
          <span>
            <span className="animate-blink text-title">●</span> LIVE
          </span>
          <UtcClock />
        </div>
      </div>
      <p className="mb-8 text-sm text-fg-dim">
        Live balances of every protocol-controlled address — the PROM-chain bridge deposit and the
        Solana-side dev, bridge-fee, Relief Fund, and Relief-Fund-stake accounts. Internal, read-only.
      </p>

      {!data && <p className="dash-note">SYNCING…</p>}

      {data && (
        <div className="space-y-10">
          {/* ---------------- PROM CHAIN ---------------- */}
          <section>
            <h2 className="dash-label mb-4">// prom chain</h2>
            {promOnline ? (
              <section className="dash-panel relative p-5 sm:p-7">
                <Corners />
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="dash-label">BRIDGE DEPOSIT</span>
                  <span className="dash-note break-all">
                    {(prom as any).bridgeDeposit.address}
                  </span>
                </div>
                <div className="dash-hero-row flex flex-wrap items-end gap-y-2 font-bold text-fg">
                  <span className="dash-hero-int">
                    <Flaps text={fmt((prom as any).bridgeDeposit.balance, 3)} />
                  </span>
                </div>
                <div className="dash-note mt-1">
                  PROM · {(prom as any).bridgeDeposit.utxos} UTXOs awaiting settlement
                </div>
              </section>
            ) : (
              <div className="dash-panel relative p-4 text-sm text-fg-dim">
                {(prom as any)?.message || "Chain is launching."}
              </div>
            )}
          </section>

          {/* ---------------- SOLANA CHAIN ---------------- */}
          <section>
            <h2 className="dash-label mb-4">// solana chain</h2>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <Tile label="$PROM SPL SUPPLY" value={fmt(data.solana.supply)} sub="fixed cap · 21,000,000" />
              <Tile
                label="HELD BY USERS (EST.)"
                value={fmt(data.solana.inTheWild)}
                sub="supply − known protocol addresses"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.solana.addresses.map((a) => (
                <Panel key={a.address} label={a.role} note={short(a.address)}>
                  <Row k="SOL" v={fmt(a.sol, 4)} />
                  <Row k="USDC" v={fmt(a.usdc, 2)} />
                  <Row k="$PROM" v={fmt(a.prom, 3)} />
                </Panel>
              ))}
            </div>
          </section>

          <div className="dash-note flex flex-wrap justify-between gap-x-6 border-t border-line pt-3">
            <span>FEED: PROMETHIUM NODE + SOLANA MAINNET-BETA RPC · refreshes every {POLL_MS / 1000}s</span>
            <span>read-only · addresses documented in /downloads/bridge-skill.md</span>
          </div>
        </div>
      )}
    </div>
  );
}
