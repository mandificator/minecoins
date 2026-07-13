---
name: promethium-battery-stake
description: Stake $PROM SPL in the Promethium Relief Fund (battery) on Solana to earn a daily pro-rata share of the decay the battery collects. Use when an agent holds $PROM and wants yield.
---

# Promethium Battery-Stake (Relief Fund) Skill

Stake $PROM in the Relief Fund battery and earn **interest paid in $PROM**, funded entirely by the decay other miners lose when they stabilize late. Stable, on Solana, no decay on your position.

> **Status: launching shortly — final testing in progress.** The mechanic below is final; the stake action goes live once opened. Until then the DEPOSIT button on `promethium.work/staking/relief-fund` stays disabled.

## Yield model
- Each day the battery releases **2%** of its balance to stakers — **automatically, to everyone, by default**. You don't need to do anything; your share is computed and sent to you daily in $PROM. (Agents may *optionally* claim on-demand instead — see the flow below — but it's never required, and the same accrual is never paid twice.)
- It is split **pro-rata**: `your_yield = released × (your_stake ÷ total_staked)`.
- Your stake is measured **time-weighted** over the day (you earn on what you actually had staked, for how long — no gaming the snapshot).
- **30-day minimum lock**: you can unstake principal only after 30 days. Yield is not locked.

## Fees
Staking and unstaking each cost **1 USDC**, paid via x402 — and the fee goes to the **Relief Fund battery** (`2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT`), growing the fund everyone earns from. (Receiving yield is free — it's paid to you automatically.)

## Addresses
| Role | Address |
|---|---|
| Stake account ($PROM you stake) | `GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX` |
| Battery / Relief Fund (fee + yield source) | `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT` |

## Prerequisites
- A Solana wallet holding $PROM SPL (from the bridge — see `bridge-skill.md`) + ≥1 USDC per stake/unstake action.

## Agentic flow (x402) — the main way

Every action is driven by two calls against `promethium.work`: create an intent (free), then pay its 1-USDC fee over x402. The `intentId` ties the fee to the action.

```
1. Create the intent
   POST /api/battery/intent   { "action": "stake"|"unstake"|"claim", "address": "<your-solana>", "amount": <PROM, stake only> }
   -> { intentId, action, stakeAddress, batteryAddress, usdcMemo, payEndpoint, instructions }

2. Pay the 1-USDC fee (x402, goes to the BATTERY)
   GET /api/battery/pay/<intentId>        (unpaid -> HTTP 402 with the terms; payTo = battery)
   pay via the facilitator https://facilitator.x402endpoints.online, then retry the SAME
   /api/battery/pay/<intentId> with the X-PAYMENT header. On settle we record the action.

3. STAKE only — also send your $PROM
   Send <amount> $PROM to the stake account (stakeAddress from step 1). The indexer credits
   you as a staker (by the sender); the 30-day lock starts on deposit.
```

- **Stake:** intent(action=stake, amount) → pay 1 USDC (x402) → send $PROM to the stake account.
- **Unstake** (after the 30-day lock): intent(action=unstake) → pay 1 USDC (x402). Principal returned by the Relief Fund.
- **Claim (optional):** intent(action=claim) → pay 1 USDC (x402) to pull your accrued yield on demand. **You do NOT need to claim** — yield auto-sends daily by default. Claim is only for agents who want to pull on their own schedule. **No double-pay:** your accrual is a single running balance; whichever pays it first — the daily auto-send OR a claim — consumes it, so the same yield is never paid twice.

Complete the payment through **our** `/api/battery/pay` endpoint (not out-of-band with the facilitator) — that's what records it against your intent.

## Manual flow (browser / direct)

### Stake
One transaction, two transfers:
1. Send your **$PROM → the stake account** `GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX`.
2. Send **1 USDC → the battery** `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT` (the fee).
Both go in the SAME tx, so you can't stake without paying the fee. Your stake is recorded automatically (the indexer credits the sender), starts earning the next daily release, and the 30-day lock starts now.

### Earn yield (automatic)
Nothing to do. Each day the distributor computes your pro-rata, time-weighted share of the 2% release and pays it to your Solana address in $PROM. No claim, no fee.

### Unstake principal (after the 30-day lock)
1. Pay **1 USDC → the battery** via x402 (or a direct transfer with the intentId memo).
2. Submit an unstake request (`POST /api/stake/request` with your address + the fee tx signature).
Your principal $PROM is returned once the request is processed.

### Check your stake
`GET https://promethium.work/api/stake/status?address=<your-solana-address>` →
`{ staked, lockDaysLeft, unlockable }`. Battery/pool totals: `GET /api/battery/stats`.

## Notes
- Yield scales with the battery's intake — the busier the network and the more miners stabilize late, the more decay the battery collects and the higher the yield.
- What's automatic: your stake is credited on-chain by the indexer; yield is distributed daily. The outbound $PROM sends (yield + returned principal) are verified before payout.
