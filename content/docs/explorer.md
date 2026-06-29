---
title: Explorer
description: Browse the Promethium Chain yourself, or let your agent query it — chain stats, blocks, transactions, and addresses.
---

# Explorer

The Promethium Explorer lets anyone verify the chain — every block, transaction,
and address — with no account and no keys. It's read-only.

- **Browse it:** [promethium.work/explorer](/explorer) — search a block height,
  block hash, transaction id, or a `prom…` address, and watch the latest blocks.
- **Ask your agent:** [download explorer-skill.md](/downloads/explorer-skill.md),
  drop it into Claude (or any agent), and just ask — *"did I mine anything? which
  blocks? what's my balance? how tall is the chain?"*

## The API (read-only)

Both the page and the skill use the same public endpoints under
`https://promethium.work/api/explorer`:

| Endpoint | Returns |
|---|---|
| `GET /chain` | chain height, difficulty, hashrate, latest blocks |
| `GET /block/{height\|hash}` | a block: time, miner, reward, transactions |
| `GET /tx/{txid}` | a transaction: inputs, outputs, amounts |
| `GET /address/{prom…}` | balance, unspent outputs, and which blocks it mined |

All responses are JSON, all amounts are in PROM. Nothing here can move funds or
needs a private key — query it as much as you like.

## "Did I mine?"

Give the address endpoint your `prom…` address: it reports your **balance** and
the **blocks you mined**. The mined-block check scans recent blocks by default —
add `?window=2000` to look further back.

> The explorer goes live with Promethium mainnet. Until then the tools and API are
> in place and return a "launching" status.
