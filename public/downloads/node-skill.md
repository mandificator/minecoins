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
git clone https://github.com/Hefaistos2026/Prom-node.git promethium && cd promethium
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
fallbackfee=0.0001            # young chain has no fee-estimation data yet; needed to SEND
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

## Importing an existing address (e.g. your miner address)

If you mined to an address you generated elsewhere (e.g. with `prom-keygen`) and
want this node's wallet to see and spend those coins, import its key **with a
rescan** — otherwise the node only scans from the import moment forward and the
balance looks empty even though the coins are on-chain.

```bash
# 1. checksum for the descriptor
prom-cli getdescriptorinfo "wpkh(<WIF>)"
# 2. (optional) confirm it derives the address you expect
prom-cli deriveaddresses "wpkh(<WIF>)#<checksum>"
# 3. import WITH timestamp 0 so it scans the whole chain from genesis
prom-cli -rpcwallet=main importdescriptors \
  '[{"desc":"wpkh(<WIF>)#<checksum>","timestamp":0,"label":"mine"}]'
```

`"timestamp":0` is the important part. If you already imported without it and the
balance looks wrong / shows few UTXOs, just force a rescan:

```bash
prom-cli rescanblockchain 0
```

Make sure the node is fully synced first (`getblockcount` = the network tip) — the
rescan only finds what your node already has.

## Troubleshooting

- `getpeerinfo` empty → check outbound P2P to `seed.promethium.work:8144` isn't firewalled.
- discount not applying → confirm `curl` and `jq` are installed and the host can reach `https://oracle.promethium.work`.
- RPC refused → `promd` still starting (the block index loads first); retry in a minute.
- Exposing RPC beyond localhost → change `rpcpassword` first.
