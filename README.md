# AI4S Daily Newsletter

AI4S Daily Newsletter is a curated daily brief for frontier models, AI4S, atomistic simulation, hardware systems, and globally important developments. It combines a bilingual web interface, a card-based HTML email, and scheduled delivery through GitHub Actions.

## What It Covers

- Frontier model launches and official product updates
- AI4S, scientific machine learning, and agent workflows
- LAMs, PFD, DFT, LAMMPS, ABACUS, and atomistic computing
- Hardware acceleration, memory systems, FPGA/ASIC, and systems shifts
- Magnetic materials and related materials science signals
- A global watchlist across finance, technology, politics, defense, and macro risk

## Editorial Principles

- Recent first: the default window is the last seven days, with stronger preference for the last 24 to 72 hours
- High-signal selection: the pipeline favors official announcements, strong papers, major releases, benchmarks, performance/scaling milestones, and material method changes
- Low-noise filtering: routine commits, minor version churn, generic marketing posts, and stale items are filtered out
- Topic framing: each topic includes `importance`, `confidence`, `why-it-matters`, and `next-step` analysis before the link list

## Product Surfaces

### Web UI

The web UI is designed as a readable publication page rather than an internal dashboard:

- bilingual Chinese / English switch
- topic cards with analysis blocks and link cards
- curated overview panels for coverage, editorial policy, and delivery
- clipboard actions for text email and HTML email

### Email

The generated email includes:

- a styled hero section
- topic-by-topic cards
- HTML link cards instead of plain link dumps
- plain-text fallback for clients that do not render HTML

### Automation

GitHub Actions is the production delivery path. It runs the digest daily and sends it through Gmail SMTP to the configured recipient.

## Sources

Current coverage mixes official feeds, high-quality media, arXiv, and a small set of specialized atomistic sources.

Examples include:

- OpenAI, Anthropic, Google AI, Google Developers / Gemma, Google DeepMind
- Mistral, Meta Llama, xAI, Hugging Face official release streams
- NVIDIA, The Verge, TechCrunch, VentureBeat, CNBC, NPR, POLITICO, WSJ, MarketWatch, Sky News, UN News, Defense News, Defense One
- DeepModeling ABACUS news, official LAMMPS releases, Materials Project database versions, OQMD releases, Psi-k announcements
- arXiv for paper discovery

## Local Development

### Requirements

- Node.js 20+

### Install

```bash
npm install
```

### Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Generate the email payload

```bash
npm run digest:email
```

This prints JSON with:

- `subject`
- `plainText`
- `html`

### Send a real email locally

```bash
GMAIL_SMTP_USER="your@gmail.com" \
GMAIL_SMTP_PASS="your-app-password" \
DIGEST_TO_EMAIL="recipient@example.com" \
npm run digest:send
```

### Dry run email send

```bash
GMAIL_SMTP_USER="your@gmail.com" \
GMAIL_SMTP_PASS="your-app-password" \
DIGEST_TO_EMAIL="recipient@example.com" \
DIGEST_DRY_RUN=1 \
npm run digest:send
```

## Environment Variables

Required for real email sending:

- `GMAIL_SMTP_USER`
- `GMAIL_SMTP_PASS`
- `DIGEST_TO_EMAIL`

Optional:

- `GMAIL_SMTP_HOST` defaults to `smtp.gmail.com`
- `GMAIL_SMTP_PORT` defaults to `465`
- `DIGEST_FROM_EMAIL` defaults to `GMAIL_SMTP_USER`
- `DIGEST_LOCALE` set to `zh` or `en`

## GitHub Actions

The production workflow lives at `.github/workflows/daily-digest.yml`.

It supports:

- scheduled runs
- manual runs with `workflow_dispatch`

### Schedule

The workflow uses:

```text
0 0 * * *
```

GitHub Actions cron is UTC, so this maps to:

- `UTC 00:00`
- `Asia/Shanghai 08:00`

### Required GitHub Secrets

- `GMAIL_SMTP_USER`
- `GMAIL_SMTP_PASS`

Recommended:

- `GMAIL_SMTP_HOST=smtp.gmail.com`
- `GMAIL_SMTP_PORT=465`
- `DIGEST_FROM_EMAIL`

The target recipient can be set in workflow environment or repository configuration. The current production workflow is configured for `yusheraine@gmail.com`.

## Gmail App Password

`GMAIL_SMTP_PASS` must be a Gmail App Password, not the normal account password.

Steps:

1. Enable 2-Step Verification on the Google account
2. Open [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for Mail
4. Store the generated 16-character password in the GitHub Actions secret `GMAIL_SMTP_PASS`

## Project Structure

```text
public/
  index.html          Web UI shell
  app.js              Client-side rendering and locale switching
  styles.css          Visual design

scripts/
  generate-email.mjs  Build subject / text / html payload
  send-email.mjs      Send the email over Gmail SMTP

src/
  config/topics.js    Topics, source metadata, editorial hints
  lib/digest.js       Fetching, filtering, ranking, rendering

server.js             Express server and API routes
```

## API

- `GET /api/digest`
  Returns the structured digest for the web UI.

- `GET /api/digest?refresh=1`
  Forces a fresh rebuild instead of using cache.

- `GET /api/digest/email`
  Returns the generated email payload.

- `GET /api/digest/email?locale=en`
  Returns the English email payload.

## Positioning

This project is intentionally opinionated:

- it is not a generic RSS reader
- it is not a commit firehose
- it is not a long-form knowledge base

It is a compact, high-signal publication layer for daily monitoring and fast decision support.
