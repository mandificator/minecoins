"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { solanaConfig, BRIDGE_FEE_PCT } from "@/lib/solana/config";

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
  const [qr, setQr] = useState<string>("");

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
          ⚠ <strong>ONE-WAY.</strong> Stabilized Promethium are{" "}
          <strong>BURNED</strong> on the Promethium Chain. There is no token → coin
          path. Double-check your Solana address.
        </p>
      </div>

      {/* Stabilize manually — full width */}
      <div className="border border-border bg-bg-alt/60">
        <div className="border-b border-border px-3 py-2 font-mono text-xs">
          <span className="text-fg-dim">┌─[</span>
          <span className="uppercase tracking-widest text-neon-cyan">
            {" "}
            STABILIZE MANUALLY{" "}
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

          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-fg-dim">
              Endpoint
            </span>
            <div className="border border-border bg-bg px-3 py-2 font-mono text-xs text-fg-dim">
              — to be published soon —
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
    </div>
  );
}
