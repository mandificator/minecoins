---
name: promethium-bridge
description: Bridge unstable Promethium (PROM) from the Promethium chain to stable $PROM SPL on Solana, before it decays. Use when a user or agent holds mined/surfaced PROM and wants to stabilize it.
---

# Promethium Bridge Skill

Surfaced Promethium has a **17.7-hour half-life** — its healthy value halves every 17.7h until bridged. This skill bridges PROM → **$PROM SPL on Solana**. You send PROM on the Promethium chain (with an OP_RETURN), pay a **1 USDC** fee, and receive the **healthy** portion as $PROM on Solana; the **decayed** portion goes to the Relief Fund battery.

## The $PROM token (Solana, live)
- **Mint:** `promP7gZmjt3fMVWfx47swYBpfwrjb2m3TX4c3woDBu` (classic SPL)
- **Decimals:** 8 · **Supply:** 21,000,000 · **Mint authority: revoked** (fixed cap, no more can ever be minted)
- Metadata + logo hosted on `promethium.work`.

## Key facts
- **Per-transaction cap = the current block subsidy** (50 PROM now; 25 after the next halving). Bridge more by repeating.
- Of the amount you send: the **decayed** part → battery; the **healthy** part is split **98% to you, 2% bridge fee**. So `you (98% healthy) + fee (2% healthy) + battery (decayed) = amount sent`.
- **Decay freezes at confirmation.** The instant your deposit is mined into a block, its healthy/decayed split is **locked to that block's time** — it does not keep decaying while you wait for settlement, even if blocks accelerate afterward.
- Estimate before you send; the **exact** split is computed from the actual coins you spend, pinned to the deposit's block time.

## Addresses
| Role | Address |
|---|---|
| Bridge deposit (PROM chain) | `prom1qhpup76k3d8hr7aydl6cl4s8q4s8z7upr4pdvt7` |
| 1 USDC fee → dev (Solana) | `AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa` |
| 2% healthy fee → bridge fee addr | `EPRPcLNMH65nxfSjWi6bdMkcifeym3DMbt5JTJ23HvHH` |
| Decayed $PROM → Relief battery | `2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT` |

## Prerequisites
- A Promethium node/wallet holding PROM (`prom-cli` available). See the node skill to run one.
- A Solana wallet with ≥1 USDC (for the fee) — this is also where you receive the $PROM SPL (or specify a different destination).

## Flow

### 1. Get a decay quote (estimate)
```
GET https://promethium.work/api/bridge/quote?address=<your-prom1-address>&amount=<amount>
```
Returns `{ nominal, healthy, decayed, healthy_fraction, subsidy_cap, over_cap, projected_healthy_spl, projected_to_battery }`.
- If `over_cap` is true, reduce the amount to ≤ `subsidy_cap`.

### 2. Create a bridge intent
```
POST https://promethium.work/api/bridge/intent
Content-Type: application/json
{ "fromAddress": "<your-prom1-address>", "amount": <amount>, "solAddress": "<your-solana-address>" }
```
Returns `{ "intentId", "bridgeAddress", "opReturnHex", "command", "usdcMemo" }`.
- `command` is the exact `prom-cli` line to run.
- `intentId` links your USDC payment and your PROM deposit to this bridge. It is embedded in the OP_RETURN.

### 3. Pay the 1 USDC fee (two paths)
**Agents — x402:** pay **1 USDC** to the **dev address** through the facilitator
`https://facilitator.x402endpoints.online` (exact-amount Solana USDC scheme). The pay endpoint
`GET https://promethium.work/api/bridge/pay/<intentId>` is x402-gated: unpaid → HTTP 402 with the payment
requirements (amount, payTo=dev, asset=USDC mint); pay and retry with the `X-PAYMENT` header.

**Browsers/wallets — direct verify:** send **1 USDC** to the dev address from your connected wallet, then
```
POST https://promethium.work/api/bridge/verify-payment
{ "intentId": "<intentId>", "signature": "<your-usdc-tx-signature>" }
```
The server confirms on-chain that the dev received ≥1 USDC and marks the intent paid (idempotent; a signature can't be reused).

### 4. Send the PROM (with the OP_RETURN)
Run the returned `command` on your Promethium node — it sends `amount` PROM to `bridgeAddress` with the OP_RETURN encoding your intent id + Solana address:
```
prom-cli -named send outputs='{"<bridgeAddress>": <amount>, "data":"<opReturnHex>"}' fee_rate=1
```

### 5. Settlement
Once the PROM deposit reaches 6 confirmations, the bridge matches your OP_RETURN intent to your USDC payment, computes the **exact** healthy/decayed split from the coins you actually spent (**frozen at the deposit's block time**), and pays: **98% of the healthy $PROM → your Solana address**, **2% of the healthy → the bridge fee address**, **decayed $PROM → the battery**. It logs the result to the public bridge history.

## Order & refunds
- The intent has a unique `intentId`. If you pay the 1 USDC but the PROM deposit with that OP_RETURN never confirms (or vice-versa), nothing settles — the halves are matched by `intentId` and only a fully-matched pair pays out.
- Refunds are **not automatic**. Mismatched/orphaned intents are recorded; contact the team with your `intentId` for a manual refund.

## One-way bridge — the PROM you send is burned
Bridging is one-way. The PROM you deposit is not held or re-spent — once the bridge settles it, that PROM is swept to a **provably-unspendable black-hole address** (burned) so it can never re-circulate. In exchange you receive the stable $PROM SPL on Solana. There is no un-bridge.

## Act before it decays
The longer you wait after surfacing, the more decays to the battery — until your deposit confirms, at which point the split locks. Bridge promptly for the best rate. Next step after holding $PROM: stake it in the Relief Fund battery — see `battery-stake-skill.md`.

## Current status
The bridge is **live** and computing settlements. During launch the outbound **$PROM SPL payout is briefly held** while we verify the first settlements end-to-end — deposits are matched and queued with their exact frozen split, and payouts are released once verification completes. Chain state is anchored to Solana (memo imprints) twice daily; see `promethium.work/imprints`.
