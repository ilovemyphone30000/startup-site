# Plus 1 prototype

NYU Entrepreneurship for the Music Industry, Fall 2026 class project. Team: Jonah, Daniel, Ronnie and Dylan.

A static site with two parts, built to look real for a class presentation and to test interest. **Every person, artist, venue and number is fictional demo data.** No backend, no logins, no payments.

| Route | What it is |
|---|---|
| `#/` | Landing page: problem, how it works, pricing, comparison, waitlist |
| `#/fan` | **Consumer fan site** (mobile first): shows feed, referral links and QR, **Fan Score**, data entry, Sources, rewards ladder, leaderboard, pass the torch |
| `#/agent` | **B2B backend** (desktop first): overview, tour dates, attribution, cost, data entry |
| `#/partner` | Reseller view: the $1.00 vs $1.25 split |

Fan and agent sides share one small localStorage store, so a friend purchase in the fan app shows up in the agent attribution table, and a tour date an agent enters shows up in the fan feed.

Look: the OJAS look from the aesthetics library (off-white, near-black, typewriter mono, Helvetica links, fat condensed wordmark, original engraved moose border). The one color exception is the red "at risk" flag.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
```

## Rename the company

The name is `Plus 1`, set by `NAME` in `src/config.ts`. Change it there and every page, the browser title and the wordmark update. The moose border art is `src/components/Engraving.tsx` and the favicon is `public/favicon.svg`.

## Deploy to GitHub Pages

1. Create a GitHub repo (for example `startup-site`) and push this folder to the `main` branch.
2. In the repo, go to **Settings, Pages**, and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.
4. The site appears at `https://<your-user>.github.io/<repo-name>/`.

The Vite `base` is set from the repo name by the workflow (`VITE_BASE=/<repo-name>/`). Locally it stays `/`. Routing uses `HashRouter`, so deep links such as `/#/fan` work on Pages with no server rewrites.

## Name

Chosen: **Plus 1**. Other ideas we had (none checked for trademarks or domains):

1. **Plus One**
2. **Headcount**
3. **Doorcrew**
4. **Full Room**
5. **Tag Along**

## What is mocked

- All artists, venues, cities' shows, fans, handles, sales numbers and referral attribution (`src/data/`). Dates are relative to today so the demo never goes stale.
- Referral links and QR codes use `ref.example.com`, a reserved domain that never resolves.
- Waitlist forms, fan entries, agent entries and "activate superfans" write to localStorage only. Nothing is sent. Reset from the fan Profile section or the agent Enter data tab.
- Fan Score, the rewards ladder, the leaderboard and the projected lift model are simple mock formulas (`src/config.ts`, `src/lib/derive.ts`).
- **Fraud prevention is mocked, not built.** The UI shows self-referrals blocked, fans buying through their own link flagged, self-reported shows checked against ticket scans, and flagged buys reviewed before billing.
- Sources tab: Spotify and Instagram files are really parsed in the browser (nothing uploaded), and "Load sample" runs the same parsers on a fake file. Last.fm, Discogs and DICE are mocked samples.
- The competitor table is our own qualitative read, not verified feature by feature. Check it before presenting.

## Pulling real fan data later

Researched in November 2026. Re-check before building.

| Source | What works | Notes |
|---|---|---|
| Spotify | Fan uploads their **Extended streaming history** (Account, Privacy, Download your data). | The Web API returns only the last 50 plays. New apps are capped at 5 allowlisted users, and extended access needs a registered business with 250k+ monthly users. The export can take up to about 30 days. |
| Last.fm | Public profile read with a free API key (`user.getTopArtists`, `user.getRecentTracks`). | The API allows browser calls (`access-control-allow-origin: *`). Fans who scrobble Spotify get full dated history. The key is visible in browser code, so use a small proxy for production. |
| Instagram | Fan uploads `following.json` from **Download your information** (JSON, All time). | No API gives follow dates. Each entry has a unix timestamp. The filename and layout vary between exports, so the parser accepts several. |
| Discogs | Public collection endpoint, no login: `GET /users/{name}/collection/folders/0/releases`. | Each release has `date_added`. The API allows browser calls. Send a descriptive User-Agent and expect rate limits. |
| DICE | No fan-facing API found. | Its documented API is a partner-only GraphQL "Ticket Holders" API. Treat it as a partnership integration, or have fans forward ticket emails. |

## Files

```
src/config.ts        NAME, pricing, score weights, risk rule
src/data/            artists, cities, shows, fans, referrals, rewards, competitors, samples
src/lib/store.ts     localStorage store shared by fan and agent (try/catch wrapped)
src/lib/derive.ts    Fan Score, at-risk rule, attribution, leaderboard, projected lift
src/lib/importers.ts Instagram and Spotify file parsers
src/pages/           Landing, Fan, Agent, Partner
```
