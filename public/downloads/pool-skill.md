---
name: promethium-pool
description: Join the Promethium ($PROM) shared mining pool — point a CPU/GPU miner at the pool with your own prom address as the username, and earn a share of the pool's blocks proportional to the work you contribute. Use when a user wants to pool-mine PROM instead of solo.
---

# Mine in the Promethium pool

The shared pool lets small miners combine hashpower and earn a steady,
proportional cut of every block the pool finds — instead of mining solo and
rarely winning anything. You mine to the pool, and your rewards are sent to
**your own address**.

- **Payout model:** PPLNS — rewards are split across miners by the valid shares
  each contributed.
- **Fee:** 0%.
- **Your username = your payout address.** Whatever prom address you connect
  with is where your share is paid.

## 1. Get the miner

```bash
curl -O https://promethium.work/downloads/prom-miner.py
pip install pynacl   # optional, only if you later use a discount key
```

(Or use any standard SHA-256 stratum miner — cpuminer, etc.)

## 2. Make an address (if you don't have one)

```bash
curl -O https://promethium.work/downloads/prom-keygen.py
python3 prom-keygen.py            # prints a prom1… address + saves the key — BACK IT UP
```

## 3. Mine to the pool

Point the miner at the pool, with your prom1 address as the username:

```bash
STRATUM_URL=stratum.promethium.work:3337 \
MINING_ADDRESS=prom1qyour_address_here \
python3 prom-miner.py
```

With a standard stratum miner:

```bash
cpuminer -a sha256d -o stratum+tcp://stratum.promethium.work:3337 \
  -u prom1qyour_address_here -p x
```

- **URL:** `stratum+tcp://stratum.promethium.work:3337`
- **Username:** your `prom1…` payout address
- **Password:** anything (e.g. `x`)

The pool auto-tunes your share difficulty — nothing to set. Your accepted shares
are tallied; when the pool finds a block, your proportional share accrues to your
address.

## Notes

- Mining solo instead? Use `stratum.promethium.work:3335` with your address as the
  username and you keep any block you find yourself (higher variance).
- Roadmap: the pool will run with the maximum staking difficulty discount, which
  makes the pool find blocks far more often — boosting every pooled miner's share.
