# AI4S Daily Newsletter

AI4S Daily Newsletter is a lightweight web digest for frontier models, AI4S, atomistic simulation, hardware acceleration, agents, and materials research. The same codebase supports:

- local development with Express
- static web delivery through the `public/` site
- serverless API deployment on Vercel
- digest email generation from the command line

## Coverage

- Frontier foundation models
- AI4S and scientific machine learning
- LAMs, PFD, DFT, LAMMPS, and ABACUS
- Agents and tool use
- FPGA, ASIC, GNN, and memory acceleration
- Magnetic materials and related research

## Local Development

### Requirements

- Node.js `22.x`

### Install

```bash
npm install
```

### Start the web app

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Generate the email payload

```bash
npm run digest:email
```

This prints a JSON object with:

- `subject`
- `plainText`
- `html`

## API

Local Express and Vercel expose the same API surface:

- `GET /api/digest`
- `GET /api/digest?refresh=1`
- `GET /api/digest/email`
- `GET /healthz`

## Deploy on Vercel

This repository is structured for Vercel deployment:

- `public/` is served as the website
- `api/digest/index.js` serves `/api/digest`
- `api/digest/email.js` serves `/api/digest/email`
- `api/healthz.js` serves `/healthz` through a rewrite in [vercel.json](vercel.json)

### Vercel Steps

1. Push the repository to GitHub.
2. Sign in to Vercel and import the repository.
3. Keep the default root directory as the repository root.
4. Deploy with the existing project settings.

The repo already includes:

- [vercel.json](vercel.json)
- a pinned Node runtime in [package.json](package.json)
- local and hosted-compatible handlers for the digest APIs

### Recommended Environment Variables

These are optional for the current template-based digest:

- `TZ=Asia/Shanghai`

If you later extend the project with remote analysis or SMTP sending, add those variables in Vercel project settings instead of committing them into the repo.

## Project Structure

```text
public/               Web UI assets
api/                  Vercel serverless API routes
scripts/              Local utility scripts
src/config/           Topic and source configuration
src/lib/digest.js     Aggregation, formatting, and rendering logic
server.js             Local Express server for development
vercel.json           Vercel deployment settings
```

## Notes

- Vercel is used for hosting the web experience.
- If you want scheduled email delivery, keep that in a separate automation layer such as GitHub Actions or another scheduler.
