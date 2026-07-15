"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
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

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

type StakeStatus = {
  staked: number;
  lockDaysLeft: number;
  unlockable: boolean;
  unlockAt: number | null;
  nextAutopayAt: number;
  accruedYield: number;
  accrualRatePerSec: number;
  dailyYieldPct: number;
};

// Smoothly ticks up from `base` at `perSec` (no reset-to-zero); when the status
// refetches, `base` snaps to the true accrued value and keeps drifting.
function useTicking(base: number, perSec: number) {
  const [v, setV] = useState(base);
  useEffect(() => {
    setV(base);
    if (!perSec) return;
    const t0 = performance.now();
    const id = setInterval(
      () => setV(base + (perSec * (performance.now() - t0)) / 1000),
      100,
    );
    return () => clearInterval(id);
  }, [base, perSec]);
  return v;
}

function AccruedYield({ base, perSec }: { base: number; perSec: number }) {
  const v = useTicking(base, perSec);
  return (
    <>{v.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</>
  );
}

function fmtDuration(secs: number): string {
  if (secs <= 0) return "now";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// Live decreasing counter to a unix-second target.
function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{fmtDuration(target - now)}</span>;
}

export default function StakePanel({ pool = "difficulty" }: { pool?: Pool }) {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<StakeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const isDiff = pool === "difficulty";
  const live = isDiff ? isStakingLive() : isReliefLive();
  const coming = isDiff
    ? "Coming at mainnet — staking program not deployed yet."
    : "Relief Fund staking opens shortly — final testing in progress.";
  const amt = Math.max(0, Number(amount) || 0);
  const discount = useMemo(() => estimateDiscount(amt), [amt]);
  const pct = ((discount - 1) / (MAX_DISCOUNT - 1)) * 100;

  // $PROM balance
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
  }, [connected, publicKey, connection, sig]);

  // Relief Fund stake status (staked + lock + live accrued yield). Refetch the base
  // every 30s; the UI ticks the yield up smoothly in between.
  useEffect(() => {
    let cancelled = false;
    if (!isDiff && connected && publicKey && isReliefLive()) {
      const load = () =>
        fetch(`/api/stake/status?address=${publicKey.toBase58()}`)
          .then((r) => r.json())
          .then(
            (d) =>
              !cancelled &&
              setStatus({
                staked: d.staked || 0,
                lockDaysLeft: d.lockDaysLeft || 0,
                unlockable: !!d.unlockable,
                unlockAt: d.unlockAt ?? null,
                nextAutopayAt: d.nextAutopayAt || 0,
                accruedYield: d.accruedYield || 0,
                accrualRatePerSec: d.accrualRatePerSec || 0,
                dailyYieldPct: d.dailyYieldPct || 0,
              }),
          )
          .catch(() => !cancelled && setStatus(null));
      load();
      const id = setInterval(load, 30000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    } else {
      setStatus(null);
    }
    return () => {
      cancelled = true;
    };
  }, [isDiff, connected, publicKey, sig]);

  // DEPOSIT: one atomic tx — $PROM to the stake account + the 1-USDC fee to the
  // battery (Concorde: fee → battery, not dev). The read-only stake indexer watches
  // the stake account and credits the sender; yield accrues + distributes daily.
  async function deposit() {
    if (!publicKey || amt <= 0 || isDiff) return;
    setErr("");
    setNote("");
    setBusy(true);
    setSig(null);
    try {
      const promMint = new PublicKey(solanaConfig.promTokenMint);
      const stakeOwner = new PublicKey(solanaConfig.batteryStakeAddress);
      const batteryOwner = new PublicKey(solanaConfig.batteryAddress);

      const userProm = await getAssociatedTokenAddress(promMint, publicKey);
      const stakeProm = await getAssociatedTokenAddress(promMint, stakeOwner, true);
      const userUsdc = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const batteryUsdc = await getAssociatedTokenAddress(USDC_MINT, batteryOwner, true);

      const promBase = BigInt(Math.round(amt * 1e8)); // $PROM = 8 decimals
      const tx = new Transaction().add(
        createTransferInstruction(userProm, stakeProm, publicKey, promBase),
        createTransferInstruction(userUsdc, batteryUsdc, publicKey, 1_000_000), // 1 USDC → battery
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM,
          data: new TextEncoder().encode("prom-stake") as any,
        }),
      );
      const s = await sendTransaction(tx, connection);
      setSig(s);
      setNote("✓ Staked — your $PROM is in the Relief Fund; yield accrues daily.");
      setAmount("");
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  // WITHDRAW (unstake): pay the 1-USDC fee to the battery + record the request.
  // No $PROM moves here — the (held) sender returns the stake after release. Gated
  // on the 30-day lock via the status endpoint.
  async function withdraw() {
    if (!publicKey || isDiff || !status?.unlockable) return;
    setErr("");
    setNote("");
    setBusy(true);
    setSig(null);
    try {
      const batteryOwner = new PublicKey(solanaConfig.batteryAddress);
      const userUsdc = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const batteryUsdc = await getAssociatedTokenAddress(USDC_MINT, batteryOwner, true);
      const tx = new Transaction().add(
        createTransferInstruction(userUsdc, batteryUsdc, publicKey, 1_000_000),
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM,
          data: new TextEncoder().encode("prom-unstake") as any,
        }),
      );
      const s = await sendTransaction(tx, connection);
      setSig(s);
      let ok = false;
      for (let i = 0; i < 15 && !ok; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        try {
          const r = await fetch("/api/stake/request", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ staker: publicKey.toBase58(), signature: s, type: "unstake" }),
          });
          const d = await r.json();
          if (d.ok) { ok = true; setNote("✓ Unstake requested — your $PROM will be returned shortly."); }
          else if (r.status !== 400) { setErr(d.error || "Could not record the request."); break; }
        } catch { /* transient — keep polling */ }
      }
      if (!ok && !err) setNote("Fee sent — request registering shortly; your tx is above.");
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  // CLAIM: pay the 1-USDC fee to the battery (same as stake/unstake) + record a
  // claim request. No lock — yield is claimable any time. No $PROM moves here; the
  // claim processor computes the accrued yield and the (held) sender pays it.
  async function claimYield() {
    if (!publicKey || isDiff) return;
    setErr("");
    setNote("");
    setBusy(true);
    setSig(null);
    try {
      const batteryOwner = new PublicKey(solanaConfig.batteryAddress);
      const userUsdc = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const batteryUsdc = await getAssociatedTokenAddress(USDC_MINT, batteryOwner, true);
      const tx = new Transaction().add(
        createTransferInstruction(userUsdc, batteryUsdc, publicKey, 1_000_000),
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM,
          data: new TextEncoder().encode("prom-claim") as any,
        }),
      );
      const s = await sendTransaction(tx, connection);
      setSig(s);
      let ok = false;
      for (let i = 0; i < 15 && !ok; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        try {
          const r = await fetch("/api/stake/request", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ staker: publicKey.toBase58(), signature: s, type: "claim" }),
          });
          const d = await r.json();
          if (d.ok) { ok = true; setNote("✓ Claim requested — your accrued yield will be sent shortly."); }
          else if (r.status !== 400) { setErr(d.error || "Could not record the claim."); break; }
        } catch { /* transient — keep polling */ }
      }
      if (!ok && !err) setNote("Fee sent — claim registering shortly; your tx is above.");
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const canDeposit = live && amt > 0 && !busy && !isDiff;
  const canWithdraw = live && !busy && !isDiff && !!status?.unlockable;
  const canClaim = live && !busy && !isDiff && !!status && status.staked > 0;
  const yieldPctLabel =
    status && status.dailyYieldPct
      ? (status.dailyYieldPct >= 1000
          ? Math.round(status.dailyYieldPct).toLocaleString()
          : status.dailyYieldPct.toLocaleString(undefined, { maximumFractionDigits: 2 })) + "% / day"
      : "—";

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

        {/* your stake + live accrued yield (relief only) */}
        {!isDiff && status && status.staked > 0 && (
          <div className="space-y-2 border-b border-line pb-3">
            <div className="flex items-center justify-between">
              <span className="dash-note">Your stake</span>
              <span className="font-mono text-title">
                {status.staked.toLocaleString()} <span className="dash-note">PROM</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dash-note">Accrued yield</span>
              <span className="font-mono text-title" suppressHydrationWarning>
                +<AccruedYield base={status.accruedYield} perSec={status.accrualRatePerSec} />{" "}
                <span className="dash-note">PROM</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dash-note">Unstake unlocks in</span>
              <span className="font-mono text-title">
                {status.unlockable || !status.unlockAt ? (
                  "unlocked ✓"
                ) : (
                  <Countdown target={status.unlockAt} />
                )}
              </span>
            </div>
          </div>
        )}

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
              <span className="dash-note">Your yield rate</span>
              <span className="font-mono text-title">{yieldPctLabel}</span>
            </div>
            {status && status.nextAutopayAt > 0 && (
              <div className="mt-1 flex items-center justify-between">
                <span className="dash-note">Next autopayment in</span>
                <span className="font-mono text-title">
                  <Countdown target={status.nextAutopayAt} />
                </span>
              </div>
            )}
            <p className="mt-1 text-fg-dim">
              Each day the battery releases {RELIEF_RELEASE_PCT}% of its balance
              to stakers, split <span className="text-fg">time-weighted</span> —
              by your stake size × how long you hold it (capped at 24h between
              payouts). Paid in $PROM, no decay. You earn from the moment you
              stake; {RELIEF_MIN_STAKE_DAYS}-day lock on principal. The rate is
              high while the pool is small and normalises as more $PROM stakes.
            </p>
          </div>
        )}

        {/* actions */}
        {!connected ? (
          <WalletButton className="w-full justify-center" />
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <NeonButton
                className="flex-1"
                disabled={isDiff ? true : !canDeposit}
                title={!live ? coming : undefined}
                onClick={isDiff ? undefined : deposit}
              >
                {busy ? "…" : isDiff ? "STAKE" : "DEPOSIT"}
              </NeonButton>
              <NeonButton
                className="flex-1"
                disabled={isDiff ? true : !canWithdraw}
                title={
                  isDiff
                    ? coming
                    : status?.unlockable
                      ? undefined
                      : status && status.lockDaysLeft > 0
                        ? `Unstaking opens in ${status.lockDaysLeft}d (${RELIEF_MIN_STAKE_DAYS}-day lock).`
                        : `Stake first — ${RELIEF_MIN_STAKE_DAYS}-day minimum lock.`
                }
                onClick={isDiff ? undefined : withdraw}
              >
                {isDiff ? "UNSTAKE" : "WITHDRAW"}
              </NeonButton>
            </div>
            {!isDiff && status && status.staked > 0 && (
              <NeonButton
                className="w-full"
                disabled={!canClaim}
                title={
                  status.unlockable
                    ? "Claim your accrued yield (1 USDC fee)"
                    : "Claim your accrued yield any time — no lock (1 USDC fee)"
                }
                onClick={claimYield}
              >
                {busy ? "…" : "CLAIM YIELD (1 USDC)"}
              </NeonButton>
            )}
          </div>
        )}

        {/* status */}
        {sig && (
          <p className="break-all text-xs text-title">
            <a
              href={`https://solscan.io/tx/${sig}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {sig.slice(0, 16)}…
            </a>
          </p>
        )}
        {note && <p className="text-xs text-title">{note}</p>}
        {err && <p className="text-xs text-red-400">{err}</p>}

        <p className="text-fg-dim">
          Staking, unstaking, and claiming each cost{" "}
          <span className="text-title">{X402_FEE_USDC} USDC</span> (paid to the
          Relief Fund battery) — agents pay the same via x402, no extra. Yield is
          paid automatically every day, or you can CLAIM it any time — no lock on
          yield (the 30-day lock is only on your staked principal).
        </p>
      </div>
    </Panel>
  );
}
