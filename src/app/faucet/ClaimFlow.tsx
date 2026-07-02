"use client";

import { useEffect, useState } from "react";
import TerminalCard from "@/components/ui/TerminalCard";
import { NeonButton } from "@/components/ui/NeonButton";
import type { FaucetSettings } from "@/lib/faucet/config";
import type { XProfile } from "@/lib/faucet/session";

type MeResponse = {
  connected: boolean;
  configured: boolean;
  profile: XProfile | null;
};

type ClaimResult = {
  ok: boolean;
  reward?: number;
  verified?: boolean;
  error?: string;
  reasons?: string[];
  referralCode?: string;
  referredBy?: string | null;
  referrerBonus?: number;
  referredExtra?: number;
};

const ERROR_TEXT: Record<string, string> = {
  not_connected: "Connect your X account first.",
  not_eligible: "Your account does not meet the eligibility criteria.",
  bad_address: "That doesn't look like a valid Promethium address. Double-check it.",
  post_required: "Paste the link to your post so we can verify it.",
  bad_tweet_url: "That doesn't look like a valid X post link. Paste the full link to your post.",
  tweet_not_yours: "That post isn't from your connected X account. Paste your own post.",
  tweet_no_mention: "Your post needs to tag @promethium_work. Edit it (or post again) and retry.",
  duplicate: "This address has already claimed. One claim per address.",
  already_claimed: "This X account has already claimed. One claim per X account.",
  bad_referral: "That referral code isn't valid. Leave it blank or fix it.",
  server: "Something went wrong. Please try again.",
};

// Bracketed link styled like NeonButton (used for navigations to API routes,
// which must be plain anchors — not client-side <Link>).
const BTN =
  "inline-flex items-center justify-center gap-2 border border-border px-4 py-2 font-mono uppercase tracking-wider text-title transition-colors duration-150 bg-transparent hover:bg-white/[0.06]";

function Bracket({ children }: { children: React.ReactNode }) {
  return (
    <span>
      <span className="text-fg-dim">[ </span>
      {children}
      <span className="text-fg-dim"> ]</span>
    </span>
  );
}

const INPUT =
  "w-full min-w-0 border border-border bg-bg-alt/60 px-3 py-2 font-mono text-fg placeholder:text-fg-dim focus:outline-none focus:border-title";

function shareIntent(s: FaucetSettings): string {
  const p = new URLSearchParams({ text: s.shareText, url: s.shareUrl });
  if (s.shareHashtags.length) p.set("hashtags", s.shareHashtags.join(","));
  return `https://twitter.com/intent/tweet?${p.toString()}`;
}

export default function ClaimFlow({ settings }: { settings: FaucetSettings }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [tweetUrl, setTweetUrl] = useState("");
  const [postedConfirmed, setPostedConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faucet/me", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ connected: false, configured: false, profile: null }));
  }, []);

  const profile = me?.profile ?? null;
  const connected = Boolean(me?.connected);
  const eligible = Boolean(profile?.eligible);
  const rewardTier = profile?.verified ? settings.rewardVerified : settings.rewardRegular;
  const locked = !connected || !eligible;

  async function copyPost() {
    try {
      const tags = settings.shareHashtags.length
        ? "\n" + settings.shareHashtags.map((h) => `#${h}`).join(" ")
        : "";
      await navigator.clipboard.writeText(
        `${settings.shareText}\n\n${settings.shareUrl}${tags}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/faucet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          tweetUrl: tweetUrl || undefined,
          postedConfirmed,
          referralCode: referralCode || undefined,
        }),
      });
      const data: ClaimResult = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.reasons?.length
            ? data.reasons.join(" ")
            : ERROR_TEXT[data.error ?? "server"] ?? ERROR_TEXT.server,
        );
      } else {
        setResult(data);
      }
    } catch {
      setError(ERROR_TEXT.server);
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Success ------------------------------------------------------------
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(result?.referralCode ?? "");
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (result?.ok) {
    return (
      <TerminalCard title="CLAIM RECORDED">
        <p className="text-title">✓ {result.reward} PROM queued for your address:</p>
        <p className="mt-2 break-all text-fg">{address}</p>
        {result.referredBy && (
          <p className="mt-2 text-fg-dim">
            + {result.referredExtra} PROM referral bonus applied (code {result.referredBy}).
          </p>
        )}
        <p className="mt-3 break-words text-fg-dim">
          Payouts are sent automatically in batches. Keep this wallet — that&apos;s
          where your PROM lands.
        </p>

        <div className="mt-5 border border-title/50 bg-bg-alt/60 p-3">
          <p className="text-fg-dim">// your referral code</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="break-all font-mono text-xl tracking-widest text-title">
              {result.referralCode}
            </span>
            <NeonButton onClick={copyCode}>{codeCopied ? "COPIED ✓" : "COPY"}</NeonButton>
          </div>
          <p className="mt-2 break-words text-fg-dim">
            Share it. You earn {result.referrerBonus} PROM for every friend who claims
            with your code, and they get {result.referredExtra} PROM extra.
          </p>
        </div>

        <p className="mt-4 text-fg-dim">One claim per X account — you&apos;re all set.</p>
      </TerminalCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {me?.configured === false && (
        <p className="break-words border border-border bg-bg-alt/60 px-3 py-2 text-fg-dim">
          <span className="text-title">// demo mode</span> — X keys not configured.
          &ldquo;Connect&rdquo; injects a sample eligible account so you can try the
          full flow.
        </p>
      )}

      {/* STEP 1 — CONNECT */}
      <TerminalCard title="STEP 1 · CONNECT X">
        <p className="mb-3 break-words text-fg-dim">
          Account must be {settings.minAccountAgeDays}+ days old with{" "}
          {settings.minFollowers}+ followers. Checked automatically.
        </p>
        {!connected ? (
          <a className={BTN} href="/api/faucet/auth/x/login">
            <Bracket>CONNECT WITH X</Bracket>
          </a>
        ) : (
          <div className="border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 break-all text-title">
                @{profile?.username}
                {profile?.verified && <span title="Verified"> ✔</span>}
              </span>
              <a
                className="shrink-0 text-fg-dim hover:underline"
                href="/api/faucet/auth/x/logout"
              >
                disconnect
              </a>
            </div>
            <div className="mt-1 text-fg-dim">
              {profile?.followers} followers · {profile?.accountAgeDays} days old
            </div>
            {eligible ? (
              <p className="mt-2 text-title">
                &gt; ELIGIBLE — you&apos;ll receive {rewardTier} PROM
                {profile?.verified ? " (verified tier)" : ""}.
              </p>
            ) : (
              <ul className="mt-2 list-inside list-disc break-words text-fg-dim">
                {profile?.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </TerminalCard>

      {/* STEP 2 — POST */}
      <div className={locked ? "pointer-events-none opacity-40" : ""}>
        <TerminalCard title="STEP 2 · POST">
          <p className="mb-3 break-words text-fg-dim">
            Post about Promethium in <span className="text-title">your own words</span> —
            please don&apos;t copy-paste. Unique posts reach more people (and X filters
            duplicate spam). Make it yours:
          </p>
          <ul className="mb-3 list-inside list-disc break-words text-fg">
            <li>
              mention <span className="text-title">@promethium_work</span>
            </li>
            <li>why you like the chain / what makes it different</li>
            <li>your bullish take + ideas for the project</li>
          </ul>
          <p className="mb-3 break-words text-fg-dim">
            &ldquo;Open X&rdquo; opens the composer already tagging @promethium_work with
            the link — just add your own thoughts.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <a className={BTN} href={shareIntent(settings)} target="_blank" rel="noreferrer">
              <Bracket>OPEN X →</Bracket>
            </a>
            <NeonButton onClick={copyPost}>{copied ? "COPIED ✓" : "COPY @ + LINK"}</NeonButton>
            <a className={BTN} href="/img/faucet-share.gif" download>
              <Bracket>IMAGE</Bracket>
            </a>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2 text-fg">
            <input
              type="checkbox"
              className="mt-1 accent-title"
              checked={postedConfirmed}
              onChange={(e) => setPostedConfirmed(e.target.checked)}
            />
            <span>I posted about Promethium (tagging @promethium_work)</span>
          </label>
          <input
            className={`${INPUT} mt-3`}
            placeholder="Paste your post link (https://x.com/…) — required, we verify it"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
          />
          <p className="mt-1 break-words text-fg-dim">
            We check your post is yours and tags @promethium_work.
          </p>
        </TerminalCard>
      </div>

      {/* STEP 3 — ADDRESS */}
      <div className={locked ? "pointer-events-none opacity-40" : ""}>
        <TerminalCard title="STEP 3 · ADDRESS">
          <p className="mb-3 break-words text-fg-dim">
            Paste your Promethium address.
          </p>
          <input
            className={INPUT}
            placeholder="Your Promethium (PROM) address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            spellCheck={false}
          />
          <a
            className="mt-2 inline-block break-words text-title hover:underline"
            href={settings.addressGuideUrl}
          >
            &gt; Don&apos;t have one? How to create a Promethium address →
          </a>

          <input
            className={`${INPUT} mt-3 uppercase tracking-widest`}
            placeholder={`Optional: referral code (+${settings.referredExtra} PROM)`}
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            spellCheck={false}
            maxLength={12}
          />

          {error && (
            <p className="mt-3 break-words border border-border bg-bg-alt/60 px-3 py-2 text-title">
              ! {error}
            </p>
          )}

          <div className="mt-4">
            <NeonButton
              onClick={submit}
              disabled={submitting || locked || !address || !tweetUrl}
            >
              {submitting
                ? "SUBMITTING…"
                : `CLAIM ${
                    referralCode
                      ? Math.round((rewardTier + settings.referredExtra) * 10) / 10
                      : rewardTier
                  } PROM`}
            </NeonButton>
          </div>
        </TerminalCard>
      </div>
    </div>
  );
}
