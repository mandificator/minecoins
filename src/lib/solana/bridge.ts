/**
 * Abstraction layer for the one-way Promethium -> $PROM bridge.
 *
 * The bridge has no signing flow on the website: bridging is initiated by a
 * Promethium transfer on Promethium Chain carrying an OP_RETURN with the user's Solana
 * address. This module just computes the amounts and the OP_RETURN payload the
 * user (or their agent) must attach. No fake transactions.
 */

import { BRIDGE_FEE_PCT, X402_FEE_USDC } from "./config";

export type BridgeQuote = {
  send: number; // Promethium the user sends
  feeMine: number; // 2% taken in $PROM
  receive: number; // $PROM received after fee
  x402Usdc: number; // flat USDC x402 service fee
};

export function quoteBridge(amount: number): BridgeQuote {
  const send = Math.max(0, amount);
  const feeMine = round8(send * BRIDGE_FEE_PCT);
  const receive = round8(send - feeMine);
  return { send, feeMine, receive, x402Usdc: X402_FEE_USDC };
}

function round8(n: number): number {
  return Math.round(n * 1e8) / 1e8;
}

/**
 * Build the OP_RETURN payload to embed in the Promethium transfer.
 *
 * TODO: confirm the exact framing/prefix published with the node release. For
 * now we return the raw Solana address, which is what the bridge reads.
 */
export function buildOpReturn(solanaAddress: string): string {
  return solanaAddress.trim();
}

/** Loose Solana base58 address check (32-44 chars, base58 alphabet). */
export function looksLikeSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}
