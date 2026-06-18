---
title: Fees & x402
description: Pay-per-call, 1 USDC per action via x402 on Solana. The agent pays exactly this — nothing extra.
---

# Fees & x402

The Agentic Mining Company runs on **x402**, the pay-per-call standard. Every Syndicate action — stabilizing, staking, withdrawing — settles a flat payment in USDC on Solana. Built so an agent can pay and act without accounts or checkout.

## The fees

| Action | Fee | Paid in | Where |
| --- | --- | --- | --- |
| Stabilize PROMETHIUM -> $PROM | **2%** of the amount | $PROM | on the transfer |
| Stabilize (service call) | **1 USDC** | USDC | x402 on Solana |
| Stake / unstake (R&D Institute) | **1 USDC** | USDC | x402 on Solana |
| Deposit / withdraw (Relief Fund) | **1 USDC** | USDC | x402 on Solana |

Stabilizing has two parts: the 2% (in $PROM) + the 1 USDC x402 call. Everything else is 1 USDC per action.

## The agent pays exactly these

When an agent runs an action for you, **it pays the same x402 fees listed above — nothing on top.** There is no separate "agent fee." The cost of doing it agentically is identical to doing it by hand; you just don't have to be awake for it.

## Why x402

- **Automatic** — agents pay and act with no checkout, no accounts.
- **Fair** — pay only for what you use.
- **Instant** — settled in USDC on Solana.

Next: **Architecture**.
