# Beer Decider

A single-page app that answers one question: **Should I drink a beer?**

It runs a real simulation of 1,000,000 coin tosses in a Web Worker (so the UI
never freezes) and gives you a verdict:

- If heads > tails → *"Yes, you should drink pivo 🍺"*
- Otherwise → *"Not this time, bruh ❌"*

The coin isn't always fair — the "drink" probability is weighted by the
current day of the week:

| Day       | P(drink) |
| --------- | -------- |
| Monday    |   0%     |
| Tuesday   |  30%     |
| Wednesday |  50%     |
| Thursday  |  50%     |
| Friday    | 100%     |
| Saturday  |  80%     |
| Sunday    |  80%     |

All 1,000,000 iterations still run in every case — only the threshold on
`Math.random()` changes.

## File structure

```
beerapp/
  index.html    # markup
  style.css     # minimal centered layout
  app.js        # UI state machine, spawns the worker
  worker.js     # runs 1,000,000 Math.random() tosses in chunks
  README.md     # this file
```

No dependencies. No build step. No backend.

## Run locally

Web Workers loaded from a separate `.js` file require an HTTP origin in most
browsers (opening `index.html` directly via `file://` will not work in Chrome).
Use any static server. Two easy options:

### Option 1 — Python

```bash
cd beerapp
python3 -m http.server 5173
```

Then open <http://localhost:5173>.

### Option 2 — Node (no install)

```bash
cd beerapp
npx --yes serve .
```

`serve` will print the URL it's listening on (usually <http://localhost:3000>).

## How it works

- `app.js` spawns a dedicated `Worker('worker.js')` on each click.
- `worker.js` runs the 1,000,000-toss loop in 10 chunks of 100,000, posting a
  `progress` message between each chunk so the UI can update the percentage.
- When done, the worker posts `{ heads, tails }` and is terminated.
- The UI enforces a small minimum loading window (~400ms) so the "Consulting
  the beer gods…" state is always visible, without ever shortcutting the
  actual simulation.
