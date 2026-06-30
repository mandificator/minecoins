---
title: Mining Pool
description: Pool-mine Promethium — combine hashpower with other miners and earn a steady, proportional share of every block the pool finds, paid to your own address.
---

# Mining Pool

Solo mining is a lottery — a small miner can hash for days and win nothing. The
**Promethium pool** lets miners combine hashpower and share every block the pool
finds, proportional to the work each one contributed. Steady trickle instead of
all-or-nothing.

## Connect

| Setting | Value |
|---|---|
| URL | `stratum+tcp://stratum.promethium.work:3337` |
| Username | your own `prom1…` payout address |
| Password | anything (e.g. `x`) |

Your username **is** your payout address — that's where your share is sent. The
pool auto-tunes each miner's share difficulty; there's nothing else to configure.

```bash
cpuminer -a sha256d -o stratum+tcp://stratum.promethium.work:3337 \
  -u prom1qyour_address_here -p x
```

Prefer an agent to set it up? Hand it the skill: [pool-skill.md](/downloads/pool-skill.md).
Need an address? [prom-keygen.py](/downloads/prom-keygen.py).

## How rewards work

- **PPLNS** — when the pool finds a block, the reward is split across miners by
  the valid shares each contributed. More work = bigger slice.
- **0% fee** — the full block reward goes to the miners.
- Paid to your address. (Payout cadence is being finalized — shares are recorded
  from the moment you connect, so nothing is lost while it's set up.)

## Solo vs pool

- **Pool** (`:3337`): steady, proportional income; ideal for CPUs and smaller rigs.
- **Solo** ([`:3335`](/docs/run-a-miner)): you keep any block you find yourself,
  but it's high-variance.

## Roadmap

The pool will run with the **maximum staking difficulty discount**, so it finds
blocks far more often than its raw hashrate suggests — which directly increases
every pooled miner's earnings.
