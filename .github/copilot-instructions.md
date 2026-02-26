# CinemaSafe — Copilot Instructions

## Project Overview

CinemaSafe is a Node.js CLI tool that automates holding/reserving cinema seats on **Fandango** (with experimental Atom Tickets support) using Puppeteer web scraping. It was built to create social-distancing buffer zones around purchased seats by repeatedly "reserving" adjacent seats in a polling loop until showtime.

## Architecture

- **`CinemaSafe.js`** — Main entry point containing all core logic: movie info scraping, seat checking, seat reservation, and the two polling loops. Currently a monolith; planned to be modularized.
- **`targetSeats.js`** — Deprecated standalone prototype for Fandango seat targeting (up to 10 seats per Fandango limits). Has hardcoded values and runs via `setInterval`. Not imported by `CinemaSafe.js`. Can be repurposed or cannibalized for parts when modularizing. Also contains an experimental `ATOMtargetSeats` function for Atom Tickets (DOM selectors need research).

### Two Operational Modes

| Mode | Purpose | CLI Example |
|------|---------|-------------|
| **Buffer** | Reserves the two seats adjacent to a seat range (e.g., D6 and D9 around D7–D8) | `node CinemaSafe.js Buffer <url> <startSeat> <endSeat>` |
| **Target** | Reserves up to 10 specific seats per Fandango limits (may be non-sequential) | `node CinemaSafe.js Target <url> <seat1,seat2,...>` |

### Core Data Flow

1. `movieInfo(url)` → scrapes title, showtime, theatre, poster; sets the **global** `showTime` variable
2. `bufferLoop` / `targetLoop` → polls every ~45 seconds until `showTime` passes:
   - `checkSeat(url, seatId)` → opens a headless browser, checks seat HTML for `"This seat is available"` or `"unavailable"`, returns `"Open"` / `"Unavailable"`
   - `ReserveBufferSeats()` or `targetSeats()` → opens a new browser, clicks seats via CSS `#seatId` selectors, navigates Fandango's checkout flow (Next → overlay → buy-now-continue)

### Critical Pattern: Global `showTime`

`showTime` is declared as a bare `var` at module scope and set inside `movieInfo()`. Both loop functions depend on it. Any refactoring must preserve this shared state or replace it with an explicit return value.

## Running the Project

```bash
npm install
# Interactive menu:
node CinemaSafe.js
# CLI with positional args:
node CinemaSafe.js Buffer <fandango-url> H2 H5
node CinemaSafe.js Target <fandango-url> H2,H3,H4
# CLI with named args:
node CinemaSafe.js -mode Buffer -url <url> -startSeat H2 -endSeat H5
```

No build step, no test suite, no linter configured.

## Key Dependencies & Patterns

- **puppeteer-extra** with `StealthPlugin` and `AdblockerPlugin` — every browser launch must use these to avoid detection
- Each function (`checkSeat`, `ReserveBufferSeats`, `targetSeats`, `movieInfo`) launches and closes **its own browser instance**; they do not share a browser
- Fandango DOM selectors (e.g., `#ShowtimeTitleLink`, `#stickyFooterSelectedCount`, `#NextButton`, `#buynow-continue-btn`) are hardcoded — any Fandango UI changes will break these
- **Jimp** resizes movie poster to 54×80px and writes `moviePoster.png` to project root; `console-png` displays it in terminal
- `colors` library is used globally (no `const` — attaches to String prototype) for console output styling

## Conventions

- Seat IDs follow the pattern `<Row Letter><Number>` (e.g., `H2`, `D7`) — always uppercased before use
- Error handling uses emoji prefixes: `✔️` for success, `❌` for errors, `⌛` for waiting states
- Inline `sleep()` helper is redefined inside multiple functions rather than being shared
- Console output uses `.cyan`, `.magenta`, `.red` color methods extensively for status visibility
- The URL must be a Fandango ticket selection page (`https://tickets.fandango.com/...`)

## Planned Direction

These are active goals — new code should move toward this architecture:

1. **Modularize `CinemaSafe.js`** — Extract functions into separate modules (e.g., `scraper.js`, `reservation.js`, `cli.js`). Keep a thin orchestrator in the main entry point.
2. **Multi-platform with fallback** — Fandango is the primary platform. Atom Tickets (and potentially others) should run as background fallbacks so that if Fandango rate-limits or drops the seat hold, the fallback platform picks up automatically. Design reservation functions behind a common interface (e.g., `checkSeat(platform, url, seatId)`, `reserveSeats(platform, ...)`) so platforms are swappable.
3. **Add tests** — No test suite exists yet. When adding tests, use lightweight assertions against mocked Puppeteer pages rather than hitting live sites.
4. **Share utilities** — Consolidate the duplicated `sleep()` helper into a single shared utility. Same for browser launch configuration (`headless`, `--no-sandbox`, stealth/adblocker plugins).
5. **Atom Tickets** — `ATOMtargetSeats` in `targetSeats.js` is a starting point but the DOM selectors need fresh analysis. Atom requires entering a zip code on the home page before navigating to seats — any Atom implementation must handle this extra step.
