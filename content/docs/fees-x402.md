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
| Agent checks the chain (any promethium to stabilize?) | **0.10 USDC** (10¢) | USDC | x402 on Solana |

Stabilizing has two parts: the 2% (in $PROM) + the 1 USDC x402 call. Everything else is 1 USDC per action — except the chain check, which is just **10¢**.

## Where the fees go

Fees aren't pocketed — half of every fee builds the market, half runs the Company.

- **Agent fees (USDC):** 50% to the Company; 50% **buys $PROM on the open market** and goes into the pool.
- **Stabilization fee ($PROM):** 50% to the Company; 50% goes **straight into the pool**.

The $PROM bought and deposited isn't burned — it becomes **liquidity the Company owns** (single-sided on Meteora DLMM). It can't be pulled out from under you, its swap fees flow back to the protocol, and the open-market buying is standing **buy pressure** that scales with usage. Same conservation rule as decay: nothing destroyed, value put to work.

## The agent does your work — from as low as 10¢ a check

When an agent runs an action for you, **it pays the same x402 fees listed above — nothing on top.** There is no separate "agent fee." The cost of doing it agentically is identical to doing it by hand; you just don't have to be awake for it.

The agent's core job is watching: it pays **10¢ per check** to look at the chain and see whether you have promethium that surfaced and needs stabilizing. You decide how often it checks — every few minutes, hourly, daily — and you pay for the checks you ask for. The more often it watches, the better it beats the 17.7h clock, and the more checks you pay for.

**You have to fund the agent.** It can only pay these x402 fees if it has its own balance, so you keep money in its wallet. We recommend keeping **at least 10 USDC** in the agent's pocket at all times so it never misses a stabilization for lack of funds.

## Why x402

- **Automatic** — agents pay and act with no checkout, no accounts.
- **Fair** — pay only for what you use.
- **Instant** — settled in USDC on Solana.

Next: **Architecture**.
