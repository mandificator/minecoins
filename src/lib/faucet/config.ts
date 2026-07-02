// Configuration for the /faucet feature.
// Plain values are safe to pass to the client (see faucet/page.tsx).

export const faucetConfig = {
  // Reward tiers (in PROM). Actual sending happens off-site; we record addresses.
  rewardRegular: 1, // regular X accounts
  rewardVerified: 3, // verified / blue-check accounts

  // Node bonus: send a dust deposit from a running node, get a big reward back.
  nodeDeposit: 0.001,
  nodeReward: 10,

  // Eligibility thresholds for the connected X account.
  minFollowers: 100,
  minAccountAgeDays: 90, // ~3 months

  // Address miners send 0.001 PROM to in order to prove they run a node.
  nodeDepositAddress:
    process.env.NEXT_PUBLIC_FAUCET_NODE_ADDRESS ||
    "PromNodeDepositAddr1111111111111111111111111",

  // Guide that teaches users how to create a Promethium address.
  addressGuideUrl:
    process.env.NEXT_PUBLIC_FAUCET_GUIDE_URL || "/docs/get-started",

  officialX: "https://x.com/promethium_work",

  // Ready-to-post copy handed to users so posting is effortless.
  shareText:
    "win of the day! just got my hands on some fresh-fauceted Promethium\n\nwhy's it a win?\n\nbecause @promethium_work is the first PoW-mined minecoin on its own dedicated chain, then entangled on @solana",
  shareUrl: "https://promethium.work",
  shareHashtags: [] as string[],
} as const;

export type FaucetSettings = {
  rewardRegular: number;
  rewardVerified: number;
  nodeDeposit: number;
  nodeReward: number;
  minFollowers: number;
  minAccountAgeDays: number;
  nodeDepositAddress: string;
  addressGuideUrl: string;
  shareText: string;
  shareUrl: string;
  shareHashtags: readonly string[];
};

export function faucetClientSettings(): FaucetSettings {
  const c = faucetConfig;
  return {
    rewardRegular: c.rewardRegular,
    rewardVerified: c.rewardVerified,
    nodeDeposit: c.nodeDeposit,
    nodeReward: c.nodeReward,
    minFollowers: c.minFollowers,
    minAccountAgeDays: c.minAccountAgeDays,
    nodeDepositAddress: c.nodeDepositAddress,
    addressGuideUrl: c.addressGuideUrl,
    shareText: c.shareText,
    shareUrl: c.shareUrl,
    shareHashtags: c.shareHashtags,
  };
}

// Exact redirect URI registered in the X developer portal (must match login +
// callback). Native route, so origin-based.
export function getRedirectUri(origin: string): string {
  return (
    process.env.TWITTER_REDIRECT_URI || `${origin}/api/faucet/auth/x/callback`
  );
}
