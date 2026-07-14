---
title: Chain Imprints
description: The Promethium chain anchored to Solana every 17.7 hours — publicly verifiable, reorg-resistant.
---

# Chain Imprints

Every 17.7 hours, Promethium anchors its own chain state onto Solana. A memo transaction from the Promethium **dev address** stamps the current **block height** and **block hash** permanently onto the Solana ledger.

The cadence is deliberate: **17.7 hours is the $PROM decay half-life** — the same clock that halves an unstabilized balance also seals the chain onto Solana. Every imprint marks one half-life of history made permanent.

## Why it matters

The block hash cryptographically commits to the entire chain history up to that point. Once it's written to Solana, that checkpoint is immutable and public. That gives:

- **Tamper-proof timestamps** — proof that Promethium block #H existed with hash X at a given moment.
- **Reorg / double-spend resistance** — a deep reorg that rewrote history past an imprint would produce a different hash at that height, visibly contradicting the Solana anchor. Anyone can catch it.
- **Independent verifiability** — no need to trust us. Cross-check the imprinted hash against the block on the explorer, and the values against the Solana transaction's memo.

## Verify it yourself

See the live imprints at **[promethium.work/imprints](/imprints)** — each row links to its Solana transaction. Look up the block at that height on the [explorer](/explorer) and confirm the hash matches.

Imprints run every 17.7 hours and move **no funds** — they are memo-only, paying just the Solana network fee.
