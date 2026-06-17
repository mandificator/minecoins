/**
 * Single source of truth for on-chain addresses / program IDs.
 *
 * The on-chain programs (oracle, staking program, bridge) do NOT exist yet.
 * Everything is read from env vars so wiring up the real deployment is a
 * one-place change. When a value is missing the UI shows a disabled state
 * with a "Coming at mainnet" badge — never a fake transaction.
 */

export const solanaConfig = {
  rpc: process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com",
  promTokenMint: process.env.NEXT_PUBLIC_PROM_TOKEN_MINT || "",
  stakingProgramId: process.env.NEXT_PUBLIC_STAKING_PROGRAM_ID || "",
  bridgeAddress: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "",
  feeAddress: process.env.NEXT_PUBLIC_FEE_ADDRESS || "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "",
} as const;

export const isStakingLive = (): boolean =>
  solanaConfig.stakingProgramId.trim().length > 0;

export const isBridgeLive = (): boolean =>
  solanaConfig.bridgeAddress.trim().length > 0;

export const isTokenLive = (): boolean =>
  solanaConfig.promTokenMint.trim().length > 0;

/** Flat USDC x402 service fee per protocol action. */
export const X402_FEE_USDC = 1;
/** Bridge fee taken in $PROM. */
export const BRIDGE_FEE_PCT = 0.02;
/** Maximum mining difficulty discount achievable by staking. */
export const MAX_DISCOUNT = 3;
