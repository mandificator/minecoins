---
name: promethium-mining
description: >-
  Mine Promethium (PROM) autonomously. Use when the user wants an agent to set up
  and run a Promethium CPU miner: fetch the tools, generate a Promethium address,
  optionally claim the staking/referral difficulty discount with a Solana key, and
  keep mining. Promethium is a SHA-256 PoW chain; miners mine to their own address
  and keep 100% of blocks found.
---

# Promethium Mining Skill

You help the user mine Promethium. Mining is permissionless: connect to the
network, mine to an address the user controls, keep every block found. A Solana
key is optional and only unlocks a difficulty discount.

## Tools
Two single-file Python programs (Python 3 standard library; the discount path also
needs `pynacl`). Download them into one folder:
- Address generator: https://promethium.work/downloads/prom-keygen.py
- Miner: https://promethium.work/downloads/prom-miner.py

```bash
mkdir -p ~/promethium && cd ~/promethium
curl -fsSLO https://promethium.work/downloads/prom-keygen.py
curl -fsSLO https://promethium.work/downloads/prom-miner.py
```

## Steps

### 1. Get or create the payout address
The user keeps 100% of mined coins at this address, so they must control its key.
- If the user already has a `prom1q…` address, set `MINING_ADDRESS` to it.
- Otherwise generate one: `python3 prom-keygen.py --out ~/promethium/key.txt`
  (saves the address + private key, chmod 600).

**Always tell the user: back up that key file — it is the ONLY way to move/bridge
their mined coins; never share it; Promethium never asks for it. Never transmit
or log the private key.**

(If skipped, `prom-miner.py` auto-generates + saves an address on first run.)

### 2. (Optional) Difficulty discount
If the user has staked $PROM or referred miners on Solana, they mine up to 5×
easier. Provide their Solana keypair:
```bash
export SOLANA_KEYPAIR=/path/to/solana-keypair.json   # solana-keygen JSON or 64-byte hex
```
The miner signs each block locally with it — the key never leaves the machine.
Ensure `pynacl` is installed (`pip install pynacl`). Without a Solana key, mining
runs at normal 1×. To raise the discount, the user stakes $PROM (≤3×) / refers
miners (≤+2×) on Solana — see the R&D Institute and Recruitment Office docs.

### 3. Start mining
```bash
python3 prom-miner.py
```
Connects to the network, mines to the user's address, auto-reconnects.

### 4. Keep it running and report
Run it under a process manager (`nohup`, `tmux`, `pm2`, systemd) for unattended
operation. Periodically report: the payout address, whether the discount is active
(Solana key present), and that the miner is connected.

## Guardrails
- NEVER print, log, transmit, or commit private keys (Promethium WIF or the Solana
  keypair). They stay local.
- Only mine to an address whose key the user controls — otherwise they lose the coins.
- Don't claim a discount is active unless `SOLANA_KEYPAIR` is set AND the user has
  actually staked/referred; otherwise it's plain 1× mining.
