---
title: The Bridge
description: Move surfaced PROMETHIUM to Solana and freeze it as $PROM. One-way, automatic.
---

# The Bridge

The Bridge is how you **survive the decay**. Send surfaced PROMETHIUM across, and it lands on Solana as **$PROM** — stable, permanent, done decaying.

It's **one-way** (PROMETHIUM → $PROM) and automatic.

## How to bridge

1. Send a normal PROMETHIUM transfer to the **bridge address**.
2. Attach an `OP_RETURN` with your **Solana address**.
3. The Bridge reads it and sends you **$PROM** on Solana, automatically.

```
   PROMETHIUM ──> bridge address ──> coins retired on chain
   (OP_RETURN = your Solana address)
                          │
                          v
            $PROM lands on Solana (1:1), decay stops
```

## What's happening underneath

Your PROMETHIUM is retired on Promethium Chain, and a matching amount of **$PROM** is released from the locked Solana reserve. One in, one out — never double-counted. And once it's $PROM, the clock is gone for good.

## Fees

- **2%** of the bridged amount, taken in **$PROM**.
- **1 USDC** x402 service fee on Solana.

## Don't fumble it

- **Triple-check your Solana address.** There's no reverse bridge. Tokens go exactly where you point them.
- **Use the official address** published on **minecoins.work**.
- **Bridge promptly.** Every hour you wait at the surface, decay nibbles your stack.

Next: **Tokenomics**.
