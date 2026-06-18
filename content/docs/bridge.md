---
title: The Bridge
description: Always the next step after surfacing. What survived the wait becomes $PROM; what decayed feeds the Battery.
---

# The Bridge

The Bridge is how surfaced promethium leaves Promethium Chain and lands on Solana as **$PROM**. It's **one-way** (PROMETHIUM -> $PROM) and automatic — and it's *always* your next step after promethium surfaces.

## The split

When you bridge, the Bridge checks how long your promethium sat at the surface and splits the result:

- **What you saved** -> sent to you as **$PROM** on Solana, stable forever.
- **What decayed** while you waited -> captured and drained into **the Battery**.

Bridge instantly and you keep nearly everything. Bridge late and a bigger slice goes to the Battery instead of to you. You never lose it all — you lose a slice that grows with time.

## How to bridge

1. Send a normal PROMETHIUM transfer to the **bridge address**.
2. Attach an `OP_RETURN` with your **Solana address**.
3. The Bridge reads it, applies the split, and sends your surviving **$PROM** to Solana, automatically.

```
   PROMETHIUM --> bridge address --> split by time
   (OP_RETURN = your Solana address)
          |                                |
          | what you saved                 | what decayed
          v                                v
     $PROM to your wallet (1:1)       the Battery -> stakers
```

## Fees

- **2%** of the bridged amount, taken in **$PROM**.
- **1 USDC** x402 service fee on Solana.

## Don't fumble it

- **Triple-check your Solana address.** There's no reverse bridge. Tokens go exactly where you point them.
- **Use the official address** published on **minecoins.work**.
- **Bridge promptly.** Every hour you wait, decay hands a bigger slice to the Battery.

Next: **Tokenomics**.
