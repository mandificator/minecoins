"use client";

import { useEffect, useRef, useState } from "react";
import { Corners } from "@/components/ui/Panel";
import {
  Flaps,
  UtcClock,
  Hero,
  Tile,
  fmtInt,
  hashfmt,
  useLiveValue,
} from "@/components/dashboard/DashWidgets";
import {
  fetchDashboardData,
  HALF_LIFE_HOURS,
  type DashboardData,
} from "@/lib/dashboardData";

/* ---------------- x402 usage box ---------------- */

function X402Box({ count }: { count: number }) {
  const v = useLiveValue(count, 0);
  return (
    <section className="dash-panel relative p-5 sm:p-7">
      <Corners />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="dash-label">x402 PAYMENTS SETTLED</span>
        <span className="dash-note">
          USDC micropayments across Promethium services
        </span>
      </div>
      <div className="dash-hero-row flex flex-wrap items-end font-bold text-fg">
        <span className="dash-hero-int">
          <Flaps text={fmtInt(v)} />
        </span>
      </div>
      <div className="dash-note mt-1">
        on-chain x402 settlements · bridge + services
      </div>
    </section>
  );
}

/* ---------------- decay curve ----------------
   N(t) = 100 · 2^(−t / 17.7h) over four half-lives.
   Geometry is precomputed at module level (pure constants). */

const CW = 720;
const CH = 330;
const CM = { l: 52, r: 18, t: 30, b: 42 };
const IW = CW - CM.l - CM.r;
const IH = CH - CM.t - CM.b;
const X_MAX = HALF_LIFE_HOURS * 4; // 70.8h

const xp = (t: number) => CM.l + (t / X_MAX) * IW;
const yp = (pct: number) => CM.t + (1 - pct / 100) * IH;
const decayPct = (t: number) => 100 * Math.pow(2, -t / HALF_LIFE_HOURS);

const LINE_PATH = (() => {
  let d = "";
  for (let t = 0; t <= X_MAX + 1e-9; t += X_MAX / 280) {
    d += `${d ? "L" : "M"}${xp(t).toFixed(2)},${yp(decayPct(t)).toFixed(2)}`;
  }
  return d;
})();
const AREA_PATH = `${LINE_PATH}L${xp(X_MAX).toFixed(2)},${yp(0)}L${xp(0)},${yp(0)}Z`;

const HALF_LIVES = [1, 2, 3, 4].map((k) => ({
  t: HALF_LIFE_HOURS * k,
  pct: 100 / 2 ** k,
  label: `${100 / 2 ** k}%`,
}));

// hours-since-mined at which the curve equals a given retention %
const tForPct = (pct: number) =>
  pct >= 100 ? 0 : pct <= 0 ? X_MAX : -HALF_LIFE_HOURS * Math.log2(pct / 100);

const A_COLOR = "#ff8a65"; // network retention (decay-heavy)
const B_COLOR = "#39d9cf"; // bridger retention (healthy)

function RetentionLine({ pct, color, tag }: { pct: number; color: string; tag: string }) {
  if (!isFinite(pct) || pct <= 0) return null;
  const y = yp(pct);
  const tCross = tForPct(pct);
  return (
    <g>
      <line
        x1={CM.l}
        x2={CM.l + IW}
        y1={y}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="5 4"
        opacity={0.9}
      />
      {tCross > 0 && tCross < X_MAX && (
        <circle cx={xp(tCross)} cy={y} r={4} fill={color} stroke="var(--bg-alt)" strokeWidth={2} />
      )}
      <text x={CM.l + 6} y={y - 6} fontSize={13} fontWeight={700} fill={color}>
        {tag}
      </text>
      <text x={CM.l + IW - 4} y={y - 6} textAnchor="end" fontSize={12} fill={color}>
        {pct.toFixed(1)}%
      </text>
    </g>
  );
}

function DecayChart({ aPct, bPct }: { aPct: number; bPct: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverT, setHoverT] = useState<number | null>(null);

  function pointToT(clientX: number) {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * CW;
    return Math.min(X_MAX, Math.max(0, ((x - CM.l) / IW) * X_MAX));
  }

  const hover =
    hoverT === null ? null : { t: hoverT, pct: decayPct(hoverT) };
  const flip = hover !== null && xp(hover.t) > CM.l + IW * 0.58;

  return (
    <section className="dash-panel relative p-5 sm:p-7">
      <Corners />
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="dash-label">SURFACE DECAY CURVE</span>
        <span className="dash-note">t½ = {HALF_LIFE_HOURS}h · N(t) = N₀ · 2^(−t/t½)</span>
      </div>

      <div className="overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CW} ${CH}`}
        className="block w-full min-w-[540px] select-none"
        role="img"
        aria-label={`Exponential decay of surface PROM with a ${HALF_LIFE_HOURS} hour half-life`}
        tabIndex={0}
        onPointerMove={(e) => setHoverT(pointToT(e.clientX))}
        onPointerLeave={() => setHoverT(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const step = e.key === "ArrowRight" ? 1 : -1;
            setHoverT((t) =>
              Math.min(X_MAX, Math.max(0, (t ?? HALF_LIFE_HOURS) + step)),
            );
          }
          if (e.key === "Escape") setHoverT(null);
        }}
      >
        {/* horizontal gridlines + y ticks */}
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}>
            <line
              x1={CM.l}
              x2={CM.l + IW}
              y1={yp(p)}
              y2={yp(p)}
              stroke="rgba(188,212,255,0.16)"
              strokeWidth={1}
            />
            <text
              x={CM.l - 8}
              y={yp(p) + 4}
              textAnchor="end"
              fontSize={12}
              fill="var(--fg-dim)"
            >
              {p}%
            </text>
          </g>
        ))}

        {/* vertical gridlines at each half-life + x ticks */}
        {HALF_LIVES.map(({ t }) => (
          <line
            key={t}
            x1={xp(t)}
            x2={xp(t)}
            y1={CM.t}
            y2={CM.t + IH}
            stroke="rgba(188,212,255,0.16)"
            strokeWidth={1}
          />
        ))}
        {[0, ...HALF_LIVES.map((h) => h.t)].map((t) => (
          <text
            key={t}
            x={xp(t)}
            y={CM.t + IH + 18}
            textAnchor="middle"
            fontSize={12}
            fill="var(--fg-dim)"
          >
            {t === 0 ? "0h" : `${t.toFixed(1)}h`}
          </text>
        ))}
        <text
          x={CM.l + IW / 2}
          y={CH - 6}
          textAnchor="middle"
          fontSize={11}
          fill="var(--fg-dim)"
          letterSpacing="2"
        >
          HOURS SINCE MINED
        </text>

        {/* area wash + curve */}
        <path d={AREA_PATH} fill="rgba(188,212,255,0.09)" className="dash-fade" />
        <path
          d={LINE_PATH}
          pathLength={1}
          fill="none"
          stroke="var(--title)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash-draw"
        />

        {/* half-life markers (surface ring) + sparse direct labels */}
        {HALF_LIVES.map(({ t, pct, label }) => {
          const nearEdge = xp(t) > CM.l + IW * 0.9;
          return (
            <g key={t}>
              <circle
                cx={xp(t)}
                cy={yp(pct)}
                r={4.5}
                fill="var(--title)"
                stroke="var(--bg-alt)"
                strokeWidth={2}
              />
              <text
                x={xp(t) + (nearEdge ? -8 : 8)}
                y={yp(pct) - 9}
                textAnchor={nearEdge ? "end" : "start"}
                fontSize={12}
                fill="var(--fg)"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* our real retention lines: a = network-wide, b = bridger */}
        <RetentionLine pct={aPct} color={A_COLOR} tag="a" />
        <RetentionLine pct={bPct} color={B_COLOR} tag="b" />

        {/* crosshair + tooltip */}
        {hover && (
          <g>
            <line
              x1={xp(hover.t)}
              x2={xp(hover.t)}
              y1={CM.t}
              y2={CM.t + IH}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <circle
              cx={xp(hover.t)}
              cy={yp(hover.pct)}
              r={4.5}
              fill="var(--title)"
              stroke="var(--bg-alt)"
              strokeWidth={2}
            />
            <g
              transform={`translate(${
                flip ? xp(hover.t) - 182 : xp(hover.t) + 12
              },${CM.t + 8})`}
            >
              <rect width={170} height={48} fill="var(--bg)" stroke="var(--line)" />
              <text x={10} y={20} fontSize={13} fontWeight={700} fill="var(--fg)">
                {hover.pct.toFixed(2)}% remaining
              </text>
              <text x={10} y={38} fontSize={12} fill="var(--fg-dim)">
                T +{hover.t.toFixed(1)}h after mining
              </text>
            </g>
          </g>
        )}
      </svg>
      </div>

      {/* legend for the two real retention lines */}
      <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:gap-6">
        <div className="flex items-start gap-2">
          <span
            className="mt-1 inline-block h-0 w-5 shrink-0 border-t-2 border-dashed"
            style={{ borderColor: A_COLOR }}
          />
          <span className="text-fg-dim">
            <span className="font-bold" style={{ color: A_COLOR }}>
              a · network retention {aPct.toFixed(1)}%
            </span>{" "}
            — share of <em>all mined</em> PROM still alive; the rest was never bridged and decayed on
            the surface.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span
            className="mt-1 inline-block h-0 w-5 shrink-0 border-t-2 border-dashed"
            style={{ borderColor: B_COLOR }}
          />
          <span className="text-fg-dim">
            <span className="font-bold" style={{ color: B_COLOR }}>
              b · bridger retention {bPct.toFixed(1)}%
            </span>{" "}
            — share of <em>bridged</em> PROM still healthy at bridge time; the decayed remainder went
            to the relief battery.
          </span>
        </div>
      </div>

      {/* the same values, reachable without hover */}
      <table className="sr-only">
        <caption>Surface decay by half-life</caption>
        <thead>
          <tr>
            <th>Hours since mined</th>
            <th>PROM remaining</th>
          </tr>
        </thead>
        <tbody>
          {[{ t: 0, pct: 100, label: "100%" }, ...HALF_LIVES].map((h) => (
            <tr key={h.t}>
              <td>{h.t.toFixed(1)}</td>
              <td>{h.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ---------------- page ---------------- */

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => {
    fetchDashboardData().then(setData).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="dash-title font-bold text-title">NETWORK OBSERVATORY</h1>
        <div className="dash-note flex items-baseline gap-4">
          <span>
            <span className="animate-blink text-title">●</span> LIVE
          </span>
          <UtcClock />
        </div>
      </div>
      <p className="mb-8 text-sm text-fg-dim">
        The state of the Promethium Chain — what has been mined, what the
        surface has already taken back.
      </p>

      {!data && <p className="dash-note">SYNCING…</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4">
          <Hero
            label="TOTAL PROM MINED"
            note="all blocks since genesis"
            value={data.minedProm}
            perSec={data.minedPerSec}
          />
          <Hero
            label="TOTAL PROM DECAYED"
            note={`lost to the surface · t½ = ${HALF_LIFE_HOURS}h`}
            value={data.decayedProm}
            perSec={data.decayedPerSec}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Hero
              label="ENTANGLED ON SOLANA"
              note="sent to users + LPs from dev"
              value={data.entangledProm}
              perSec={0}
            />
            <Hero
              label="RELIEF FUND · DECAYED-ENTANGLED"
              note="decayed PROM in the battery on Solana"
              value={data.reliefProm}
              perSec={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile label="MINERS" value={fmtInt(data.miners)} sub="active · 24h" />
            <Tile label="NODES" value={fmtInt(data.nodes)} sub="reachable" />
            <Tile
              label="CURRENT BLOCK"
              value={`#${fmtInt(data.blockHeight)}`}
              sub="chain tip"
            />
            <Tile
              label="MINING POWER"
              value={hashfmt(data.networkHashps)}
              sub="network hashrate"
            />
          </div>

          <X402Box count={data.x402Count ?? 0} />

          <DecayChart
            aPct={data.networkRetentionPct ?? 0}
            bPct={data.bridgerRetentionPct ?? 0}
          />

          <div className="dash-note flex flex-wrap justify-between gap-x-6 border-t border-fg-dim/20 pt-3">
            <span>
              {data.simulated
                ? "FEED: SIMULATED — mainnet telemetry connects at launch"
                : "FEED: PROMETHIUM NODE"}
            </span>
            <span>EVERY UNSTABILIZED PROM IS ON THE CLOCK</span>
          </div>
        </div>
      )}
    </div>
  );
}
