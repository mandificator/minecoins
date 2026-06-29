---
name: promethium-explorer
description: >-
  Query the Promethium ($PROM) chain. Use when the user asks about the Promethium
  blockchain — chain height/difficulty, a specific block, a transaction, or an
  address (its balance and which blocks it mined / "did I mine anything?"). Answers
  come from the public read-only Promethium explorer API.
---

# Promethium Explorer Skill

You answer questions about the Promethium Chain by calling its public read-only
API. All endpoints return JSON. Base URL:

```
https://promethium.work/api/explorer
```

If any response is `{"online": false, ...}`, the chain isn't live yet — tell the
user the explorer goes live when Promethium mainnet launches.

## Endpoints

### Chain summary + latest blocks
`GET /chain`
Returns: `height`, `bestBlockHash`, `difficulty`, `medianTime`, `networkHashps`,
and `latest` (the most recent blocks). Use for "how tall is the chain / what's the
latest block / current difficulty."

### A block (by height or hash)
`GET /block/{heightOrHash}`
Returns: `height`, `hash`, `time`, `txCount`, `size`, `difficulty`,
`previousBlockHash`, `nextBlockHash`, `miner` (the address paid the block reward),
`reward`, and `tx` (transaction ids). Use for "show me block 1234 / who mined this
block / what's in it."

### A transaction
`GET /tx/{txid}`
Returns: `txid`, `blockHash`, `confirmations`, `time`, `coinbase` (bool), `vin`,
`vout` (each with `value`, `address`), `totalOut`. Use for "look up this
transaction / where did these coins go."

### An address (balance + blocks it mined)
`GET /address/{prom1…address}?window=N`
Returns: `balance` (PROM), `utxos`, `minedBlocks` (heights this address mined),
`minedCount`, `scannedWindow`, `note`. Use for **"did I mine anything? / which
blocks did I mine? / what's my balance?"** — pass the user's `prom1…` address.
`window` (optional, default 250, max 2000) is how many recent blocks the
mined-scan covers; widen it if the user mined long ago.

## How to answer common questions
- "Did I mine?" / "which blocks did I mine?" → `GET /address/{addr}` → report
  `minedCount` and `minedBlocks`; mention the scanned window from `note`.
- "What's my PROM balance?" → `GET /address/{addr}` → `balance`.
- "How tall is the chain / latest block / difficulty?" → `GET /chain`.
- "Details of block N / who mined it?" → `GET /block/N` → `miner`, `reward`, `tx`.
- "Look up transaction X" → `GET /tx/X` → `vout` addresses + `totalOut`.

## Notes
- Read-only: this never moves funds or needs any key. Safe to call freely.
- Amounts are in PROM (8 decimals). Addresses look like `prom1…`.
- If the user gives you only part of the info (e.g. just an address), the address
  endpoint covers both "did I mine" and "balance" in one call.
