"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/web3/WalletButton";
import { NeonButton } from "@/components/ui/NeonButton";
import Panel from "@/components/ui/Panel";
import { isBridgeLive, X402_FEE_USDC } from "@/lib/solana/config";

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

const INPUT =
  "w-full min-w-0 border border-title bg-bg-alt/60 px-3 py-2 font-mono text-fg placeholder:text-fg-dim focus:outline-none focus:border-fg disabled:opacity-60";

export default function BridgeClient() {
  const { publicKey, connected } = useWallet();
  const [fromAddr, setFromAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [solAddr, setSolAddr] = useState("");
  const [useConnected, setUseConnected] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="dash-note mb-1">internal · testing only</p>
      <h1 className="dash-title mb-2 font-bold text-title">PROM → SOLANA BRIDGE</h1>
      <p className="mb-8 max-w-2xl text-sm text-fg-dim">
        Bridge up to one block subsidy of PROM per transaction. You receive the{" "}
        <span className="text-title">healthy</span> portion as SPL PROM on Solana; the{" "}
        <span className="text-title">decayed</span> portion goes to the Relief Fund battery.
      </p>

      <div className="space-y-6">
        {/* Step 1 — wallet */}
        <Panel label="STEP 1 · CONNECT WALLET">
          <div className="flex flex-wrap items-center gap-3">
            <WalletButton />
            <span className="text-sm text-fg-dim">
              {connected && publicKey
                ? `Connected: ${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
                : "Any Solana wallet"}
            </span>
          </div>
        </Panel>

        {/* Step 2 — form */}
        <Panel label="STEP 2 · WHAT TO BRIDGE">
          <div className="grid gap-4">
            <Field label="PROM address to bridge from">
              <input
                value={fromAddr}
                onChange={(e) => setFromAddr(e.target.value)}
                placeholder="prom1…"
                className={INPUT}
              />
            </Field>
            <Field label={`Amount (max = block subsidy${quote ? ` = ${quote.subsidy_cap}` : ""})`}>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50"
                inputMode="decimal"
                className={INPUT}
              />
            </Field>
            <Field label="Destination Solana address (SPL PROM)">
              <input
                value={dest}
                onChange={(e) => setSolAddr(e.target.value)}
                placeholder="Your Solana address"
                disabled={useConnected}
                className={INPUT}
              />
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-fg-dim">
                <input
                  type="checkbox"
                  className="accent-title"
                  checked={useConnected}
                  onChange={(e) => setUseConnected(e.target.checked)}
                  disabled={!connected}
                />
                Use my connected wallet {connected ? "" : "(connect first)"}
              </label>
            </Field>
            <NeonButton onClick={getQuote} disabled={loading}>
              {loading ? "CHECKING…" : "ESTIMATE HEALTHY VS DECAYED"}
            </NeonButton>
          </div>
        </Panel>

        {err && <p className="dash-panel relative px-3 py-2 text-title">! {err}</p>}

        {/* estimate */}
        {quote && (
          <Panel label="ESTIMATE" note={`tip ${quote.tip}`}>
            <div className="dash-meter">
              <div style={{ width: `${healthPct}%` }} />
            </div>
            <p className="mt-2 text-sm text-fg-dim">
              Address is <span className="text-title">{healthPct}%</span> healthy (
              {fmt(quote.healthy)} healthy / {fmt(quote.decayed)} decayed of {fmt(quote.nominal)}{" "}
              nominal)
            </p>

            {quote.amount !== undefined && (
              <div className="mt-4 space-y-2 text-sm">
                {quote.insufficient_balance && (
                  <p className="text-title">! This address holds only {fmt(quote.nominal)} PROM.</p>
                )}
                {quote.over_cap && (
                  <p className="text-title">! Over the {quote.subsidy_cap}-PROM cap — reduce the amount.</p>
                )}
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
            <p className="dash-note mt-4">
              estimate only — the exact split is computed from the actual coins you send
            </p>
          </Panel>
        )}

        {/* Step 3 — bridge */}
        {quote && (
          <Panel label="STEP 3 · BRIDGE">
            <NeonButton onClick={createIntent} disabled={loading || !canIntent}>
              {loading ? "PREPARING…" : "PREPARE BRIDGE TRANSFER"}
            </NeonButton>

            {intent && (
              <div className="mt-4 space-y-4">
                {/* USDC step */}
                <div className="dash-panel relative p-4">
                  <p className="text-title">A. Pay the {X402_FEE_USDC} USDC bridge fee (Solana)</p>
                  <p className="mt-1 text-sm text-fg-dim">
                    Memo: <code className="border border-line bg-bg px-1">{intent.usdcMemo}</code> — links your
                    USDC payment to this bridge.
                  </p>
                  <div className="mt-3">
                    <NeonButton
                      disabled={!bridgeLive || !connected}
                      title={
                        !bridgeLive
                          ? "Solana bridge/battery addresses not set yet"
                          : !connected
                            ? "Connect wallet first"
                            : undefined
                      }
                    >
                      {bridgeLive ? `PAY ${X402_FEE_USDC} USDC` : "COMING — ADDRESSES NOT SET"}
                    </NeonButton>
                  </div>
                </div>

                {/* PROM command */}
                <div className="dash-panel relative p-4">
                  <p className="text-title">B. Send the PROM (run on your PROM node)</p>
                  <p className="mt-1 text-sm text-fg-dim">
                    Sends {intent.amount} PROM to the bridge with the OP_RETURN that carries your intent + Solana
                    address:
                  </p>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all border border-dashed border-line bg-bg-alt p-3 text-xs text-title">
                    {intent.command}
                  </pre>
                  <div className="mt-2">
                    <NeonButton
                      className="text-xs"
                      onClick={() => navigator.clipboard?.writeText(intent.command)}
                    >
                      COPY COMMAND
                    </NeonButton>
                  </div>
                  <p className="mt-2 text-xs text-fg-dim">
                    Bridge address: <code className="border border-line bg-bg px-1">{intent.bridgeAddress}</code>
                  </p>
                </div>

                <p className="dash-note">
                  after the PROM deposit confirms, the bridge computes the exact healthy/decayed from the coins
                  you actually sent, credits your Solana address + the battery, and logs it to the bridge history
                </p>
              </div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="dash-note">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-fg-dim">{label}</span>
      <span className={strong ? "font-bold text-title" : "text-fg"}>{value}</span>
    </div>
  );
}
