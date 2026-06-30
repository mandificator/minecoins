---
title: Run a Node
description: Build and run your own Promethium full node — validate the chain yourself, send and receive PROM, and optionally mine.
---

# Run a Node

Running your own Promethium full node (`promd`) lets you **independently validate
the chain** and **send/receive PROM** without trusting anyone else. Promethium is
SHA-256 proof-of-work and Bitcoin-derived, so the node is full Bitcoin Core with
one addition: an optional staking difficulty discount.

The node software is open source:

> **Source:** [github.com/Hefaistos2026/Prom-node](https://github.com/Hefaistos2026/Prom-node)
> **Agent skill:** [download node-skill.md](/downloads/node-skill.md) — point your AI agent at this to install + run a node end-to-end.

## Build

You need a C++ toolchain, CMake, Boost, libevent, sqlite, plus `curl` and `jq` at
runtime.

```bash
git clone https://github.com/Hefaistos2026/Prom-node.git promethium && cd promethium
cmake -B build -DBUILD_GUI=OFF -DENABLE_IPC=OFF
cmake --build build -j"$(nproc)" --target bitcoind bitcoin-cli
# binaries: build/bin/promd  build/bin/prom-cli
```

`-DENABLE_IPC=OFF` avoids needing Cap'n Proto. The CMake targets are
`bitcoind`/`bitcoin-cli`; the output binaries are `promd`/`prom-cli`.

## Configure

The config file must be named `bitcoin.conf` in your data directory (both binaries
auto-load it):

```bash
mkdir -p ~/.prom
cat > ~/.prom/bitcoin.conf <<'EOF'
server=1
txindex=1
rpcuser=prom
rpcpassword=prom8004          # change this if you expose the RPC port
rpcbind=127.0.0.1
rpcallowip=127.0.0.1
rpcport=18105
addnode=seed.promethium.work:8144
fallbackfee=0.0001            # young chain has no fee-estimation data yet; needed to SEND
EOF
```

Mainnet ports: **P2P 8144**, **RPC 18105**. The DNS seed `seed.promethium.work`
bootstraps peers.

## Run & verify

```bash
./build/bin/promd -datadir="$HOME/.prom" -daemon
./build/bin/prom-cli -datadir="$HOME/.prom" getblockchaininfo   # chain=main
./build/bin/prom-cli -datadir="$HOME/.prom" getblockcount       # climbs to the network tip
```

## Send & receive PROM

```bash
prom-cli -datadir="$HOME/.prom" createwallet "main"
prom-cli -datadir="$HOME/.prom" getnewaddress           # your prom1... address
prom-cli -datadir="$HOME/.prom" sendtoaddress <prom1...> <amount>
```

## Staking discount (automatic)

If your mining address has staked $PROM on Solana, the node automatically mines at
a discounted difficulty — nothing to configure. The entitlement is verified by
every node in consensus, so you can't fake it: a block claiming a discount it isn't
entitled to is rejected by the network.

## Install via an AI agent

Hand your agent the skill file and it will do all of the above for you:

> [/downloads/node-skill.md](/downloads/node-skill.md)
