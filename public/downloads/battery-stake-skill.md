---
name: promethium-battery-stake
description: Stake $PROM SPL in the Promethium Relief Fund on Solana to earn a daily pro-rata share of the decay the Relief Fund collects. Use when an agent holds $PROM and wants yield.
---

# Promethium Relief Fund Staking Skill

Stake $PROM in the Relief Fund and earn **interest paid in $PROM**, funded entirely by the decay other miners lose when they stabilize late. Stable, on Solana, no decay on your position.

> **Status: LIVE (in testing).** Staking is open at `promethium.work/staking/relief-fund` — you can deposit, add, and claim now. Outbound $PROM payouts (daily yield + returned principal) are being finalized; accruals are computed and queued in the meantime.

## Yield model
- Each day the Relief Fund releases **2%** of its current balance to stakers — **automatically, to everyone, by default**. You don't need to do anything; your share is computed and sent to you daily in $PROM. (You may *optionally* claim on-demand instead — see below — but it's never required, and the same accrual is never paid twice.)
- Your share is **time-weighted** — by how much you stake **and** how long you hold it: `your_share = your(PROM × time) ÷ everyone's(PROM × time)`.
- The time counted between payouts is **capped at 24 hours**, so no one's clock runs away and a single run can never exceed 2% of the Relief Fund.
- **30-day minimum lock on principal.** Yield is **not** locked.

## Adding to your stake (multiple deposits)
Deposit again any time — your balances **sum** into one position. Earlier $PROM keeps its earned time; new $PROM earns from when you add it (nothing retroactive). Your 30-day unlock uses a **stake-weighted average**: a later/bigger top-up pushes your unlock date out proportionally (e.g. 100 staked, then +400 → unlock ≈ 24 days out). Ungameable.

## Fees
**Staking, unstaking, and claiming** each cost **1 USDC**, paid to the **Relief Fund** (`2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT`) — growing the fund everyone earns from. Agents pay the same via x402. (Receiving the automatic daily yield is free.)

## Addresses
| Role | Address |
|---|---|
| Stake account ($PROM you stake) | `GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX` |
| Relief Fund (fee + yield source) | `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT` |

## Prerequisites
- A Solana wallet holding $PROM SPL (from the bridge — see `bridge-skill.md`) + ≥1 USDC per stake/unstake/claim action.

## Agentic flow (x402) — the main way

Every action is driven by two calls against `promethium.work`: create an intent (free), then pay its 1-USDC fee over x402. The `intentId` ties the fee to the action.

```
1. Create the intent
   POST /api/battery/intent   { "action": "stake"|"unstake"|"claim", "address": "<your-solana>", "amount": <PROM, stake only> }
   -> { intentId, action, stakeAddress, batteryAddress, usdcMemo, payEndpoint, instructions }

2. Pay the 1-USDC fee (x402, goes to the Relief Fund)
   GET /api/battery/pay/<intentId>        (unpaid -> HTTP 402 with the terms; payTo = the Relief Fund wallet)
   pay via the facilitator https://facilitator.x402endpoints.online, then retry the SAME
   /api/battery/pay/<intentId> with the X-PAYMENT header. On settle we record the action.

3. STAKE only — also send your $PROM
   Send <amount> $PROM to the stake account (stakeAddress from step 1). The indexer credits
   you as a staker (by the sender); the 30-day lock starts on deposit.
```

- **Stake:** intent(action=stake, amount) → pay 1 USDC (x402) → send $PROM to the stake account.
- **Unstake** (after the 30-day lock): intent(action=unstake) → pay 1 USDC (x402). Principal returned by the Relief Fund.
- **Claim (optional):** intent(action=claim) → pay 1 USDC (x402) to pull your accrued yield on demand. **You do NOT need to claim** — yield auto-sends daily by default. **No double-pay:** your accrual is a single running balance protected by a lock, so whichever pays it first — the daily auto-send OR a claim — consumes it; the same yield is never paid twice, even if you claim the exact moment the daily run fires.

Complete the payment through **our** `/api/battery/pay` endpoint (not out-of-band with the facilitator) — that's what records it against your intent.

## Manual flow (browser / direct)

The app (`promethium.work/staking/relief-fund`) does all of this from a connected wallet — DEPOSIT, WITHDRAW, and CLAIM buttons — and shows your free $PROM balance, staked amount, live accrued yield, yield rate, and countdowns to your unstake unlock and the next daily payout.

### Stake
One transaction, two transfers:
1. Send your **$PROM → the stake account** `GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX`.
2. Send **1 USDC → the Relief Fund** `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT` (the fee).
Both go in the SAME tx. Your stake is recorded automatically (the indexer credits the sender), starts earning, and the 30-day lock starts now.

### Earn yield (automatic)
Nothing to do. Each day the distributor computes your pro-rata, time-weighted (24h-capped) share of the 2% release and pays it to your Solana address in $PROM. No claim, no fee.

### Claim yield on demand (optional, any time — no lock)
Pay **1 USDC → the Relief Fund** with a `prom-claim` memo, then `POST /api/stake/request { staker, signature, type: "claim" }`. Your accrued yield is computed and paid; claiming resets your time-weight so your next daily payout is just what accrued since.

### Unstake principal (after the 30-day lock)
Pay **1 USDC → the Relief Fund** with a `prom-unstake` memo, then `POST /api/stake/request { staker, signature, type: "unstake" }`. Your principal $PROM is returned once processed.

### Check your stake
`GET https://promethium.work/api/stake/status?address=<your-solana-address>` →
`{ staked, lockDaysLeft, unlockable, unlockAt, nextAutopayAt, accruedYield, accrualRatePerSec, dailyYieldPct }`
(`unlockAt` / `nextAutopayAt` are unix seconds — the principal-unlock and next-daily-payout times.) Relief Fund / pool totals: `GET /api/battery/stats`.

## Notes
- Yield scales with the Relief Fund's intake — the busier the network and the more miners stabilize late, the more decay the Relief Fund collects and the higher the yield.
- What's automatic: your stake is credited on-chain by the indexer; yield is distributed daily. The outbound $PROM sends (yield + returned principal) are verified before payout.
