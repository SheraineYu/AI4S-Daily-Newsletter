# AI4S Daily Newsletter

AI4S Daily Newsletter is a high-signal daily brief for frontier models, scientific machine learning, atomistic simulation, hardware systems, magnetic materials, and globally important developments.

## Live Site

- [ai4s-daily-newsletter.vercel.app](https://ai4s-daily-newsletter.vercel.app/)

## Preview

![AI4S Daily Newsletter web UI](docs/images/web-home.png)

The site is available in both English and Chinese and presents the same digest in a readable publication layout.

## Coverage

- Frontier model launches and major product updates
- AI4S and scientific machine learning
- LAMs, PFD, DFT, LAMMPS, and ABACUS
- Agents and tool use
- Hardware acceleration, memory systems, FPGA, and ASIC
- Magnetic materials, magnetism, and spintronics
- Global watchlist items across finance, technology, policy, and defense

## What You Get

- A bilingual web digest
- Topic-by-topic news and paper selections
- Short framing for each topic before the links
- Card-style email output built from the same daily digest

## Editorial Style

- Focus on the last seven days, with stronger weight on the latest 24 to 72 hours
- Favor official announcements, strong papers, major releases, and material updates
- Filter out routine commits, stale items, and low-signal noise
- Keep the output compact, readable, and decision-oriented

## Use It

Open the live site to browse the current digest:

- [https://ai4s-daily-newsletter.vercel.app/](https://ai4s-daily-newsletter.vercel.app/)

The web view includes:

- English / Chinese switch
- Topic cards with news and papers
- Refresh action for rebuilding the digest
- Copy actions for text email and HTML email

## Local Run

If you want to run the project locally:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
public/               Web UI assets
src/config/           Topics and source configuration
src/lib/digest.js     Aggregation, ranking, and rendering logic
scripts/              Local utility scripts
server.js             Local server entry
```
