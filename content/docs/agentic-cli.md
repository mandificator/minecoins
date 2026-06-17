---
title: Agentic Mining
description: Drive the whole loop from the command line through Claude, via one skill.md.
---

# Agentic Mining

**This is the headline feature.** You don't click through dashboards — you tell an agent (like **Claude**) what you want, and it runs the protocol for you, loaded from a single `skill.md`.

Promethium decays in real time. An agent that can bridge for you the moment your coins surface is genuinely useful — it races the clock while you're away.

## What the skill.md teaches the agent

- the CLI commands and what they do
- how to build a bridge transfer with the right `OP_RETURN`
- how to settle the 1 USDC x402 fee per action
- how to read your status: hashrate, surfaced promethium, decay timer, stakes, yield

## Example commands

> Names/flags are illustrative — final ones ship with the node release on **minecoins.work**.

```bash
prom status                          # what's mined, surfaced, decaying
prom bridge --amount 0.5 --to <SOL>  # save promethium -> $PROM (one-way)
prom stake difficulty --amount 500   # easier mining (up to 3×)
prom stake battery --amount 500      # earn yield from the Battery
prom discount                        # your current difficulty multiplier
prom unstake difficulty --amount 200
```

Each `bridge` / `stake` / `unstake` settles **1 USDC via x402**. Bridging also takes **2%** in $PROM.

## One instruction, whole loop

```
   "mine status, bridge what surfaced, split the rest into both pools"
                          │
                          v
         AGENT (Claude + skill.md) runs it all, races the decay, reports back
```

State intent. The agent does the laps.

Next: **Architecture**.
