"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NeonButton } from "@/components/ui/NeonButton";
import WalletButton from "@/components/web3/WalletButton";
import {
  isStakingLive,
  isReliefLive,
  isTokenLive,
  MAX_DISCOUNT,
  X402_FEE_USDC,
  RELIEF_RELEASE_PCT,
  RELIEF_MIN_STAKE_DAYS,
  solanaConfig,
} from "@/lib/solana/config";
import { estimateDiscount, getTokenBalance, type Pool } from "@/lib/solana/staking";

export default function StakePanel({ pool = "difficulty" }: { pool?: Pool }) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);

  const isDiff = pool === "difficulty";
  const live = isDiff ? isStakingLive() : isReliefLive();
  const coming = isDiff
    ? "Coming at mainnet — staking program not deployed yet."
    : "Coming at mainnet — $PROM token not deployed yet.";
  const amt = Math.max(0, Number(amount) || 0);
  const discount = useMemo(() => estimateDiscount(amt), [amt]);
  const pct = ((discount - 1) / (MAX_DISCOUNT - 1)) * 100;

  useEffect(() => {
    let cancelled = false;
    if (connected && publicKey && isTokenLive()) {
      getTokenBalance(connection, publicKey, solanaConfig.promTokenMint)
        .then((b) => !cancelled && setBalance(b))
        .catch(() => !cancelled && setBalance(null));
    } else {
      setBalance(null);
    }
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  return (
    <div className="border border-border bg-bg-alt/60">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono">
        <span className="text-fg-dim">┌─[</span>
        <span className="uppercase tracking-widest text-neon-magenta">
          {isDiff ? "R&D Institute" : "Relief Fund"}
        </span>
        <span className="text-fg-dim">]──┐</span>
      </div>

      <div className="space-y-5 p-5">
        {/* balance */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <span className="text-fg-dim">$PROM balance</span>
          <span className="neon-green font-mono">
            {balance === null ? "—" : balance.toLocaleString()}{" "}
            <span className="text-fg-dim">PROM</span>
          </span>
        </div>

        {/* amount */}
        <label className="block">
          <span className="mb-1 block uppercase tracking-widest text-fg-dim">
            {isDiff ? "Amount to stake ($PROM)" : "Amount to deposit ($PROM)"}
          </span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-border bg-bg px-3 py-2 font-mono text-fg outline-none focus:border-neon-magenta"
          />
        </label>

        {/* pool-specific readout */}
        {isDiff ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="uppercase tracking-widest text-fg-dim">
                Estimated difficulty discount
              </span>
              <span className="neon-magenta font-mono">
                {discount.toFixed(2)}× / {MAX_DISCOUNT}×
              </span>
            </div>
            <div className="h-3 w-full border border-border bg-bg">
              <div
                className="h-full bg-neon-magenta/70 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>
            <p className="mt-1 text-fg-dim">
              Lowers your personal mining difficulty, capped at {MAX_DISCOUNT}×.
              Placeholder curve — the real one ships with the protocol.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-bg p-3">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-widest text-fg-dim">
                Daily yield
              </span>
              <span className="neon-green font-mono">—</span>
            </div>
            <p className="mt-1 text-fg-dim">
              Each day the battery releases {RELIEF_RELEASE_PCT}% of its balance
              to stakers, split by your share (your stake ÷ total staked). Paid
              in $PROM, no decay. {RELIEF_MIN_STAKE_DAYS}-day minimum lock.
            </p>
          </div>
        )}

        {/* actions */}
        {!connected ? (
          <WalletButton className="w-full justify-center" />
        ) : (
          <div className="flex gap-3">
            <NeonButton
              color="magenta"
              className="flex-1"
              disabled={!live || amt <= 0}
              title={!live ? coming : undefined}
            >
              {isDiff ? "STAKE" : "DEPOSIT"}
            </NeonButton>
            <NeonButton
              color="cyan"
              className="flex-1"
              disabled={!live || amt <= 0}
              title={!live ? coming : undefined}
            >
              {isDiff ? "UNSTAKE" : "WITHDRAW"}
            </NeonButton>
          </div>
        )}

        <p className="text-fg-dim">
          Each action costs{" "}
          <span className="text-amber">{X402_FEE_USDC} USDC</span> via x402 on
          Solana — the agent pays the same, no extra.
        </p>
      </div>
    </div>
  );
}
