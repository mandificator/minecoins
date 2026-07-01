import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { faucetConfig } from "@/lib/faucet/config";
import { readSession, FAUCET_SESSION_COOKIE } from "@/lib/faucet/session";
import { isValidPromAddress } from "@/lib/faucet/prom";
import { hasAddress, saveSubmission } from "@/lib/faucet/store";

export const runtime = "nodejs";

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
  };

  const address = String(body.address ?? "").trim();
  const tweetUrl = body.tweetUrl ? String(body.tweetUrl).trim() : null;
  const ranNode = Boolean(body.ranNode);
  const postedConfirmed = Boolean(body.postedConfirmed);

  if (!isValidPromAddress(address)) {
    return NextResponse.json({ ok: false, error: "bad_address" }, { status: 400 });
  }
  if (!postedConfirmed && !tweetUrl) {
    return NextResponse.json({ ok: false, error: "post_required" }, { status: 400 });
  }
  if (await hasAddress(address)) {
    return NextResponse.json({ ok: false, error: "duplicate" }, { status: 409 });
  }

  const reward = profile.verified
    ? faucetConfig.rewardVerified
    : faucetConfig.rewardRegular;

  await saveSubmission({
    createdAt: new Date().toISOString(),
    xId: profile.id,
    username: profile.username,
    followers: profile.followers,
    accountAgeDays: profile.accountAgeDays,
    verified: profile.verified,
    address,
    reward,
    ranNode,
    tweetUrl,
  });

  return NextResponse.json({
    ok: true,
    reward,
    verified: profile.verified,
    ranNode,
    nodeReward: faucetConfig.nodeReward,
    nodeDepositAddress: faucetConfig.nodeDepositAddress,
  });
}
