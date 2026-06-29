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
python3 prom-keygen.py --out prom-mining-key.txt
```

This prints (and saves) a `prom1q…` address and its private key. The miner
automatically picks up `prom-mining-key.txt` from the folder you run it in (or
set `PROM_KEYFILE` to point anywhere), so it reuses this address instead of
making a new one.

> ⚠️ Back up the key file. It is the **only** way to move or bridge the coins
> you mine. Never share it. Promethium will never ask you for it.

(If you skip this, the miner makes one for you automatically on first run.)

## 2 — Mine

```bash
python3 prom-miner.py
```

It connects to Promethium Chain, mines to your address, and reconnects on its
own. A block you find pays you in full — this is solo mining to your own address,
not a pool that holds your coins. **It uses all your CPU cores by default** (set
`PROM_THREADS=N` to limit).

> For serious hashpower: Promethium is standard SHA-256, so you can also point a
> dedicated miner (cpuminer for CPU, or a SHA-256 ASIC) at the stratum endpoint
> with your address as the username. Those run at full native speed but can't
> claim the difficulty discount (no per-block signature) — so they mine at 1×.

## Setting your share difficulty (NiceHash, ASICs, big rigs)

By default the pool uses a low share difficulty that suits CPUs — most miners
don't need to change anything. But high-hashpower miners (NiceHash, ASICs) often
require a higher difficulty (NiceHash, for example, refuses pools below 500,000).
Set it yourself via the **stratum password**: `d=<difficulty>`.

```
URL:      stratum+tcp://stratum.promethium.work:3335
Username: <your prom address>
Password: d=500000          # or higher — match what your miner/NiceHash needs
```

- Leave the password as `x` (or anything without `d=`) → you get the normal
  default difficulty. Existing miners are unaffected.
- Set `d=<num>` → the pool gives you exactly that difficulty.

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
