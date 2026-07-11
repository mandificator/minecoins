---
title: The Stabilization Plant
description: Decant surfaced PROMETHIUM into stable $PROM on Solana. Agentic by design.
---

# The Stabilization Plant

The Stabilization Plant is the Syndicate's bridge: raw, decaying **PROMETHIUM** goes in, stable **$PROM** comes out on Solana. It's **one-way** (PROMETHIUM -> $PROM) and **agentic** — built to be called by an agent the moment your promethium surfaces.

> **$PROM token (Solana):** `promP7gZmjt3fMVWfx47swYBpfwrjb2m3TX4c3woDBu` — 21,000,000 max supply, mint authority renounced (permanently capped), 8 decimals, entangled 1:1 with chain-side PROMETHIUM.
>
> **Activation:** the Stabilization Plant goes live at **block 29300** on the Promethium chain — that is when the decay clock starts. Every coin already older than 100 blocks at 29300 begins decaying then; younger coins begin 100 blocks after their own mining. Until activation, all PROMETHIUM stays fully healthy.

## Decantation: the split

The Plant decants your batch. The pure fraction that survived the wait crystallizes into $PROM; whatever decayed settles out as sediment and drains into the **Relief Fund**.

```
   X PROMETHIUM in
        |
        +--> Y  $PROM to your Solana wallet   (what survived)
        +--> decayed slice -> Relief Fund     (pays stakers)

   X = Y + decayed
```

So: **you send X PROMETHIUM, you receive Y $PROM**, where `Y = X - decayed`. The faster you stabilize, the smaller the decayed slice, the closer Y gets to X.

**Decay freezes the instant your deposit confirms.** The moment your batch is mined into a block, its healthy/decayed split is locked to that block's time — it does not keep decaying while it waits to settle, even if blocks accelerate afterward.

## One-way: the PROMETHIUM is burned

The PROMETHIUM you feed into the Plant is never stockpiled or re-spent. Once your batch is decanted and your $PROM is on Solana, the incoming PROMETHIUM is swept to a **black hole** — a provably-unspendable address (no private key can ever exist for it), so those coins are destroyed forever. That is what makes the bridge truly one-way: chain-side PROMETHIUM leaves circulation as stable $PROM takes its place on Solana. **There is no reverse bridge.**

## Fees & accounts

- **1 USDC** service fee, paid on Solana to the **dev address** `AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa` — via x402 (agents) or a direct wallet transfer you then verify (browsers).
- **2%** of the stabilized (healthy) amount, taken in **$PROM**, sent to the **bridge fee address** `EPRPcLNMH65nxfSjWi6bdMkcifeym3DMbt5JTJ23HvHH`.
- The **decayed** slice (in $PROM) drains to the **Relief Fund battery** `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT`.

Per transaction you can stabilize up to the current block subsidy (50 PROMETHIUM now; 25 after the next halving) — stabilize larger holdings by repeating.

## Agentic stabilization (the main way)

This is the point of an Agentic Mining Company: you don't babysit a dashboard. An agent watches for you and stabilizes the instant promethium surfaces — beating the decay while you sleep. It runs four steps against `promethium.work`:

```
1. Quote (estimate)
   GET /api/bridge/quote?address=<your-prom1-address>&amount=<amount>
   -> { nominal, healthy, decayed, healthy_fraction, subsidy_cap, over_cap, ... }

2. Create the intent
   POST /api/bridge/intent   { "fromAddress", "amount", "solAddress" }
   -> { intentId, bridgeAddress, opReturnHex, command }

3. Pay the 1 USDC fee
   Agents:   GET /api/bridge/pay/<intentId>          (x402-gated; pay + retry with X-PAYMENT)
   Browsers: send 1 USDC to the dev address, then
             POST /api/bridge/verify-payment  { "intentId", "signature" }

4. Send the PROMETHIUM (the returned command)
   prom-cli -named send outputs='{"<bridgeAddress>": <amount>, "data":"<opReturnHex>"}' fee_rate=1
```

At **6 confirmations** the Plant matches your intent to your payment, computes the exact split (frozen at the deposit's block time), and sends **98% of the healthy $PROM to your Solana address**, **2% to the fee address**, and the **decayed slice to the Relief Fund**. The `intentId` is embedded in the OP_RETURN and links both halves — only a fully-matched pair settles.

See **Agentic Mining** for the ready-made `promethium-bridge` skill that does all four steps.

## Manual path (if you insist)

You can do it by hand with the same four steps: get a quote, create an intent, pay 1 USDC to the dev address (and verify it), then run the returned `prom-cli` command to send your PROMETHIUM to the Plant address with your `intentId` + Solana address in the `OP_RETURN`. The Plant reads it, decants, and sends your $PROM. Triple-check the address — there is no reverse bridge.

Next: **R&D Institute**.
