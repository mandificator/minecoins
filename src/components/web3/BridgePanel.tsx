"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  solanaConfig,
  X402_FEE_USDC,
  BRIDGE_FEE_PCT,
} from "@/lib/solana/config";
import {
  buildOpReturn,
  looksLikeSolanaAddress,
  quoteBridge,
} from "@/lib/solana/bridge";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={!value}
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-neon-cyan hover:bg-white/[0.03] disabled:opacity-40"
    >
      {copied ? "✓ copied" : label}
    </button>
  );
}

export default function BridgePanel() {
  const bridgeAddress = solanaConfig.bridgeAddress;

  const [solAddr, setSolAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState<string>("");

  const validAddr = looksLikeSolanaAddress(solAddr);
  const amt = Math.max(0, Number(amount) || 0);
  const quote = quoteBridge(amt);
  const opReturn = validAddr ? buildOpReturn(solAddr) : "";

  useEffect(() => {
    if (bridgeAddress) {
      QRCode.toDataURL(bridgeAddress, {
        margin: 1,
        color: { dark: "#bcd4ff", light: "#0a2bd6" },
        width: 180,
      })
        .then(setQr)
        .catch(() => setQr(""));
    }
  }, [bridgeAddress]);

  return (
    <div className="space-y-6">
      {/* one-way warning */}
      <div className="relative overflow-hidden border border-amber bg-amber/[0.07] p-4">
        <div className="scanlines opacity-60" />
        <p className="relative text-sm text-amber">
          ⚠ <strong>ONE-WAY BRIDGE.</strong> Bridged Promethium are{" "}
          <strong>BURNED</strong> on the Promethium Chain. There is no token → coin
          path. Double-check your Solana address.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* steps + address */}
        <div className="border border-border bg-bg-alt/60">
          <div className="border-b border-border px-3 py-2 font-mono text-xs">
            <span className="text-fg-dim">┌─[</span>
            <span className="uppercase tracking-widest text-neon-cyan">
              {" "}
              BRIDGE COIN → TOKEN{" "}
            </span>
            <span className="text-fg-dim">]─┐</span>
          </div>
          <div className="space-y-4 p-4 text-sm">
            <ol className="space-y-2 pl-5">
              <li className="list-decimal">
                Send a normal Promethium transfer to the bridge address.
              </li>
              <li className="list-decimal">
                Attach an <code className="text-neon-green">OP_RETURN</code>{" "}
                containing your Solana address.
              </li>
              <li className="list-decimal">
                Receive $PROM token on Solana automatically (minus{" "}
                {BRIDGE_FEE_PCT * 100}% bridge fee).
              </li>
              <li className="list-decimal">
                Pay {X402_FEE_USDC} USDC x402 service fee on Solana.
              </li>
            </ol>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-fg-dim">
                  Bridge address
                </span>
                <CopyButton value={bridgeAddress} label="copy" />
              </div>
              <div className="break-all border border-border bg-bg px-3 py-2 font-mono text-xs text-neon-green">
                {bridgeAddress || "— not published yet —"}
              </div>
            </div>

            {qr && (
              <div className="flex justify-center pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt="Bridge address QR"
                  className="border border-border"
                  width={180}
                  height={180}
                />
              </div>
            )}
          </div>
        </div>

        {/* calculator + op_return helper */}
        <div className="border border-border bg-bg-alt/60">
          <div className="border-b border-border px-3 py-2 font-mono text-xs">
            <span className="text-fg-dim">┌─[</span>
            <span className="uppercase tracking-widest text-neon-magenta">
              {" "}
              CALCULATOR{" "}
            </span>
            <span className="text-fg-dim">]─┐</span>
          </div>
          <div className="space-y-4 p-4 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
                Your Solana address
              </span>
              <input
                value={solAddr}
                onChange={(e) => setSolAddr(e.target.value)}
                placeholder="Solana wallet address"
                className="w-full border border-border bg-bg px-3 py-2 font-mono text-xs text-fg outline-none focus:border-neon-cyan"
              />
              {solAddr && !validAddr && (
                <span className="mt-1 block text-[11px] text-amber">
                  Doesn&apos;t look like a valid Solana address.
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
                Amount to bridge (PROM)
              </span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-border bg-bg px-3 py-2 font-mono text-fg outline-none focus:border-neon-cyan"
              />
            </label>

            <div className="space-y-1 border border-border bg-bg p-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-fg-dim">You send</span>
                <span className="text-fg">{quote.send} PROM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">
                  Bridge fee ({BRIDGE_FEE_PCT * 100}%)
                </span>
                <span className="text-amber">− {quote.feeMine} PROM</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="text-fg-dim">You receive</span>
                <span className="neon-green">{quote.receive} PROM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">x402 service fee</span>
                <span className="text-amber">
                  + {quote.x402Usdc} USDC
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-fg-dim">
                  OP_RETURN payload
                </span>
                <CopyButton value={opReturn} label="copy" />
              </div>
              <div className="break-all border border-border bg-bg px-3 py-2 font-mono text-xs text-neon-cyan">
                {opReturn || "— enter a valid Solana address —"}
              </div>
              <p className="mt-1 text-[11px] text-fg-dim">
                Attach this to your Promethium transfer&apos;s OP_RETURN. The bridge
                reads it to know where to send your $PROM token.
              </p>
            </div>

            <NeonButton color="cyan" className="w-full" disabled title="Bridging is initiated on Promethium Chain, not from this site.">
              BRIDGE FROM Promethium Chain
            </NeonButton>
            <p className="text-[11px] text-fg-dim">
              Bridging is initiated by your Promethium transfer on Promethium Chain (or your
              agent via the CLI skill) — not signed on this website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
