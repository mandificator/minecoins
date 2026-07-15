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
  address: string;
  staked: number;
  lockDaysLeft: number;
  unlockable: boolean;
  unlockAt: number | null;
  startAt: number;
  started: boolean;
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
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<StakeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Wait until a tx is confirmed on Solana (poll, no confirmTransaction — that hung).
  async function waitConfirmed(s: string, tries = 24): Promise<boolean> {
    for (let i = 0; i < tries; i++) {
      try {
        const st = await connection.getSignatureStatus(s, { searchTransactionHistory: true });
        if (st?.value?.err) return false;
        const c = st?.value?.confirmationStatus;
        if (c === "confirmed" || c === "finalized") return true;
      } catch {
        /* transient — keep polling */
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    return false;
  }

  // On a confirmed stake, kick the indexer so the staked balance shows immediately,
  // then bump refreshKey to refetch wallet balances + status.
  async function refreshAfterConfirm(s: string, triggerSync: boolean) {
    const ok = await waitConfirmed(s);
    if (ok && triggerSync) {
      try {
        await fetch("/api/stake/sync", { method: "POST" });
      } catch {
        /* the cron will catch it */
      }
    }
    setRefreshKey((k) => k + 1);
    return ok;
  }

  const isDiff = pool === "difficulty";
  const live = isDiff ? isStakingLive() : isReliefLive();
  const coming = isDiff
    ? "Coming at mainnet — staking program not deployed yet."
    : "Relief Fund staking opens shortly — final testing in progress.";
  const amt = Math.max(0, Number(amount) || 0);
  const discount = useMemo(() => estimateDiscount(amt), [amt]);
  const pct = ((discount - 1) / (MAX_DISCOUNT - 1)) * 100;

  // Clear stale stake data the instant the connected address changes (switching
  // accounts in the wallet) so the old address's stake/yield never lingers.
  useEffect(() => {
    setStatus(null);
  }, [publicKey?.toBase58()]);

  // $PROM + USDC balances (USDC = the 1-per-action fee)
  useEffect(() => {
    let cancelled = false;
    if (connected && publicKey && isTokenLive()) {
      getTokenBalance(connection, publicKey, solanaConfig.promTokenMint)
        .then((b) => !cancelled && setBalance(b))
        .catch(() => !cancelled && setBalance(null));
      getTokenBalance(connection, publicKey, USDC_MINT.toBase58())
        .then((b) => !cancelled && setUsdcBalance(b))
        .catch(() => !cancelled && setUsdcBalance(null));
    } else {
      setBalance(null);
      setUsdcBalance(null);
    }
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey?.toBase58(), connection, sig, refreshKey]);

  // Relief Fund stake status (staked + lock + live accrued yield). Refetch the base
  // every 30s; the UI ticks the yield up smoothly in between.
  useEffect(() => {
    let cancelled = false;
    const addr = publicKey?.toBase58();
    if (!isDiff && connected && addr && isReliefLive()) {
      const load = () =>
        fetch(`/api/stake/status?address=${addr}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => {
            // ignore a response for a different address than the one now connected
            if (cancelled || d.address !== addr) return;
            setStatus({
              address: d.address,
              staked: d.staked || 0,
              lockDaysLeft: d.lockDaysLeft || 0,
              unlockable: !!d.unlockable,
              unlockAt: d.unlockAt ?? null,
              startAt: d.startAt || 0,
              started: !!d.started,
              nextAutopayAt: d.nextAutopayAt || 0,
              accruedYield: d.accruedYield || 0,
              accrualRatePerSec: d.accrualRatePerSec || 0,
              dailyYieldPct: d.dailyYieldPct || 0,
            });
          })
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
  }, [isDiff, connected, publicKey?.toBase58(), sig, refreshKey]);

  // DEPOSIT: one atomic tx — $PROM to the stake account + the 1-USDC fee to the
  // battery (Concorde: fee → battery, not dev). The read-only stake indexer watches
  // the stake account and credits the sender; yield accrues + distributes daily.
  async function deposit() {
    if (!publicKey || amt <= 0 || isDiff) return;
    if (lacksFee) { setErr(feeNote); return; }
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
      setAmount("");
      setNote("✓ Sent — confirming on Solana…");
      const ok = await refreshAfterConfirm(s, true);
      setNote(
        ok
          ? "✓ Staked — your $PROM is in the Relief Fund; balances updated, yield accruing."
          : "Sent — confirming; your balances will update shortly.",
      );
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
    if (lacksFee) { setErr(feeNote); return; }
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
      setRefreshKey((k) => k + 1);
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
    if (lacksFee) { setErr(feeNote); return; }
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

  const lacksFee = usdcBalance !== null && usdcBalance < 1; // no USDC for the 1-per-action fee
  const canDeposit = live && amt > 0 && !busy && !isDiff && !lacksFee;
  const canWithdraw = live && !busy && !isDiff && !!status?.unlockable && !lacksFee;
  const canClaim = live && !busy && !isDiff && !!status && status.staked > 0 && !lacksFee && status.started;
  const feeNote = "Each action costs 1 USDC — add USDC (Solana) to your wallet to continue.";
  const yieldPctLabel =
    status && status.address === publicKey?.toBase58() && status.dailyYieldPct
      ? (status.dailyYieldPct >= 1000
          ? Math.round(status.dailyYieldPct).toLocaleString()
          : status.dailyYieldPct.toLocaleString(undefined, { maximumFractionDigits: 2 })) + "% / day"
      : "—";

  return (
    <Panel label={isDiff ? "R&D Institute" : "Relief Fund"}>
      <div className="space-y-5">
        {/* buffer banner — staking open, yield starts for everyone at 08:30 UTC */}
        {!isDiff && status && !status.started && status.startAt > 0 && (
          <div className="border border-title/60 bg-title/10 p-3 text-xs text-title">
            ⏳ Staking is <span className="text-fg">open</span> — deposit now. Yield starts
            for everyone at <span className="text-fg">08:30 UTC</span> (in{" "}
            <Countdown target={status.startAt} />), so nobody front-runs it. Your 30-day
            unlock clock starts when you stake.
          </div>
        )}

        {/* balances */}
        <div className="space-y-2 border-b border-line pb-3">
          <div className="flex items-center justify-between">
            <span className="dash-note">$PROM balance</span>
            <span className="font-mono text-fg">
              {balance === null ? "—" : balance.toLocaleString()}{" "}
              <span className="dash-note">PROM</span>
            </span>
          </div>
          {!isDiff && (
            <div className="flex items-center justify-between">
              <span className="dash-note">USDC (for fees)</span>
              <span className={`font-mono ${lacksFee ? "text-red-400" : "text-fg"}`}>
                {usdcBalance === null
                  ? "—"
                  : usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                <span className="dash-note">USDC</span>
              </span>
            </div>
          )}
        </div>

        {/* your stake + live accrued yield (relief only) */}
        {!isDiff && status && status.address === publicKey?.toBase58() && status.staked > 0 && (
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
                {status.started ? (
                  <>
                    +
                    <AccruedYield base={status.accruedYield} perSec={status.accrualRatePerSec} />{" "}
                    <span className="dash-note">PROM</span>
                  </>
                ) : (
                  <span className="dash-note">paused · starts soon</span>
                )}
              </span>
            </div>
            {!status.started && status.startAt > 0 && (
              <div className="flex items-center justify-between">
                <span className="dash-note">Yield starts in</span>
                <span className="font-mono text-title">
                  <Countdown target={status.startAt} />
                </span>
              </div>
            )}
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
              Each day the Relief Fund releases {RELIEF_RELEASE_PCT}% of its
              balance to stakers, split <span className="text-fg">time-weighted</span> —
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
                  !status.started
                    ? "Yield starts at 08:30 UTC — nothing to claim yet"
                    : "Claim your accrued yield any time — no lock (1 USDC fee)"
                }
                onClick={claimYield}
              >
                {busy ? "…" : "CLAIM"}
              </NeonButton>
            )}
          </div>
        )}

        {/* fee warning — no USDC to cover the 1-per-action fee */}
        {!isDiff && connected && lacksFee && (
          <p className="text-xs text-red-400">
            ⚠ You need at least 1 USDC on Solana for the fee — staking, claiming, and
            unstaking each cost 1 USDC. Add USDC to your wallet, then try again.
          </p>
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
          Relief Fund) — agents pay the same via x402, no extra. Yield is
          paid automatically every day, or you can CLAIM it any time — no lock on
          yield (the 30-day lock is only on your staked principal).
        </p>
      </div>
    </Panel>
  );
}
