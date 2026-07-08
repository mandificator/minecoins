"use client";

import { useState } from "react";

type Quote = {
  address: string;
  utxos: number;
  nominal: number;
  healthy: number;
  decayed: number;
  healthy_fraction: number;
  amount?: number;
  subsidy_cap: number;
  over_cap: boolean;
  insufficient_balance?: boolean;
  projected_healthy_spl?: number;
  projected_to_battery?: number;
  tip: number;
  error?: string;
};

const fmt = (n: number | undefined, d = 4) =>
  n === undefined ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: d });

export default function BridgeClient() {
  const [fromAddr, setFromAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [solAddr, setSolAddr] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function getQuote() {
    setErr("");
    setQuote(null);
    if (!fromAddr.trim()) {
      setErr("Enter the PROM address you want to bridge from.");
      return;
    }
    setLoading(true);
    try {
      const q = new URLSearchParams({ address: fromAddr.trim() });
      if (amount) q.set("amount", amount);
      const r = await fetch(`/api/bridge/quote?${q.toString()}`);
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Quote failed.");
      else setQuote(d);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const healthPct = quote ? Math.round(quote.healthy_fraction * 1000) / 10 : 0;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.6, textTransform: "uppercase" }}>
        Internal · testing only
      </div>
      <h1 style={{ fontSize: 28, margin: "0.25rem 0 0.5rem" }}>PROM → Solana Bridge</h1>
      <p style={{ opacity: 0.75, lineHeight: 1.5, marginTop: 0 }}>
        Bridge up to one block subsidy of PROM per transaction. You receive the{" "}
        <b>healthy</b> portion as SPL PROM on Solana; the <b>decayed</b> portion goes to the
        Relief Fund battery. The figure below is an estimate — the exact split is computed from
        the actual coins you send.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>PROM address to bridge from</span>
          <input
            value={fromAddr}
            onChange={(e) => setFromAddr(e.target.value)}
            placeholder="prom1…"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Amount to bridge (max = current block subsidy{quote ? ` = ${quote.subsidy_cap}` : ""})
          </span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            inputMode="decimal"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Destination Solana address (SPL PROM)</span>
          <input
            value={solAddr}
            onChange={(e) => setSolAddr(e.target.value)}
            placeholder="Your Solana wallet address"
            style={inputStyle}
          />
        </label>

        <button onClick={getQuote} disabled={loading} style={buttonStyle}>
          {loading ? "Checking…" : "Estimate healthy vs decayed"}
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#fee", color: "#900", fontSize: 14 }}>
          {err}
        </div>
      )}

      {quote && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <b>Estimate</b>
            <span style={{ fontSize: 12, opacity: 0.6 }}>tip {quote.tip}</span>
          </div>

          <div style={{ margin: "12px 0" }}>
            <div style={{ height: 10, borderRadius: 6, overflow: "hidden", background: "#eee", display: "flex" }}>
              <div style={{ width: `${healthPct}%`, background: "#22a06b" }} />
              <div style={{ width: `${100 - healthPct}%`, background: "#d9534f" }} />
            </div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>
              Address is <b>{healthPct}%</b> healthy right now ({fmt(quote.healthy)} healthy /{" "}
              {fmt(quote.decayed)} decayed of {fmt(quote.nominal)} nominal across {quote.utxos} UTXOs)
            </div>
          </div>

          {quote.amount !== undefined && (
            <div style={{ display: "grid", gap: 6, fontSize: 15 }}>
              {quote.insufficient_balance && (
                <div style={{ color: "#900" }}>⚠ This address holds only {fmt(quote.nominal)} PROM.</div>
              )}
              {quote.over_cap && (
                <div style={{ color: "#900" }}>
                  ⚠ Over the {quote.subsidy_cap}-PROM per-transaction cap — reduce the amount or bridge in multiple ops.
                </div>
              )}
              <Row label="You bridge (nominal)" value={`${fmt(quote.amount)} PROM`} />
              <Row label="→ You receive on Solana (healthy)" value={`≈ ${fmt(quote.projected_healthy_spl)} PROM`} strong />
              <Row label="→ To Relief Fund battery (decayed)" value={`≈ ${fmt(quote.projected_to_battery)} PROM`} />
            </div>
          )}

          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12, marginBottom: 0 }}>
            Estimate only — the exact split is computed from the actual UTXOs you spend, after the PROM
            deposit confirms. (Solana payment + PROM send command coming next.)
          </p>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500 }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 15,
  fontFamily: "ui-monospace, monospace",
};

const buttonStyle: React.CSSProperties = {
  padding: "11px 16px",
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
