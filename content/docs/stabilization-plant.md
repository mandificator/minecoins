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

## One-way: the PROMETHIUM is burned

The PROMETHIUM you feed into the Plant is never stockpiled or re-spent. Once your batch is decanted and your $PROM is on Solana, the incoming PROMETHIUM is swept to a **black hole** — a provably-unspendable address (no private key can ever exist for it), so those coins are destroyed forever. That is what makes the bridge truly one-way: chain-side PROMETHIUM leaves circulation as stable $PROM takes its place on Solana. **There is no reverse bridge.**

## Fees

- **2%** of the stabilized amount, taken in **$PROM**.
- **1 USDC** service fee via x402 on Solana.

(See **Fees & x402** — the agent pays exactly these, nothing extra.)

## Agentic stabilization (the main way)

This is the point of an Agentic Mining Company: you don't babysit a dashboard waiting for promethium to surface. An agent watches for you and stabilizes the instant it's ready — beating the decay while you sleep.

The agent calls one endpoint:

```
POST /v1/stabilize
{
  "promethium_txid": "<your surfaced PROMETHIUM tx>",
  "solana_address":  "<where $PROM should land>"
}
-> settles 1 USDC via x402, returns the $PROM transfer + the decayed slice routed to the Relief Fund
```

That's it. State intent to your agent ("stabilize what just surfaced"), and it builds the call, attaches your Solana address, and settles the x402 fee. See **Agentic Mining**.

## Manual path (if you insist)

You can also do it by hand: send a PROMETHIUM transfer to the Plant's address with your Solana address in an `OP_RETURN`. The Plant reads it, decants, and sends your $PROM. Triple-check the address — there is no reverse bridge.

Next: **R&D Institute**.
