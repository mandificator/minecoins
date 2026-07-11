"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import WalletButton from "@/components/web3/WalletButton";
import { isBridgeLive, X402_FEE_USDC, solanaConfig } from "@/lib/solana/config";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const DEV_ADDR = new PublicKey("AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa");
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

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
  bridge_fee_pct?: number;
  projected_bridge_fee?: number;
  projected_net_spl?: number;
  tip: number;
};

type Intent = {
  intentId: string;
  bridgeAddress: string;
  opReturnHex: string;
  command: string;
  amount: number;
  solAddress: string;
  usdcMemo: string;
};

const fmt = (n: number | undefined, d = 4) =>
  n === undefined ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: d });

export default function BridgeClient() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [fromAddr, setFromAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [solAddr, setSolAddr] = useState("");
  const [useConnected, setUseConnected] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState("");

  async function payUsdc() {
    if (!publicKey || !intent) return;
    setErr("");
    setPaying(true);
    try {
      const fromAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const toAta = await getAssociatedTokenAddress(USDC_MINT, DEV_ADDR);
      const transferIx = createTransferInstruction(fromAta, toAta, publicKey, 1_000_000); // 1 USDC (6 dec)
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM,
        data: new TextEncoder().encode(intent.intentId) as any,
      });
      const tx = new Transaction().add(transferIx, memoIx);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      const r = await fetch("/api/bridge/verify-payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intentId: intent.intentId, signature: sig }),
      });
      const d = await r.json();
      if (!r.ok && !d.paid) setErr(d.error || "Payment could not be verified.");
      else setPaid(true);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setPaying(false);
    }
  }

  const dest = useConnected && publicKey ? publicKey.toBase58() : solAddr;

  async function getQuote() {
    setErr("");
    setQuote(null);
    setIntent(null);
    if (!fromAddr.trim()) return setErr("Enter the PROM address you want to bridge from.");
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

  async function createIntent() {
    setErr("");
    setIntent(null);
    if (!dest.trim()) return setErr("Enter a destination Solana address (or use your connected wallet).");
    setLoading(true);
    try {
      const r = await fetch("/api/bridge/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fromAddress: fromAddr.trim(), amount: Number(amount), solAddress: dest.trim() }),
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Could not create the bridge intent.");
      else setIntent(d);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const healthPct = quote ? Math.round(quote.healthy_fraction * 1000) / 10 : 0;
  const canIntent = !!quote && !quote.over_cap && !quote.insufficient_balance && Number(amount) > 0;
  const bridgeLive = isBridgeLive();

  return (
    <main style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 1.25rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.6, textTransform: "uppercase" }}>
        Internal · testing only
      </div>
      <h1 style={{ fontSize: 28, margin: "0.25rem 0 0.5rem" }}>PROM → Solana Bridge</h1>
      <p style={{ opacity: 0.75, lineHeight: 1.5, marginTop: 0 }}>
        Bridge up to one block subsidy of PROM per transaction. You receive the <b>healthy</b>{" "}
        portion as SPL PROM on Solana; the <b>decayed</b> portion goes to the Relief Fund battery.
      </p>
      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", color: "#dbe4ff", fontSize: 13, lineHeight: 1.5 }}>
        ℹ️ <b>$PROM is live on Solana</b> — mint <code>promP7gZmjt3fMVWfx47swYBpfwrjb2m3TX4c3woDBu</code>.
        The bridge activates at <b>block 29300</b> on the Promethium chain — the decay clock starts then;
        until activation all PROM stays 100% healthy.
      </div>

      {/* Step 1 — wallet */}
      <Section n={1} title="Connect your Solana wallet">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WalletButton />
          <span style={{ fontSize: 13, opacity: 0.7 }}>
            {connected && publicKey ? `Connected: ${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : "Any Solana wallet"}
          </span>
        </div>
      </Section>

      {/* Step 2 — form */}
      <Section n={2} title="What to bridge">
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="PROM address to bridge from">
            <input value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} placeholder="prom1…" style={inputStyle} />
          </Field>
          <Field label={`Amount (max = block subsidy${quote ? ` = ${quote.subsidy_cap}` : ""})`}>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50" inputMode="decimal" style={inputStyle} />
          </Field>
          <Field label="Destination Solana address (SPL PROM)">
            <input
              value={dest}
              onChange={(e) => setSolAddr(e.target.value)}
              placeholder="Your Solana address"
              style={{ ...inputStyle, opacity: useConnected ? 0.6 : 1 }}
              disabled={useConnected}
            />
            <label style={{ fontSize: 13, opacity: 0.8, display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
              <input
                type="checkbox"
                checked={useConnected}
                onChange={(e) => setUseConnected(e.target.checked)}
                disabled={!connected}
              />
              Use my connected wallet {connected ? "" : "(connect first)"}
            </label>
          </Field>
          <button onClick={getQuote} disabled={loading} style={buttonStyle}>
            {loading ? "Checking…" : "Estimate healthy vs decayed"}
          </button>
        </div>
      </Section>

      {err && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(220,60,60,0.15)", border: "1px solid rgba(220,60,60,0.4)", color: "#ff9c9c", fontSize: 14 }}>{err}</div>
      )}

      {/* estimate */}
      {quote && (
        <div style={{ marginTop: 16, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <b>Estimate</b>
            <span style={{ fontSize: 12, opacity: 0.6 }}>tip {quote.tip}</span>
          </div>
          <div style={{ margin: "12px 0" }}>
            <div style={{ height: 10, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.12)", display: "flex" }}>
              <div style={{ width: `${healthPct}%`, background: "#22a06b" }} />
              <div style={{ width: `${100 - healthPct}%`, background: "#d9534f" }} />
            </div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>
              Address is <b>{healthPct}%</b> healthy ({fmt(quote.healthy)} healthy / {fmt(quote.decayed)} decayed of {fmt(quote.nominal)} nominal)
            </div>
          </div>
          {quote.amount !== undefined && (
            <div style={{ display: "grid", gap: 6, fontSize: 15 }}>
              {quote.insufficient_balance && <div style={{ color: "#ff9c9c" }}>⚠ This address holds only {fmt(quote.nominal)} PROM.</div>}
              {quote.over_cap && <div style={{ color: "#ff9c9c" }}>⚠ Over the {quote.subsidy_cap}-PROM cap — reduce the amount.</div>}
              <Row label="You bridge (nominal)" value={`${fmt(quote.amount)} PROM`} />
              <Row label="Healthy" value={`≈ ${fmt(quote.projected_healthy_spl)} PROM`} />
              <Row
                label={`− ${Math.round((quote.bridge_fee_pct ?? 0.02) * 100)}% bridge fee`}
                value={`≈ ${fmt(quote.projected_bridge_fee)} PROM`}
              />
              <Row label="→ You receive (SPL)" value={`≈ ${fmt(quote.projected_net_spl)} PROM`} strong />
              <Row label="→ To battery (decayed)" value={`≈ ${fmt(quote.projected_to_battery)} PROM`} />
            </div>
          )}
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12, marginBottom: 0 }}>
            Estimate only — the exact split is computed from the actual coins you send.
          </p>
        </div>
      )}

      {/* Step 3 — bridge */}
      {quote && (
        <Section n={3} title="Bridge">
          <button onClick={createIntent} disabled={loading || !canIntent} style={{ ...buttonStyle, opacity: canIntent ? 1 : 0.5 }}>
            {loading ? "Preparing…" : "Prepare bridge transfer"}
          </button>

          {intent && (
            <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
              {/* USDC step */}
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 14 }}>
                <b>A. Pay the {X402_FEE_USDC} USDC bridge fee (Solana)</b>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                  Memo: <code>{intent.usdcMemo}</code> — links your USDC payment to this bridge.
                </div>
                <button
                  onClick={payUsdc}
                  disabled={!bridgeLive || !connected || paying || paid}
                  title={!bridgeLive ? "Bridge not live yet" : !connected ? "Connect wallet first" : undefined}
                  style={{ ...buttonStyle, marginTop: 10, opacity: bridgeLive && connected && !paid ? 1 : 0.5 }}
                >
                  {paid ? "✓ Paid" : paying ? "Paying…" : bridgeLive ? `Pay ${X402_FEE_USDC} USDC` : "Coming — bridge not live yet"}
                </button>
                {paid && (
                  <div style={{ fontSize: 12, color: "#7ee0a8", marginTop: 6 }}>
                    Fee paid ✓ — now run the PROM command below to complete your bridge.
                  </div>
                )}
              </div>

              {/* PROM command */}
              <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 14 }}>
                <b>B. Send the PROM (run on your PROM node)</b>
                <div style={{ fontSize: 13, opacity: 0.8, margin: "4px 0 8px" }}>
                  Sends {intent.amount} PROM to the bridge with the OP_RETURN that carries your intent + Solana address:
                </div>
                <pre style={preStyle}>{intent.command}</pre>
                <button onClick={() => navigator.clipboard?.writeText(intent.command)} style={{ ...buttonStyle, marginTop: 8, padding: "7px 12px", fontSize: 13 }}>
                  Copy command
                </button>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
                  Bridge address: <code>{intent.bridgeAddress}</code>
                </div>
              </div>

              <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
                After your PROM deposit confirms, the bridge computes the exact healthy/decayed split from the coins you
                actually sent and queues your payout. $PROM settlements are released shortly after in batches — your
                bridge is recorded and safe, not lost.
              </p>
            </div>
          )}
        </Section>
      )}
    </main>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ opacity: 0.5 }}>{n}.</span> {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
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
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.25)",
  color: "#e8ecff",
  fontSize: 15,
  fontFamily: "ui-monospace, monospace",
  width: "100%",
  boxSizing: "border-box",
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

const preStyle: React.CSSProperties = {
  background: "#0d1117",
  color: "#c9d1d9",
  padding: 12,
  borderRadius: 8,
  fontSize: 12.5,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  margin: 0,
};
