/**
 * Abstraction layer for the $PROM staking program on Solana.
 *
 * The real program is not deployed yet. This module is the SINGLE place to wire
 * it up: replace the placeholder difficulty curve and implement `stake`/
 * `unstake`/`getStakeAccount` against the real program ID once it exists.
 */

import { type Connection, PublicKey } from "@solana/web3.js";
import { MAX_DISCOUNT, isStakingLive } from "./config";

export type StakeStatus = {
  stakedAmount: number; // $PROM currently staked
  discount: number; // current difficulty multiplier, 1..MAX_DISCOUNT
};

/**
 * Difficulty discount as a function of staked $PROM.
 *
 * TODO: replace with the published curve. Placeholder: a saturating curve that
 * approaches the MAX_DISCOUNT (3x) ceiling. `half` is the stake at which you
 * reach the midpoint of the extra discount range.
 */
export function estimateDiscount(stakedMine: number): number {
  const amount = Math.max(0, stakedMine);
  const half = 2000; // placeholder reference stake
  const extra = (MAX_DISCOUNT - 1) * (amount / (amount + half));
  const discount = 1 + extra;
  return Math.min(MAX_DISCOUNT, Math.round(discount * 100) / 100);
}

/** Token balance read — only meaningful once the mint is configured. */
export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mint: string
): Promise<number | null> {
  // Free (unstaked) $PROM in the connected wallet: sum the owner's token
  // accounts for the mint. Returns 0 if none, null only on RPC failure ("—").
  if (!mint) return null;
  try {
    const res = await connection.getParsedTokenAccountsByOwner(owner, {
      mint: new PublicKey(mint),
    });
    if (!res.value.length) return 0;
    return res.value.reduce(
      (a, x: any) => a + (x.account.data.parsed.info.tokenAmount.uiAmount || 0),
      0,
    );
  } catch {
    return null;
  }
}

export async function getStakeStatus(
  _connection: Connection,
  _owner: PublicKey
): Promise<StakeStatus | null> {
  // TODO: read the staking account from the staking program.
  return null;
}

/** The two separate staking pools. */
export type Pool = "difficulty" | "relief";

/**
 * Estimated Relief Fund yield share for a given stake.
 *
 * TODO: replace with the real on-chain computation (your stake / total pool
 * stake × Relief Fund balance). Returns null until the program is live so the
 * UI shows "—" rather than a fake number.
 */
export async function getReliefShare(_stakedProm: number): Promise<number | null> {
  return null;
}

export type ActionResult = { ok: false; reason: "not-live" } | { ok: true; signature: string };

export async function stake(_pool: Pool, _amount: number): Promise<ActionResult> {
  if (!isStakingLive()) return { ok: false, reason: "not-live" };
  // TODO: build + send the stake instruction for the given pool
  // (and settle the 1 USDC x402 fee).
  throw new Error("Staking program wiring not implemented yet.");
}

export async function unstake(_pool: Pool, _amount: number): Promise<ActionResult> {
  if (!isStakingLive()) return { ok: false, reason: "not-live" };
  // TODO: build + send the unstake instruction for the given pool
  // (and settle the 1 USDC x402 fee).
  throw new Error("Staking program wiring not implemented yet.");
}
