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
  // Solana account that receives the 1-USDC bridge fee (set at launch).
  bridgeAddress: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "",
  // Solana account for the decayed remainder — the Relief Fund "battery" (set at launch).
  batteryAddress: process.env.NEXT_PUBLIC_BATTERY_ADDRESS || "",
  feeAddress: process.env.NEXT_PUBLIC_FEE_ADDRESS || "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "",
  // PROM-chain deposit address users send their PROM to (with the OP_RETURN).
  promBridgeAddress:
    process.env.NEXT_PUBLIC_PROM_BRIDGE_ADDRESS ||
    "prom1qhpup76k3d8hr7aydl6cl4s8q4s8z7upr4pdvt7",
  // Solana account where users stake $PROM to earn yield from the battery (Relief Fund).
  batteryStakeAddress:
    process.env.NEXT_PUBLIC_BATTERY_STAKE_ADDRESS ||
    "GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX",
  // Solana account that receives the 2% bridge fee taken from the healthy $PROM.
  bridgeFeeAddress:
    process.env.NEXT_PUBLIC_BRIDGE_FEE_ADDRESS ||
    "EPRPcLNMH65nxfSjWi6bdMkcifeym3DMbt5JTJ23HvHH",
} as const;

export const isStakingLive = (): boolean =>
  solanaConfig.stakingProgramId.trim().length > 0;

// The bridge's Solana side is "live" only when BOTH the fee account and the
// battery account are configured — until then the USDC payment stays disabled.
export const isBridgeLive = (): boolean =>
  solanaConfig.bridgeAddress.trim().length > 0 &&
  solanaConfig.batteryAddress.trim().length > 0;

export const isTokenLive = (): boolean =>
  solanaConfig.promTokenMint.trim().length > 0;

/** Flat USDC x402 service fee per protocol action. */
export const X402_FEE_USDC = 1;
/** Bridge fee taken in $PROM. */
export const BRIDGE_FEE_PCT = 0.02;
/** Maximum mining difficulty discount achievable by staking. */
export const MAX_DISCOUNT = 3;

/** Relief Fund (battery) staking — % of the battery released to stakers each day. */
export const RELIEF_RELEASE_PCT = 2;
/** Relief Fund minimum stake lock (days). */
export const RELIEF_MIN_STAKE_DAYS = 30;
/** Relief Fund (battery) is stakeable only once the $PROM token is deployed. */
export const isReliefLive = (): boolean => isTokenLive();
