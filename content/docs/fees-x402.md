---
title: Fees & x402
description: Pay-per-call, 1 USDC per action via x402 on Solana. Built for agents.
---

# Fees & x402

Promethium is agentic. Bridging and staking are made to be called by people *and* by bots — so they're paid per action with **x402**, the pay-per-call standard, in USDC on Solana.

## The fees

| Action | Fee | Paid in | Where |
| --- | --- | --- | --- |
| Bridge PROMETHIUM → $PROM | **2%** of the amount | $PROM | on the bridge transfer |
| Bridge (service call) | **1 USDC** | USDC | x402 on Solana |
| Stake $PROM | **1 USDC** | USDC | x402 on Solana |
| Unstake $PROM | **1 USDC** | USDC | x402 on Solana |

Bridging has two parts: the 2% (in $PROM) + the 1 USDC x402 call. Staking and unstaking are 1 USDC each.

## Why x402

- **Automatic** — agents pay and act with no checkout, no accounts.
- **Fair** — pay only for what you use.
- **Instant** — settled in USDC on Solana.

This is the rail that makes "agentic mining" actually work: a bot can pay 1 USDC and bridge your promethium before it decays, while you sleep.

Next: **Agentic Mining**.
