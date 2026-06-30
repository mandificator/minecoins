---
name: promethium-node
description: Install, build, and run a Promethium ($PROM) full node — validate the chain, send/receive PROM, and (optionally) earn the staking difficulty discount. Use when a user wants to run their own Promethium node.
---

# Promethium Node — install & run

Promethium is a SHA-256 proof-of-work blockchain. Running `promd` (the node) lets you
**independently validate the chain and send/receive PROM**. The node automatically
syncs the staking-discount table from the canonical oracle — there is **no separate
oracle service to run**.

## 0. Prerequisites (Debian/Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake pkg-config python3 git \
    libevent-dev libboost-dev libsqlite3-dev curl jq
```

`curl` and `jq` are **required at runtime** — the node uses them to fetch the
staking-discount multiplier table. Without them the node still runs but treats
everyone at base (no discount).

## 1. Get the source & build

```bash
git clone <REPO_URL> promethium && cd promethium
# -DENABLE_IPC=OFF avoids needing Cap'n Proto (multiprocess support, not required to run a node)
cmake -B build -DBUILD_GUI=OFF -DENABLE_IPC=OFF
cmake --build build -j"$(nproc)" --target bitcoind bitcoin-cli
# produces: build/bin/promd  (daemon)   build/bin/prom-cli  (CLI)
# (the CMake targets are named bitcoind / bitcoin-cli; the output binaries are promd / prom-cli)
```

If `cmake -B build` complains that Cap'n Proto is required, the `-DENABLE_IPC=OFF`
flag above resolves it (or install capnproto). On low-RAM machines build with
`-j2` instead of `-j"$(nproc)"`.

## 2. Configure

The config file MUST be named `bitcoin.conf` and live in the datadir — that's the
default filename `promd` and `prom-cli` both auto-load (so you don't pass `-conf`).

```bash
mkdir -p ~/.prom
cat > ~/.prom/bitcoin.conf <<'EOF'
server=1
txindex=1
rpcuser=prom
rpcpassword=prom8004          # CHANGE THIS if the RPC port is ever exposed
rpcbind=127.0.0.1             # keep RPC on localhost
rpcallowip=127.0.0.1
rpcport=18105
addnode=seed.promethium.work:8144
EOF
```

Mainnet ports: **P2P 8144**, **RPC 18105**. The DNS seed `seed.promethium.work`
bootstraps peer discovery.

## 3. Run & verify

```bash
./build/bin/promd -datadir="$HOME/.prom" -daemon
sleep 10
./build/bin/prom-cli -datadir="$HOME/.prom" getblockchaininfo   # chain=main
./build/bin/prom-cli -datadir="$HOME/.prom" getblockcount       # should climb to the network tip
./build/bin/prom-cli -datadir="$HOME/.prom" getpeerinfo         # should include the seed
```

## 4. Send / receive PROM

```bash
prom-cli -datadir="$HOME/.prom" createwallet "main"
prom-cli -datadir="$HOME/.prom" getnewaddress                   # your prom1... address
prom-cli -datadir="$HOME/.prom" getbalance
prom-cli -datadir="$HOME/.prom" sendtoaddress <prom1...> <amount>
```

## 5. Staking discount (automatic, optional)

If your mining address has staked $PROM on Solana, the node **automatically** mines
at a discounted difficulty — nothing to configure. The node fetches the entitled
multiplier from the canonical oracle and the whole network enforces it in consensus.

**You cannot fake it:** the discount is verified by every node against the canonical
oracle data. If you alter your local oracle data to grant yourself a larger discount,
your blocks are rejected by every honest node and you fork onto a dead chain. So leave
the oracle alone — honest nodes always agree, cheaters self-eject.

## Troubleshooting

- `getpeerinfo` empty → check outbound P2P to `seed.promethium.work:8144` isn't firewalled.
- discount not applying → confirm `curl` and `jq` are installed and the host can reach `https://oracle.promethium.work`.
- RPC refused → `promd` still starting (the block index loads first); retry in a minute.
- Exposing RPC beyond localhost → change `rpcpassword` first.
