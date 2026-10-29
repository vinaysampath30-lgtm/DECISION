# Agentic Decision Engine

**Your Preferences. Connected. Your Next Decision, Smarter.**

An AI agent that turns human preferences into explainable recommendations, using the
[Qloo](https://docs.qloo.com) taste-intelligence API as its discovery engine.

React + Vite front end, Node + Express back end, no build-time secrets, no invented data.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Problem statement](#2-problem-statement)
3. [Proposed solution](#3-proposed-solution)
4. [Key features](#4-key-features)
5. [System architecture](#5-system-architecture)
6. [Agent workflow](#6-agent-workflow)
7. [Qloo integration](#7-qloo-integration)
8. [Technology stack](#8-technology-stack)
9. [Local installation](#9-local-installation)
10. [Environment variables](#10-environment-variables)
11. [Testing instructions](#11-testing-instructions)
12. [Deployment guide](#12-deployment-guide)
13. [Known limitations](#13-known-limitations)
14. [Future improvements](#14-future-improvements)
15. [License](#15-license)

Plus: [Manual end-to-end checklist](#manual-end-to-end-testing-checklist) ·
[Demo script](#demo-script) · [Hackathon summary](#hackathon-summary)

---

## 1. Project overview

The Agentic Decision Engine is a working web application that:

- takes a handful of things a person genuinely likes (a film, an artist, a cuisine, a venue),
- resolves each of those into a real entity,
- asks the Qloo Insights API for *taste-neighbours* of those entities across several categories,
- scores, explains and shortlists those neighbours against the user's stated objective and constraints,
- lets the user react (like / dislike / exclude / save) and re-run to see the shortlist change.

It is **not** a static landing page and **not** a fake chatbot. The recommendations that
appear are the entities the API actually returned, ranked by a scoring model whose factors
are printed on every card.

### Data-honesty rules this codebase enforces

These are enforced in code, not just in prose:

| Rule | Where it is enforced |
| --- | --- |
| Every entity carries `source: "qloo"` or `source: "demo"` | [normalize.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/utils/normalize.js), [demoService.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/demoService.js) |
| The heuristic score is always labelled `Engine score (heuristic)` and never called a Qloo score | [decisionEngine.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/decisionEngine.js) |
| Provider metrics (`popularity`, `rating`) are surfaced separately in `qlooPopularity` / `qlooRating`, never blended into the heuristic | [decisionEngine.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/decisionEngine.js#L641-L672) |
| With no API key the whole app says **demo mode** and uses a labelled local catalogue | [config/index.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/config/index.js), [App.jsx](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/client/src/App.jsx) |
| Stage progress is streamed from the server as each stage really runs — nothing is simulated | [recommendController.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/controllers/recommendController.js) |

---

## 2. Problem statement

People make small decisions constantly — what to watch tonight, where to eat this weekend,
what to read next. Recommendation products solve this badly:

- **Siloed by category.** A film service knows nothing about your taste in music, food or places.
- **Popularity-driven.** They surface what is popular, not what connects to *your* preferences.
- **Opaque.** "Because you watched…" is not an explanation. There is no way to audit why an item
  was suggested, what data produced it, or how confident the system is.
- **No iteration.** You cannot say "not this one" and watch the reasoning change.

Taste is cross-domain. Liking Blade Runner and Japanese cuisine and ambient music are not three
unrelated facts — they describe one aesthetic. Very few products act on that.

---

## 3. Proposed solution

A single agentic pipeline that treats the user's preferences as **taste anchors** and uses
Qloo's cross-domain affinity data to find adjacent things the user has not tried yet:

1. **Understand** — parse preferences, objective and constraints into a validated request.
2. **Discover** — resolve each free-text preference into a real entity (so the rest of the
   pipeline can reason over IDs, not strings).
3. **Generate options** — for every target category the objective implies, ask for taste-neighbours
   of each resolved anchor.
4. **Evaluate** — score every candidate against weighted, inspectable factors.
5. **Decide** — pick a *diverse* shortlist and write a per-item explanation.
6. **Improve** — fold the user's like / dislike / exclude feedback back into the ranking.

The distinguishing property is **explainability as a first-class output, not a post-hoc label**:
the score breakdown, the preference connection, the trade-off and the uncertainty are all
computed and returned alongside the recommendation.

---

## 4. Key features

**Preference input**
- 12 category chips (movie, TV, artist, album, book, author, cuisine, place, brand, destination,
  podcast, video game) with per-category quick-add suggestions.
- Add / remove / clear preferences, duplicate detection, 8-preference limit.
- Six decision objectives (weekend plan, watch tonight, next listen, somewhere to eat, discover
  something new, plan a trip) — each objective decides which categories the agent searches.
- Optional constraints: location, budget, time available, mood. Constraints the provider cannot
  verify are reported as unverified rather than assumed.

**Agentic workspace**
- Live six-stage workflow with real per-stage metrics and durations.
- A resolved-understanding panel showing which preferences matched an entity and which did not.
- Recommendation cards with: category, source badge, engine score + expandable factor breakdown,
  the preference connection, the reason, trade-offs, uncertainty, and provider metrics where present.
- Like / dislike / exclude / save / re-run controls that genuinely affect the next run.
- A "the agent would ask next" follow-up when the request is under-specified (e.g. no location).
- Full provenance panel: provider, endpoints used, query counts, results by source.

**Detail view**
- Full entity detail with a large image, description, preference connections, score explanation,
  related entities from the same run, and a source/provenance block.

**History & saved**
- Up to 40 saved discoveries and the last 12 runs, stored in the browser only, with input restore.

**Qualities**
- Loading skeletons, empty states, real API error messages, keyboard navigation, visible focus
  rings, `prefers-reduced-motion` support, ARIA roles on radiogroups/dialogs/live regions.
- Responsive from 360 px mobile up to wide desktop.

---

## 5. System architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Browser (React 18 + Vite)                                                   │
│                                                                              │
│  LandingPage ──► PreferencesPage ──► WorkspacePage ──► HistoryPage           │
│                        │                    │                                │
│                        └──── DecisionContext (state + localStorage) ────────┘ │
│                                             │                                │
│                                    lib/api.js  (fetch, NDJSON reader)         │
└─────────────────────────────────────────────┼────────────────────────────────┘
                                              │  /api/*  (Vite dev proxy or VITE_API_BASE_URL)
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Express API (server/ — the API key lives ONLY here)                         │
│                                                                              │
│  helmet · cors · json(120kb) · requestId · morgan · rateLimiter              │
│                                                                              │
│  routes/index.js                                                             │
│    GET  /api/health          → mode (live|demo), qlooConfigured              │
│    GET  /api/options         → objectives, categories, budgets, weights      │
│    POST /api/search          → resolve a name into entities                  │
│    POST /api/recommend       → one JSON decision payload                     │
│    POST /api/recommend/stream→ NDJSON: ready → stage* → result               │
│                                                                              │
│  middleware/  validate · rateLimit · errorHandler                            │
│                                                                              │
│  services/                                                                   │
│    qlooService.js      → Qloo /search, /v2/insights/, /entities (+timeouts)   │
│    demoService.js      → labelled local catalogue (no key configured)        │
│    decisionEngine.js   → the six-stage agent + heuristic scoring + reasons   │
└───────────────┬──────────────────────────────────────────┬───────────────────┘
                │ live mode                                 │ demo mode
                ▼                                           ▼
     ┌──────────────────────┐                  ┌────────────────────────────┐
     │  api.qloo.com        │                  │  data/demoCatalog.js       │
     │  x-api-key header    │                  │  ~70 entities, affinity    │
     │  /search             │                  │  keys, popularity: null,   │
     │  /v2/insights/       │                  │  rating: null              │
     │  /entities           │                  └────────────────────────────┘
     └──────────────────────┘
```

### Repository layout

```
DECISION/
├── package.json                 # npm workspaces + dev/build/test scripts
├── client/
│   ├── vite.config.js           # dev server on 5173, proxies /api → :5000
│   ├── tailwind.config.js       # ink/violet/cyan theme, glass + glow tokens
│   └── src/
│       ├── App.jsx              # routes + layout + demo-mode banner
│       ├── context/DecisionContext.jsx
│       ├── components/
│       │   ├── ui.jsx                     # GlassCard, Badge, ScoreBar, EntityThumb…
│       │   ├── layout/                    # Navbar, Footer
│       │   ├── landing/ConnectionVisual.jsx
│       │   ├── preferences/PreferenceBuilder.jsx
│       │   └── workspace/                 # WorkflowTimeline, RecommendationCard,
│       │                                  # RecommendationDetail, PreferenceSummary,
│       │                                  # ProvenancePanel
│       ├── pages/               # Landing, Preferences, Workspace, History
│       └── lib/                 # api.js, format.js, icons.js, hooks/
└── server/
    ├── server.js                # listen + graceful shutdown
    ├── app.js                   # createApp(): middleware stack
    ├── routes/index.js
    ├── controllers/             # searchController, recommendController
    ├── middleware/              # validate, rateLimit, errorHandler, requestId
    ├── services/                # qlooService, demoService, decisionEngine
    ├── data/                    # demoCatalog, objectives
    ├── utils/                   # normalize, errors, logger
    └── tests/                   # normalize, decisionEngine, api
```

### Request lifecycle (preferences → shortlist)

```
Client                       Server
  │  POST /api/recommend/stream {preferences, objective, constraints, feedback, exclude}
  ├──────────────────────────────────────────────────────────────────────────────────►
  │                                        validateRecommendBody (400 on bad input)
  │                                        rateLimiter (60 req/min/IP)
  │  ◄── {"type":"ready"} ────────────────────────────────────────────────────────────
  │  ◄── {"type":"stage","stage":{id:"understand",status:"running"}} ─────────────────
  │                                        runDecisionWorkflow() async generator
  │                                        ├ /search        ×per preference   (live)
  │                                        ├ /v2/insights/  ×target×anchor   (live)
  │                                        └ score → select → explain
  │  ◄── {"type":"stage", …} ×6 ─────────────────────────────────────────────────────
  │  ◄── {"type":"result","payload":{results:[…], stages:[…], provenance:{…}}} ───────
  ▼
render cards → user likes → re-run with feedback → order changes
```

---

## 6. Agent workflow

Six stages, implemented as a single async generator in
[decisionEngine.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/decisionEngine.js#L488-L762).
Each stage `yield`s a `running` event with real wording, then pushes a `completed` entry with
real metrics and elapsed time into `payload.stages`.

| # | Stage | What actually happens | Evidence returned |
| --- | --- | --- | --- |
| 1 | **Understand** | Preferences are sanitised, deduplicated (case-insensitive, per type), capped at 8. Objective is resolved from `data/objectives.js`. Constraints are validated — an unknown budget/time value becomes `null` rather than being trusted. | `preferences`, `objective`, `constraints`, `followUp` |
| 2 | **Discover** | Each preference is resolved to an entity via Qloo `/search` (live) or the demo index. Runs 4-wide via `mapWithConcurrency` so distinct categories are queried concurrently. | `Resolved: n/m`, per-preference `resolved` flag, a stage note naming every unresolved input |
| 3 | **Generate options** | Cross-product of `objective.targets` × resolved anchors. Live mode calls `/v2/insights/` with `filter.type` + `signal.interests.entities`; demo mode uses affinity-key overlap. Identity of the user's own inputs and any excluded IDs are removed here. | `Candidates`, `Queries`, `Failures` counts |
| 4 | **Evaluate** | Every candidate scored on five weighted factors (below). Worst-case candidates are culled. | `Scored: n` on 5 transparent factors |
| 5 | **Decide** | The top candidates are re-selected round-robin by category so a "weekend" answer contains food, film, music and places instead of six near-identical entries; the final shortlist is ordered by score. Per-item reason, trade-off and uncertainty strings are generated. | `Selected`, `Suppressed` |
| 6 | **Improve** | The user's likes, dislikes and exclusions are reported, and a baseline is compared with the feedback-applied ranking. | `Likes applied`, `Dislikes applied`, `Exclusions`, `rankingChange` |

### The scoring model

`WEIGHTS` in [decisionEngine.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/decisionEngine.js#L28-L50):

| Factor | Weight | Value |
| --- | --- | --- |
| `affinity` — taste affinity evidence | 0.34 | taste connections reported by the provider, summed across the preferences that surfaced the candidate, normalised against the strongest candidate. Live Qloo responses report one connection per preference signal; the demo catalogue reports its matched taste keys. |
| `objective` — objective fit | 0.20 | 1.0 if the category is in `objective.targets`, else 0.25 |
| `constraints` — constraint fit | 0.20 | share of *verifiable* constraints met; `null` when none were supplied |
| `breadth` — cross-category breadth | 0.16 | distinct preference categories that produced it ÷ total categories |
| `feedback` — your feedback | 0.10 | 1.0 liked, 0.0 disliked, `null` when unreacted |

Factors with a `null` value are **excluded from the denominator** (`weightSum`), and the payload
reports `applied`, `value`, `weight`, `contribution` and a human `detail` for each factor — so the
displayed percentage can be recomputed by hand from the breakdown (there is a test for exactly that).

The result is exposed as `score.kind = 'heuristic'` and `score.label = 'Engine score (heuristic)'`.
It is **not** a Qloo metric, and the UI never calls it one.

---

## 7. Qloo integration

### Real endpoints used

Confirmed against <https://docs.qloo.com> — see `get-search`, `get-entities`,
`basic-insights-use-case` and `parameters`. No endpoint, parameter or response field in this
codebase was invented.

| Purpose | Request |
| --- | --- |
| Resolve a name → entity | `GET {base}/search?query=&types[]=urn:entity:movie&take=4&sort_by=match` |
| Taste-based discovery | `GET {base}/v2/insights/?filter.type=urn:entity:place&signal.interests.entities=<anchor ids>&signal.location.query=Tokyo&filter.exclude.entities=<ids>&take=6` |
| Hydrate by id (helper) | `GET {base}/entities?entity_ids[]=…` |

- **Auth:** `x-api-key` header, added in [qlooService.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/services/qlooService.js#L58-L65).
  The key is read from `process.env.QLOO_API_KEY` at startup and never crosses to the browser.
- **Filters vs signals vs output:** `filter.*` decides *what kind of thing* you get back,
  `signal.*` decides *what the recommendations are based on*, and `take`/`page` shape the output.
  This app uses `signal.interests.entities` (the resolved preferences) as its anchor signal.
- **Type mapping:** the app's short type names map to `filter.type` URNs in
  [normalize.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/utils/normalize.js#L7-L23).
  The UI category `cuisine` resolves to `urn:entity:place`, because Qloo exposes dining venues
  as places.
- **Failure handling:** `404` is treated as *no results*, not an error; `401/403` → `QLOO_AUTH_FAILED`;
  `429` → `QLOO_RATE_LIMIT`; timeout → `QLOO_TIMEOUT` via `AbortController`; network failure →
  `QLOO_NETWORK_ERROR`. A failing discovery query is recorded in the stage's `Failures` metric and
  the run continues rather than pretending it succeeded.
- **Normalisation:** `/search` returns `{results:{entities:[…]}}`, `/v2/insights/` returns
  `{success, results:{entities:[…]}, duration}`. `normalizeEntityList()` accepts
  `results.entities`, `results`, `entities`, `data` and bare arrays, maps them onto one internal
  shape, and drops entries without an identity. `external` is reduced to *presence*, so an empty
  array is never reported as if the provider had returned data.

### Live mode vs demo mode

`appMode()` in [config/index.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/config/index.js#L59)
returns `'live'` when `QLOO_API_KEY` is set, otherwise `'demo'`.

In **demo mode** the identical six-stage pipeline runs, but `demoService` searches
[demoCatalog.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/data/demoCatalog.js) —
about 70 hand-written entities, each with a list of internal taste keys. Cross-category discovery
is then a genuine computation over key overlap; it is not a hard-coded answer list. Every entity
in that path is tagged `source: 'demo'`, carries `popularity: null` and `rating: null`, and
`provenance.endpoints` is empty so the app never claims a Qloo endpoint was called.

The UI states the mode in three places: a persistent banner, the navbar badge (with an explanation
popover), and a per-card source badge.

---

## 8. Technology stack

**Front end** — React 18, Vite 5, JavaScript (no TypeScript), Tailwind CSS 3 with a custom
`ink`/`violet`/`cyan` theme plus hand-written component layers in
[index.css](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/client/src/index.css),
Framer Motion, Lucide React icons, React Router 6, `fetch` with a hand-rolled NDJSON stream reader.

**Back end** — Node.js ≥ 18 (native `fetch`), Express 4, `express-rate-limit`, `helmet`, `cors`,
`morgan`, `dotenv`. ES modules throughout.

**Testing** — the built-in `node:test` runner plus `supertest`.

**Deployment target** — any static host for `client/dist` and any Node host for `server/`
(the zero-config Vercel layout is documented below).

---

## 9. Local installation

```bash
# 1. install (npm workspaces installs client + server together)
npm install

# 2. configure the server
cp server/.env.example server/.env
#    then set QLOO_API_KEY=... to enable live Qloo mode
#    (leaving it empty starts the app in clearly-labelled demo mode)

# 3. run both apps together
npm run dev
```

- Front end: <http://localhost:5173>
- API: <http://localhost:5000>
- Health probe: <http://localhost:5000/api/health>

The Vite dev server proxies `/api` to `http://localhost:5000`, so the browser never needs a
backend URL during development.

Other scripts:

```bash
npm run dev:server   # server only, with node --watch
npm run dev:client   # client only
npm run build        # production build of the client → client/dist
npm start            # run the API in production mode
npm test             # run the backend test suite
```

### Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Amber "Demo mode" banner and no Qloo data | `QLOO_API_KEY` is empty. Expected when no key is configured — the app is telling the truth. |
| `EADDRINUSE :::5000` or `Port 5173 is in use` | Something else owns the port. Stop it, or start with `PORT=5010` and `VITE_API_PROXY_TARGET=http://localhost:5010`. |
| "The backend is not reachable" on the preferences page | The API is not running. Start it with `npm run dev:server`. |
| `QLOO_AUTH_FAILED` | The key is wrong, or your Qloo account lacks access to that endpoint. |
| `QLOO_RATE_LIMIT` | The Qloo account hit its rate limit. Retry shortly. |
| Every card shows `Demo catalogue` | Working as designed: no key configured, so no result may be presented as Qloo data. |
| Images are generated illustrations rather than posters | Expected in demo mode (no provider image exists). Real Qloo entities render the provider image. |

---

## 10. Environment variables

Defined in [server/.env.example](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/.env.example).
`.env` is git-ignored; only `.env.example` is committed.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | Environment name |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowlist of browser origins |
| `QLOO_API_KEY` | *(empty)* | **Server-side only.** Empty ⇒ demo mode |
| `QLOO_BASE_URL` | `https://api.qloo.com` | API host |
| `QLOO_SEARCH_PATH` | `/search` | Name→entity resolution path |
| `QLOO_INSIGHTS_PATH` | `/v2/insights/` | Taste-based discovery path |
| `QLOO_ENTITIES_PATH` | `/entities` | Entity hydration path |
| `QLOO_TIMEOUT_MS` | `12000` | Per-request timeout (AbortController) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window |
| `RATE_LIMIT_MAX` | `60` | Requests per window per IP |

Client-side (optional), in `client/.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | *(empty)* | Absolute API origin for split deployments. Empty ⇒ same-origin `/api`. |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Dev-proxy target |

**Security notes.** The API key is read from the environment, used only in `qlooService`, never
sent to the browser, never written to `localStorage`, and never logged (the logger records the
request path and status only). `helmet` is enabled, JSON bodies are capped at 120 kB, every
string that reaches the engine is sanitised and length-clamped, and the API is rate-limited per IP.

---

## 11. Testing instructions

```bash
npm test          # from the repository root
```

This runs the three suites in [server/tests](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/tests)
using `node:test` (50 tests):

| File | Covers |
| --- | --- |
| [normalize.test.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/tests/normalize.test.js) | Type/URN mapping and UI aliases, control-character stripping and length clamping, every Qloo response envelope, deduplication, and the rule that absent provider values stay `null` rather than being invented |
| [decisionEngine.test.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/tests/decisionEngine.test.js) | Concurrency helper, stage ordering and streaming events, heuristic labelling, weights and recomputability of the score, the result limit, shortlist diversity and ordering, no self-recommendation, explanation presence, dislike suppression, exclusion, liked feedback, unresolved preferences, empty results, invalid input, duplicate collapsing, constraint validation, and demo-mode honesty |
| [api.test.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/server/tests/api.test.js) | `/health`, `/options`, `/recommend`, `/search`, the NDJSON stream contract, 400s for invalid input, the structured 404, and that no endpoint leaks the API key |

Static checks:

```bash
npm run build     # client must compile cleanly
npm run dev       # then walk the checklist below
```

### Manual end-to-end testing checklist

**Landing**
- [ ] `/` renders the headline "Your Preferences. Connected. Your Next Decision, Smarter." and a working "Start Discovering" button.
- [ ] All navbar links (`Overview`, `Preferences`, `Workspace`, `Saved & history`) navigate.
- [ ] The connection visual animates; it is labelled as illustrative, not live.
- [ ] In demo mode the amber banner is visible and readable.

**Preferences**
- [ ] Category chips switch; quick-add suggestions insert the right category.
- [ ] Add a preference, remove it, and clear all — the selected list stays in sync.
- [ ] Adding a duplicate, or a 9th preference, shows an inline error instead of failing silently.
- [ ] Selecting an objective updates the highlighted card and its target-type chips.
- [ ] Location / mood / budget / time persist across a reload (localStorage).
- [ ] "Run decision engine" with zero preferences shows a validation error and does not navigate.

**Workspace**
- [ ] All six stages appear and progress from running to completed with real metrics.
- [ ] The results area shows skeletons while running, then cards.
- [ ] Each card shows the `Engine score (heuristic)` label — never "Qloo score".
- [ ] Expanding "factors" reveals five weighted factors whose applied values reproduce the score.
- [ ] Every card states a reason, the preference connection, and an uncertainty note.
- [ ] `source` badges say `Qloo` in live mode and `Demo catalogue` in demo mode.
- [ ] "Details" opens the dialog with image, description, connections, score breakdown, related entities and provenance; Escape and the × close it.
- [ ] Like / dislike a card and press Re-run: the shortlist and the stage metrics change.
- [ ] Exclude a card: it disappears and the count in the sidebar increases.
- [ ] "Refine preferences" returns to `/preferences` with the form still populated.
- [ ] Cancel during a run stops it without an error state.

**History**
- [ ] Saving a card adds it to `/history`; removing it there removes it everywhere.
- [ ] Previous runs list their objective, mode, result count and duration.
- [ ] "Inspect" expands the real stage log for that run.
- [ ] "Restore inputs" repopulates the preferences form.
- [ ] Clearing history empties the list.

**Failure paths**
- [ ] Stop the API and reload `/preferences`: a clear "backend is not reachable" state appears.
- [ ] Enter a nonsense preference: the Discover stage names it as unresolved and the run still completes.
- [ ] With every candidate excluded, the empty state explains why and offers to clear exclusions.
- [ ] Narrow the window to 360 px: navigation collapses to a menu and no content overflows.
- [ ] Tab through the app: focus is always visible and every control is reachable.

---

## 12. Deployment guide

The repo is a two-part app: a static client and a Node API. Deploy the API first so the client
has a real origin.

### Backend (Render / Railway / Fly.io / any Node host)

1. Root directory: repository root; build command: `npm install`; start command: `npm start`.
2. Set environment variables: `QLOO_API_KEY`, `NODE_ENV=production`, `CORS_ORIGIN=https://<your-frontend-domain>`.
3. Verify: `GET https://<api-host>/api/health` returns `{"status":"ok","mode":"live",...}`.
   `"mode":"demo"` means the key is not visible to the process.

### Frontend (Vercel / Netlify / any static host)

1. Build command: `npm run build`; output directory: `client/dist`.
2. Set `VITE_API_BASE_URL=https://<api-host>` so the browser calls the deployed API.
3. Ensure the API's `CORS_ORIGIN` contains the exact frontend origin.

### Vercel single-project alternative

Keep `client/` as the project root, set the build command to `npm run build` and the output
directory to `dist`, and add a rewrite for `/api/(.*)` → the deployed API host. The dev-mode Vite
proxy in [vite.config.js](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/client/vite.config.js)
exists so local development needs no configuration at all.

**Never commit `.env`.** Confirmed ignored in [.gitignore](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/.gitignore);
only `.env.example` is tracked.

---

## 13. Known limitations

Stated plainly, because the alternative would be pretending.

1. **Live Qloo mode is not verified in this workspace.** No `QLOO_API_KEY` was available while
   this was built, so the code path that calls `api.qloo.com` is written from the published
   documentation and covered by unit tests of its request-building and normalisation, but it has
   **not** been exercised against a real account. Everything else — routing, the six-stage
   workflow, scoring, explanations, streaming, feedback, empty/error states — was verified
   end-to-end in demo mode. Running with a key is the first item on the checklist.
2. **Demo mode is the default.** With no key set, all entities come from the local sample
   catalogue and are labelled as such.
3. **Demo catalogue breadth.** ~70 entities — enough to demonstrate cross-category discovery,
   not a real index.
4. **Objective and category taxonomies are hand-written** (`server/data/objectives.js`), not
   derived from Qloo metadata.
5. **Score weights are hand-tuned**, not learned. They are exposed in `/api/options` and on every
   card so the tuning is inspectable, but they are heuristics.
6. **No accounts.** Saved items and history live in `localStorage` for the current browser only.
   There is no server-side profile and nothing is shared between devices.
7. **No screenshots are committed.** Genuine screenshots require a real browser session and were
   not captured; the checklist above is the reproducible way to produce them. Fabricated
   screenshots would misrepresent the app, so none are included.
8. **Related entities are drawn from the current shortlist only** (the top 3 previously-scored
   candidates), not from a fresh API call.
9. **No server-side LLM is enabled.** The reasons, trade-offs and uncertainty strings are
   template-generated from real computed factors. The `LLM_*` variables in `.env.example` are
   placeholders for optional future use; nothing consumes them today.
10. **Rate limiting is in-memory**, so it resets on restart and is per-instance.
11. **`/entities` hydration is implemented but unused** by the current flow, which optimises for
    fewer upstream calls.

---

## 14. Future improvements

- **Verify live mode against a real key** and record the first live run, then add a live-mode
  integration test behind an env guard.
- **LLM-written narration** on top of the computed factors, with the factors retained as the
  cited evidence (never as an unreviewed source of truth).
- **Semantic preference parsing** — accept "a rainy Sunday in Amsterdam" and derive constraints
  instead of requiring discrete fields.
- **Richer signals** — `signal.audience.*` and demographic signals, plus `filter.tags` and
  `filter.popularity` where the account supports them.
- **Explainable severe filtering** — show which constraints eliminated which candidates.
- **Persistent profiles** with a database, so saved discoveries sync across devices.
- **Caching keyed by (anchor ids + objective + constraints)** to cut upstream calls and latency.
- **Distributed rate limiting** (Redis) for multi-instance deployments.
- **Playwright E2E automation** of the manual checklist, including axe accessibility assertions.
- **Score calibration** against held-out feedback so the weights become learned rather than tuned.

---

## 15. License

MIT — see [LICENSE](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/LICENSE).

---

## Demo script

A five-minute walkthrough. Two variants: the demo-mode script that works with no key, and the
live-Qloo script for the version deployed with a key.

### Variant A — verified, no API key required (demo mode)

1. **Open `/`.** Point out the headline and the fact that the banner already says demo mode. Say
   why: no key is configured, so the app refuses to present anything as Qloo data.
2. **Open the navbar badge.** It explains live vs demo mode and what changes.
3. **Go to `/preferences`.** Add `Interstellar` (Movie, quick-add), `Japanese` (Cuisine) and
   `Tame Impala` (Artist). Deliberately try adding `Interstellar` twice — the inline error appears.
4. **Select "Plan my ideal weekend".** Point out that the objective lists the categories the agent
   will search (`place`, `movie`, `artist`, `destination`).
5. **Set location `Tokyo`, budget `Mid-range`.** Note that constraints the provider cannot verify
   are reported as unverified rather than assumed.
6. **Press "Run decision engine".** The workspace shows six stages advancing with live metrics —
   `Resolved: 3/3`, candidate counts, per-stage durations. These come from the server as it works.
7. **Read one card.** Expand **factors** and show that the five weighted values reproduce the
   displayed score by hand. Then point at the label: *Engine score (heuristic)*. Not a Qloo score.
8. **Open "Details".** Walk through the preference connections, the related entities from the same
   run, and the provenance block naming the source of every value.
9. **Dislike the top card and press Re-run.** Two things change: the item is gone (`Suppressed: 1`)
   and the Improve stage reports the applied feedback. That is the agentic loop closing.
10. **Save two cards, then open `/history`.** Show the saved list and the run log; press
    *Restore inputs* to prove the run is reproducible.
11. **Resize to phone width.** Navigation collapses, cards stack, nothing overflows.

### Variant B — live Qloo request (requires a key)

Prerequisite: `QLOO_API_KEY` set on the server; `/api/health` returns `"mode":"live"`.

1. Show `GET /api/health` returning `"mode":"live"` and `"qlooConfigured":true`.
2. Repeat steps 3–6 above. The Discover stage now reads *"Resolved 3/3 preference(s) through the
   Qloo search endpoint (3 request(s))"* and each card's source badge reads **Qloo**.
3. Open **Provenance**: it names `/search` and `/v2/insights/` as the endpoints actually used, with
   the real query counts.
4. Point at a card that shows a `Provider popularity` value: it is displayed separately, in its own
   chip, and is explicitly *not* part of the heuristic score.
5. **Show graceful degradation:** temporarily set an invalid `QLOO_API_KEY`, restart, and show the
   API returning `QLOO_AUTH_FAILED` with a message that explains the cause — instead of an empty
   shortlist that looks like "no results".

### 60-second problem / solution / innovation / impact

- **Problem.** Recommendations are siloed, popularity-driven and opaque; taste is cross-domain.
- **Solution.** An agent that resolves your preferences into entities, asks a taste-graph API for
  cross-category neighbours, scores them on published weights, and explains every pick.
- **Innovation.** Honesty as an architecture: `source` tags on every entity, heuristic scores
  labelled as heuristics, provider metrics kept separate, provenance returned with every result,
  and a demo mode that announces itself. Plus real streamed agent progress instead of a canned
  animation.
- **Impact.** A user can see *why* something was suggested, argue with it, and watch the answer
  change — the prerequisite for trusting an automated decision at all.

---

## Hackathon summary

- **Problem:** cross-domain taste is invisible to single-category recommenders.
- **Solution:** a six-stage agentic pipeline over Qloo taste intelligence, with explainability as
  a returned artifact.
- **Innovation:** verifiable data provenance end to end; heuristics never masquerade as provider
  metrics; streamed, real agent telemetry.
- **Technical implementation:** React 18 + Vite + Tailwind + Framer Motion; Express with helmet,
  CORS allowlist, request IDs, validation and rate limiting; a Qloo service with timeouts and
  typed upstream errors; a labelled demo catalogue; 50 automated tests; NDJSON streaming.
- **Impact:** makes an automated recommendation auditable, arguable and improvable.

### Submission readiness

| Item | Status |
| --- | --- |
| Public frontend demo | Not deployed from this workspace — deploy steps in [§12](#12-deployment-guide) |
| Deployed backend with env vars | Not deployed from this workspace — deploy steps in [§12](#12-deployment-guide) |
| Public source repository + license | [LICENSE](file:///c:/Users/vinay/OneDrive/Desktop/DECISION/LICENSE) (MIT) included; publishing is a repo-hosting step |
| Detailed README | This document |
| Architecture diagram | [§5](#5-system-architecture) |
| Screenshots | Not generated (see limitation 7) — reproducible via the manual checklist |
| Demo script | [Above](#demo-script) |
| Problem / solution / innovation / impact | [Above](#60-second--problem--solution--innovation--impact) |
| Verified end-to-end locally | Demo mode: yes (`npm run build` + `npm test` + manual walkthrough). Live Qloo mode: not verified (limitation 1) |
