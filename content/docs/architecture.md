---
title: Architecture
description: The node, the miner, the oracle, and the Battery — how the pieces fit.
---

# Architecture

Four moving parts, one loop.

## The Node — Promethium Chain

A Bitcoin-codebase fork. It validates blocks and transactions, enforces Proof-of-Work and the 21M cap, runs the **decay** on surfaced promethium, feeds decayed coins into the **Battery**, and applies each miner's difficulty discount.

## The Miner

Standard SHA-256 mining — CPU, GPU, ASIC, solo or pool. Produces the hashes that find blocks and earn PROMETHIUM.

## The Oracle

Reads the **staking program on Solana** and reports it to the chain:

- how much $PROM you've staked in the **Difficulty Pool** → sets your discount (up to 3×)
- how much in the **Battery Pool** → sets your share of payouts

No oracle reading = no discount, no yield. Mining still works at full difficulty.

## The Battery

A reservoir on-chain that captures decayed promethium and pays it out to the Battery Pool.

## How it fits

```
   MINER ──mines──> PROMETHIUM CHAIN ──decay──> THE BATTERY ──> Battery Pool
                    │                                          payouts
                    └──bridge──> $PROM on Solana   (decay stops)

   ORACLE reads your Solana stakes ──> difficulty discount (3x) + Battery share
```

Next: **Get Started**.
