import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { faucetConfig } from "@/lib/faucet/config";
import {
  readSession,
  readValue,
  FAUCET_SESSION_COOKIE,
  FAUCET_XTOKEN_COOKIE,
} from "@/lib/faucet/session";
import { isValidPromAddress } from "@/lib/faucet/prom";
import { getTweet, tweetIdFromUrl } from "@/lib/faucet/x";
import {
  hasAddress,
  saveSubmission,
  getAccountByXId,
  getAccountByReferralCode,
  saveAccount,
  genReferralCode,
  type Account,
} from "@/lib/faucet/store";

export const runtime = "nodejs";

const round8 = (n: number) => Math.round(n * 1e8) / 1e8;

export async function POST(req: Request) {
  const profile = readSession(cookies().get(FAUCET_SESSION_COOKIE)?.value);

  if (!profile) {
    return NextResponse.json({ ok: false, error: "not_connected" }, { status: 401 });
  }
  if (!profile.eligible) {
    return NextResponse.json(
      { ok: false, error: "not_eligible", reasons: profile.reasons },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    address?: string;
    tweetUrl?: string;
    ranNode?: boolean;
    postedConfirmed?: boolean;
    referralCode?: string;
  };

  const address = String(body.address ?? "").trim();
  const tweetUrl = body.tweetUrl ? String(body.tweetUrl).trim() : null;
  const ranNode = Boolean(body.ranNode);
  const referralInput = String(body.referralCode ?? "").trim().toUpperCase();

  if (!isValidPromAddress(address)) {
    return NextResponse.json({ ok: false, error: "bad_address" }, { status: 400 });
  }

  // The post link is required so we can verify it.
  if (!tweetUrl) {
    return NextResponse.json({ ok: false, error: "post_required" }, { status: 400 });
  }
  const tweetId = tweetIdFromUrl(tweetUrl);
  if (!tweetId) {
    return NextResponse.json({ ok: false, error: "bad_tweet_url" }, { status: 400 });
  }

  // Verify the tweet: authored by the connected account AND tags @promethium_work.
  // If the X API is unavailable (plan/quota/expired token) we don't hard-block —
  // we log and fall back so a real user isn't stranded.
  const xToken = readValue(cookies().get(FAUCET_XTOKEN_COOKIE)?.value);
  let postVerified = false;
  if (xToken) {
    const t = await getTweet(xToken, tweetId);
    if (t.ok) {
      if (t.authorId && profile.id && t.authorId !== profile.id) {
        return NextResponse.json({ ok: false, error: "tweet_not_yours" }, { status: 400 });
      }
      if (!/@?promethium_work/i.test(t.text)) {
        return NextResponse.json({ ok: false, error: "tweet_no_mention" }, { status: 400 });
      }
      postVerified = true;
    } else {
      console.warn("[faucet] tweet verify unavailable — falling back:", t.status, t.reason);
    }
  } else {
    console.warn("[faucet] no X token at claim (expired session) — tweet not verified");
  }

  // one claim per X account
  if (getAccountByXId(profile.id)) {
    return NextResponse.json({ ok: false, error: "already_claimed" }, { status: 409 });
  }
  // one address per account (address not already taken)
  if (await hasAddress(address)) {
    return NextResponse.json({ ok: false, error: "duplicate" }, { status: 409 });
  }

  // optional referral code
  let referredBy: string | null = null;
  if (referralInput) {
    const owner = getAccountByReferralCode(referralInput);
    if (!owner || owner.xId === profile.id) {
      return NextResponse.json({ ok: false, error: "bad_referral" }, { status: 400 });
    }
    referredBy = owner.referralCode;
  }

  const base = profile.verified ? faucetConfig.rewardVerified : faucetConfig.rewardRegular;
  const reward = round8(base + (referredBy ? faucetConfig.referredExtra : 0));
  const referralCode = genReferralCode();
  const createdAt = new Date().toISOString();

  const account: Account = {
    xId: profile.id,
    username: profile.username,
    address,
    verified: profile.verified,
    reward,
    referralCode,
    referredBy,
    createdAt,
  };
  saveAccount(account);

  await saveSubmission({
    createdAt,
    xId: profile.id,
    username: profile.username,
    followers: profile.followers,
    accountAgeDays: profile.accountAgeDays,
    verified: profile.verified,
    address,
    reward,
    ranNode,
    tweetUrl,
    referralCode,
    referredBy,
    postVerified,
  });

  return NextResponse.json({
    ok: true,
    reward,
    verified: profile.verified,
    ranNode,
    referralCode,
    referredBy,
    referrerBonus: faucetConfig.referrerBonus,
    referredExtra: faucetConfig.referredExtra,
    nodeReward: faucetConfig.nodeReward,
    nodeDepositAddress: faucetConfig.nodeDepositAddress,
  });
}
