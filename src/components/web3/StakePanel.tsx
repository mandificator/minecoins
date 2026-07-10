"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NeonButton } from "@/components/ui/NeonButton";
import Panel from "@/components/ui/Panel";
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
    <Panel label={isDiff ? "R&D Institute" : "Relief Fund"}>
      <div className="space-y-5">
        {/* balance */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="dash-note">$PROM balance</span>
          <span className="font-mono text-fg">
            {balance === null ? "—" : balance.toLocaleString()}{" "}
            <span className="dash-note">PROM</span>
          </span>
        </div>

        {/* amount */}
        <label className="block">
          <span className="dash-note mb-1 block">
            {isDiff ? "Amount to stake ($PROM)" : "Amount to deposit ($PROM)"}
          </span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-title bg-bg px-3 py-2 font-mono text-fg outline-none focus:border-fg"
          />
        </label>

        {/* pool-specific readout */}
        {isDiff ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="dash-note">Estimated difficulty discount</span>
              <span className="font-mono text-title">
                {discount.toFixed(2)}× / {MAX_DISCOUNT}×
              </span>
            </div>
            <div className="dash-meter">
              <div style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
            </div>
            <p className="mt-1 text-fg-dim">
              Lowers your personal mining difficulty, capped at {MAX_DISCOUNT}×.
              Placeholder curve — the real one ships with the protocol.
            </p>
          </div>
        ) : (
          <div className="dash-panel relative p-3">
            <div className="flex items-center justify-between">
              <span className="dash-note">Daily yield</span>
              <span className="font-mono text-title">—</span>
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
              className="flex-1"
              disabled={!live || amt <= 0}
              title={!live ? coming : undefined}
            >
              {isDiff ? "STAKE" : "DEPOSIT"}
            </NeonButton>
            <NeonButton
              className="flex-1"
              disabled={!live || amt <= 0}
              title={!live ? coming : undefined}
            >
              {isDiff ? "UNSTAKE" : "WITHDRAW"}
            </NeonButton>
          </div>
        )}

        <p className="text-fg-dim">
          Each action costs <span className="text-title">{X402_FEE_USDC} USDC</span>{" "}
          via x402 on Solana — the agent pays the same, no extra.
        </p>
      </div>
    </Panel>
  );
}
