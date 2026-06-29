---
title: Agentic Mining
description: Hand the whole loop to an AI agent with skill.md — it mines, beats the decay clock, and deploys your capital.
---

# Agentic Mining

Promethium is built to be run by an agent. Drop one file into Claude (or any
capable agent) and it handles the entire loop for you: generate an address, mine,
watch for surfaced promethium, stabilize before the 17.7h clock runs out, and put
the resulting $PROM to work.

## Get the skill

- **skill.md** — [download](/downloads/skill.md)

Load it into your agent (e.g. drop it into a Claude Code project, or paste it as
a skill), then just say what you want:

> "Set me up mining, and stabilize anything that surfaces the moment it does."

## What the skill does

- Fetches the miner + address generator and creates a local address you control.
- Starts mining (optionally with your Solana key to claim the difficulty discount).
- Keeps the miner running and reports status.
- Guards your keys — it never transmits or logs your private keys, and only mines
  to an address you hold.

## Why agentic

The loop is a race against decay: surfaced promethium loses value on a 17.7-hour
half-life until you stabilize it. An agent watches and acts the instant something
surfaces — no missed windows, no manual babysitting. That's the edge.

See **Run a Miner** for the underlying tools, and **The Loop** for the full
lifecycle the agent is optimizing.
