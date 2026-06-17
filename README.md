# Promethium — minecoins.work

The official site for **Promethium** — a Bitcoin-style Proof-of-Work coin (SHA-256) on its
own chain (**Promethium Chain**), mirrored 1:1 as the **$PROM token** on Solana. Staking the
token on Solana lowers your real mining difficulty (up to 3×) via an oracle. The
bridge is one-way (coin → token); bridge and staking actions are paid per-call with
**x402** (1 USDC each).

Electric-blue / dot-matrix print theme. Next.js 14 (App Router) + TypeScript + Tailwind.

## Sections

| Route | What it is |
| --- | --- |
| `/` | Homepage / About — landing explaining the project |
| `/explorer` | Block explorer — embeds / links `NEXT_PUBLIC_EXPLORER_URL` (we don't build it) |
| `/docs` | Documentation, rendered from Markdown in `content/docs/` |
| `/staking` | Staking UI (Solana wallet) |
| `/bridge` | One-way bridge UI (coin → token) |
| `/rent-a-miner` | Under Construction |
| `/admin` | Minimal CRM for editing the docs |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Build / run production:

```bash
npm run build
npm start
```

## Environment variables

See `.env.example`. All on-chain addresses / program IDs come from env — nothing is
hardcoded.

| Var | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Single admin password for the CRM |
| `SESSION_SECRET` | Long random string used to sign the session cookie |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC endpoint |
| `NEXT_PUBLIC_PROM_TOKEN_MINT` | $PROM token mint (balances shown once set) |
| `NEXT_PUBLIC_STAKING_PROGRAM_ID` | Staking program (staking enabled once set) |
| `NEXT_PUBLIC_BRIDGE_ADDRESS` | Promethium Chain bridge address (coin destination) |
| `NEXT_PUBLIC_FEE_ADDRESS` | Solana fee address |
| `NEXT_PUBLIC_EXPLORER_URL` | External block explorer URL |

### On-chain status

The oracle, staking program, and bridge **do not exist yet**. The UI is built fully,
reading program IDs / addresses from env through an abstraction layer in
`src/lib/solana/`. When the relevant env var is missing, on-chain actions are
`disabled` with a **"Coming at mainnet"** badge — there are no fake transactions.
Wiring up the real deployment is a single-place change in:

- `src/lib/solana/config.ts` — addresses / program IDs from env
- `src/lib/solana/staking.ts` — stake / unstake / balance / **difficulty curve**
  (the discount curve is a clearly-marked placeholder: `// TODO: replace with the
  published curve`)
- `src/lib/solana/bridge.ts` — bridge quote + OP_RETURN payload

## Docs content (GitBook, self-hosted)

We do **not** use the GitBook platform. Docs are plain Markdown files in
`content/docs/`, ordered by `content/docs/_meta.json`. Each file has frontmatter:

```yaml
---
title: Promethium on Promethium Chain
description: A real Proof-of-Work coin on its own blockchain.
---
```

Rendering: `gray-matter` (frontmatter) + `react-markdown` + `remark-gfm` +
`rehype-slug` + `rehype-autolink-headings`. ASCII diagrams are kept as fenced code
blocks so they render in monospace.

## CRM (`/admin`)

Minimal content editor for the docs — **no users, no database**.

- **Auth:** one password (`ADMIN_PASSWORD`). `/admin/login` posts to `/api/auth`,
  which sets an httpOnly cookie signed with `SESSION_SECRET`. `src/middleware.ts`
  guards all `/admin/*` pages and mutating `/api/docs/*` calls.
- **List** (`/admin`): every page with reorder (↑/↓), edit, delete, and "+ New page".
- **Editor** (`/admin/edit/[slug]`): `title` / `description` fields, a full-height
  Markdown textarea, and a live split preview (same renderer as the site).
  `Ctrl/Cmd+S` saves.
- The API (`/api/docs`, `/api/docs/[slug]`) reads and writes the real `.md` files and
  keeps `_meta.json` in sync.

### ⚠ Vercel / read-only filesystem

The CRM writes to the repository filesystem. On Vercel (and similar serverless
hosts) the runtime filesystem is **read-only**, so live edits there will fail. The
CRM is intended for **local development or a VPS**; on Vercel, edit docs locally and
push via git. To enable live editing on Vercel later, move the storage layer in
`src/lib/docs.ts` to the GitHub API or a database (single, well-contained change).

The "notify me" email box on `/rent-a-miner` writes to `data/notify.json` and is
subject to the same read-only limitation — it returns 503 on read-only hosts rather
than pretending to save.

## Project structure

```
content/docs/          # docs source of truth (Markdown + _meta.json)
public/ascii/          # reusable ASCII art
src/app/               # routes (pages + API)
src/components/         # ui / layout / effects / docs / web3
src/lib/               # docs.ts, auth.ts, solana/*
src/middleware.ts      # admin/API auth guard
```

## Theme

Three-colour palette only: an **electric-blue** background, **white** body text,
and **light-blue** titles / accents / hairlines. One uniform font size everywhere
(sized in `vw`, relative to screen width) for an airy, dot-matrix-printout feel.
JetBrains Mono throughout, sharp corners, a faint dot grid, and auto-fitting ASCII
diagrams (1-cell glyphs, no horizontal scroll). The menu lives in a left sidebar
with an expandable DOCS submenu. Respects `prefers-reduced-motion`. Palette is set in
one place — the CSS variables in `src/app/globals.css` and the tokens in
`tailwind.config.ts`.

---

*Build for minecoins.work — fair launch, no pre-mine. Verify all addresses before mainnet.*
