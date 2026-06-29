---
title: Run a Miner
description: Download the tools, make an address, and start mining in two commands.
---

# Run a Miner

Two small programs, both standalone Python (no accounts, no signup). You mine to
an address you control and keep every block you find.

> Mainnet is launching — grab the tools now; mining connects to the network the
> moment it goes live.

## Download

- **Address generator** — [prom-keygen.py](/downloads/prom-keygen.py)
- **Miner** — [prom-miner.py](/downloads/prom-miner.py)

Put both in the same folder. The miner uses the generator to make your address.
`prom-keygen.py` needs only the Python standard library; `prom-miner.py` needs
`pynacl` if you want the difficulty discount (`pip install pynacl`).

## 1 — Make your address

```bash
python3 prom-keygen.py --out mykey.txt
```

This prints (and saves) a `prom1q…` address and its private key.

> ⚠️ Back up the key file. It is the **only** way to move or bridge the coins
> you mine. Never share it. Promethium will never ask you for it.

(If you skip this, the miner makes one for you automatically on first run.)

## 2 — Mine

```bash
python3 prom-miner.py
```

It connects to Promethium Chain, mines to your address, and reconnects on its
own. A block you find pays you in full — this is solo mining to your own address,
not a pool that holds your coins.

To mine to a specific address: `export MINING_ADDRESS=prom1q...` first.

## Mine easier — claim your discount

Stake $PROM or recruit miners on Solana and you mine at **up to 5× lower
difficulty** (up to 3× from staking at the **R&D Institute**, up to +2× from
referrals at the **Recruitment Office** — they stack). To claim it, point the
miner at your Solana keypair:

```bash
export SOLANA_KEYPAIR=/path/to/solana-keypair.json
python3 prom-miner.py
```

The miner signs each block locally with your Solana key to prove your address —
the key never leaves your machine. Without it you still mine, just at normal 1×.
See **R&D Institute** and **Recruitment Office** for the tiers and how to stake
and refer.

## Settings

| Variable | Meaning |
|---|---|
| `MINING_ADDRESS` | your `prom1q…` payout address (auto-generated if unset) |
| `SOLANA_KEYPAIR` | optional — your Solana key, to claim the discount |
| `STRATUM_URL` | endpoint to mine against (defaults to the official node) |
| `WORKER_NAME` | a label for this rig |

Don't want to run a rig? Use the **Hiring Hall**. Want an agent to run the whole
loop for you? See **Agentic Mining**.
