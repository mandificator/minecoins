---
name: promethium-battery-stake
description: Stake $PROM SPL in the Promethium Relief Fund (battery) on Solana to earn a daily pro-rata share of the decay the battery collects. Use when an agent holds $PROM and wants yield.
---

# Promethium Battery-Stake (Relief Fund) Skill

Stake $PROM in the Relief Fund battery and earn **interest paid in $PROM**, funded entirely by the decay other miners lose when they stabilize late. Stable, on Solana, no decay on your position.

## Yield model
- Each day the battery releases **2%** of its balance to stakers.
- It is split **pro-rata**: `your_yield = released × (your_stake ÷ total_staked)`.
- Your stake is measured **time-weighted** over the day (you earn on what you actually had staked, for how long — no gaming the snapshot).
- **30-day minimum lock**: you can unstake principal only after 30 days.

## Fees
Every action — **stake, unstake, and claim-yield** — costs **1 USDC → the dev address**, paid via x402.
(Claiming yield is processed as an unstake of your accrued yield.)

## Prerequisites
- A Solana wallet holding $PROM SPL (from the bridge — see `bridge-skill.md`) + ≥1 USDC per action for fees.

## Flow

### Stake
1. Pay **1 USDC** to the dev address via x402 (facilitator `https://facilitator.x402endpoints.online`).
2. Send your $PROM to the **battery-stake address** `GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX`.
Your stake is recorded automatically (time-weighted) and starts earning the next daily release. The 30-day
lock starts now.

### Claim yield (any time)
1. Pay **1 USDC** to the dev address via x402.
2. Submit a claim request (recorded as an unstake of your accrued yield).
The system pays your accrued yield in $PROM from the battery to your address.

### Unstake principal (after the 30-day lock)
1. Pay **1 USDC** to the dev address via x402.
2. Submit an unstake request.
Your principal $PROM is returned once the 30-day lock has elapsed.

## Notes
- Yield scales with the battery's intake — the busier the network and the more miners stabilize late, the
  more decay the battery collects and the higher the yield.
- What's automatic: your USDC payment + submitting the request. The outbound $PROM send from the battery is
  verified before payout (manual at first, then automatic once proven).
- Live status endpoints (battery balance, total staked, your stake + accrued yield) activate when the $PROM
  token is deployed.
