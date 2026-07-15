---
title: Relief Fund
description: Deposit $PROM, the Syndicate puts it to work, you earn interest in $PROM.
---

# Relief Fund

The Syndicate's mutual fund. Deposit **$PROM** into the Relief Fund and you earn **interest, paid in $PROM** — stable, on Solana, no decay.

## Where the interest comes from

The Relief Fund is where decayed promethium ends up. Every miner who stabilizes late loses a slice to decay, and that slice settles into the Fund (via the Stabilization Plant). The Fund pays it back out to depositors as interest. **Your yield is powered by everyone else's delay.**

```
   late stabilizations -> decayed slices -> [ RELIEF FUND ] -> interest in $PROM
                                                              to depositors
```

## How it works

1. Deposit **$PROM** into the Relief Fund on Solana. You start earning the moment your deposit is indexed (within minutes) — no waiting period.
2. Each day the Fund releases **2% of its current balance** to depositors.
3. Your share is **time-weighted by both how much you deposit and how long you hold it**: `your_share = your(PROM × time) ÷ everyone's(PROM × time)`. Doubling your deposit *or* holding twice as long both double your weight. The time counted between payouts is **capped at 24 hours**, so nobody's clock runs away — everyone competes on a level, one-day window.
4. Interest accrues + is paid in **$PROM** — stable, no decay, yours to keep.

## Getting your yield

Two ways, and they never double-pay each other:

- **Automatic** — every day the Fund auto-sends your accrued yield to your wallet. You do nothing.
- **Claim any time** — hit **Claim** (in the app, or via x402 for agents) to pull your accrued yield on demand. There is **no lock on yield**.

Either way, being paid resets your time-weight — so if you claim, your next daily auto-payment is just the amount that accrued *since* the claim. You're never paid twice for the same time.

## Adding to your stake

Deposit again any time — your balances **sum** into one position. Your earlier $PROM keeps its earned time; the new $PROM starts earning from when you add it (nothing is retroactive).

Your **30-day principal lock** uses a **stake-weighted average**: a later or bigger top-up pushes your unlock date out proportionally. (Stake 100, then add 400 → your unlock moves to ~24 days out, because 4/5 of your position is fresh.) This keeps the lock fair — you can't stake a token early and dump a large amount in late to dodge the lock.

## Good to know

- Payouts are in **$PROM** on Solana. Nothing surfaces, nothing re-decays.
- **2% of the remaining balance daily** — the Fund never empties (it asymptotes) and refills as new decay flows in.
- The app shows your **live position**: free $PROM balance, staked amount, accrued yield ticking up, your yield rate, and countdowns to both your unstake unlock and the next daily auto-payment.
- Your **principal** is locked for a **30-day minimum**; your **yield is never locked** (claim it any time).
- Yield scales with the Fund's intake — busier network, more late stabilizations, more interest.
- This is a separate pool from the **R&D Institute**. You can be in both: earn interest *and* mine easier.
- **Deposit, withdraw, and claim** each cost **1 USDC** on Solana (paid to the Relief Fund itself, not us — it grows the Fund). Agents pay the same via x402, no extra. See **Fees & x402**.

Next: **Recruitment Office**.
