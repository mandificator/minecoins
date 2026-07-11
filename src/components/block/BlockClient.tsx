"use client";

import { useEffect, useRef, useState } from "react";
import Panel, { Corners } from "@/components/ui/Panel";
import { Flaps, UtcClock } from "@/components/dashboard/DashWidgets";

const API = "/api/explorer";
const POLL_MS = 8000;

type Chain = {
  online: boolean;
  message?: string;
  height?: number;
  difficulty?: number;
  networkHashps?: number | null;
  poolHashps?: number | null;
  avgBlockTime?: number | null;
  latest?: { height: number; hash: string; time: number; txCount: number }[];
};

type BlockDetail = {
  height: number;
  hash: string;
  time: number;
  txCount: number;
  size: number;
  miner: string | null;
  reward: number;
};

async function getJson(path: string) {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  return r.json();
}

function fmtInt(n: number | undefined | null) {
  if (n === undefined || n === null) return "—";
  return Math.round(n).toLocaleString("en-US");
}

function hashfmt(h: number | undefined | null) {
  if (!h) return "—";
  const u = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
  let i = 0,
    v = h;
  while (v >= 1000 && i < u.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v.toFixed(2)} ${u[i]}`;
}

function fmtDur(s: number | undefined | null) {
  if (s === undefined || s === null) return "—";
  if (s < 90) return `${Math.round(s)}s`;
  return `${(s / 60).toFixed(1)} min`;
}

/* time elapsed since a unix timestamp, ticking every second */
function useElapsed(sinceUnix: number | undefined) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(id);
  }, []);
  if (!sinceUnix) return "—";
  const s = Math.max(0, Math.round(now - sinceUnix));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
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
    <div className="flex justify-between gap-4 border-b border-line py-1.5">
      <span className="text-fg-dim">{k}</span>
      <span className="break-all text-right font-mono text-fg">{v}</span>
    </div>
  );
}

export default function BlockClient() {
  const [chain, setChain] = useState<Chain | null>(null);
  const [detail, setDetail] = useState<BlockDetail | null>(null);
  const lastDetailHeight = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const c: Chain = await getJson("/chain").catch(() => ({ online: false }));
      if (cancelled) return;
      setChain(c);

      const tip = c.online ? c.height : undefined;
      if (tip !== undefined && tip !== lastDetailHeight.current) {
        lastDetailHeight.current = tip;
        const d = await getJson(`/block/${tip}`).catch(() => null);
        if (!cancelled && d && !d.error) setDetail(d);
      }
    }

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const elapsed = useElapsed(chain?.latest?.[0]?.time);
  const launching = chain && chain.online === false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="dash-title font-bold text-title">PROMETHIUM CHAIN — LIVE</h1>
        <div className="dash-note flex items-baseline gap-4">
          <span>
            <span className="animate-blink text-title">●</span> LIVE
          </span>
          <UtcClock />
        </div>
      </div>
      <p className="mb-8 text-sm text-fg-dim">
        The current tip of the Promethium Chain, straight from the node. Read-only.
      </p>

      {!chain && <p className="dash-note">SYNCING…</p>}

      {launching && (
        <div className="dash-panel relative p-4 text-sm text-fg-dim">
          {chain?.message || "The chain is launching."}
        </div>
      )}

      {chain && chain.online && (
        <div className="grid grid-cols-1 gap-4">
          <section className="dash-panel relative p-5 sm:p-7">
            <Corners />
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="dash-label">CURRENT BLOCK</span>
              <span className="dash-note">confirmed {elapsed} ago</span>
            </div>
            <div className="dash-hero-row block-hero flex flex-wrap items-end gap-y-2 font-bold text-fg">
              <span className="dash-hero-int">
                <Flaps text={`#${fmtInt(chain.height)}`} />
              </span>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile label="DIFFICULTY" value={fmtInt(chain.difficulty)} />
            <Tile label="NETWORK HASHRATE" value={hashfmt(chain.networkHashps)} />
            <Tile label="POOL HASHRATE" value={hashfmt(chain.poolHashps)} sub="stratum.promethium.work" />
            <Tile label="AVG BLOCK TIME" value={fmtDur(chain.avgBlockTime)} />
          </div>

          {detail && (
            <Panel label="LATEST BLOCK" note={`#${fmtInt(detail.height)}`}>
              <Row k="hash" v={detail.hash} />
              <Row k="time" v={new Date(detail.time * 1000).toUTCString()} />
              <Row k="miner" v={detail.miner || "—"} />
              <Row k="reward" v={`${fmtInt(detail.reward)} PROM`} />
              <Row k="transactions" v={String(detail.txCount)} />
              <Row k="size" v={`${detail.size} bytes`} />
            </Panel>
          )}

          <div className="dash-note flex flex-wrap justify-between gap-x-6 border-t border-line pt-3">
            <span>FEED: PROMETHIUM NODE · refreshes every {POLL_MS / 1000}s</span>
            <span>promethium.work/explorer for full history</span>
          </div>
        </div>
      )}
    </div>
  );
}
