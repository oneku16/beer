(() => {
  const TOTAL = 1_000_000;
  const MIN_LOADING_MS = 400;

  // Index matches Date#getDay(): 0 = Sunday ... 6 = Saturday.
  const DAYS = [
    { name: 'Sunday',    pHeads: 0.80, hint: 'Sunday — 80% yes. Brunch rules apply.' },
    { name: 'Monday',    pHeads: 0.00, hint: 'Monday — absolutely not.' },
    { name: 'Tuesday',   pHeads: 0.30, hint: 'Tuesday — 30% yes. The odds are not with you.' },
    { name: 'Wednesday', pHeads: 0.50, hint: 'Wednesday — pure 50/50. Fate decides.' },
    { name: 'Thursday',  pHeads: 0.50, hint: 'Thursday — pure 50/50. Fate decides.' },
    { name: 'Friday',    pHeads: 1.00, hint: 'Friday — you definitely should. 🍺' },
    { name: 'Saturday',  pHeads: 0.80, hint: 'Saturday — 80% yes. The weekend approves.' },
  ];

  const today = DAYS[new Date().getDay()];

  const idleEl = document.getElementById('idle');
  const loadingEl = document.getElementById('loading');
  const resultEl = document.getElementById('result');
  const decideBtn = document.getElementById('decide');
  const againBtn = document.getElementById('again');
  const progressEl = document.getElementById('progress');
  const verdictEl = document.getElementById('verdict');
  const statsEl = document.getElementById('stats');
  const dayHintEl = document.getElementById('day-hint');

  dayHintEl.textContent = today.hint;

  const numberFmt = new Intl.NumberFormat('en-US');

  function showOnly(el) {
    for (const s of [idleEl, loadingEl, resultEl]) {
      const visible = s === el;
      s.classList.toggle('state--visible', visible);
      s.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
  }

  function run() {
    showOnly(loadingEl);
    progressEl.textContent = 'Tossing 0%';

    const startedAt = performance.now();
    const worker = new Worker('worker.js');

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        const pct = Math.round((msg.done / msg.total) * 100);
        progressEl.textContent = `Tossing ${pct}%`;
        return;
      }
      if (msg.type === 'done') {
        const { heads, tails } = msg;
        const elapsed = performance.now() - startedAt;
        const wait = Math.max(0, MIN_LOADING_MS - elapsed);
        setTimeout(() => {
          renderResult(heads, tails);
          worker.terminate();
        }, wait);
      }
    };

    worker.onerror = (err) => {
      console.error('Worker error:', err);
      verdictEl.textContent = 'Something went wrong.';
      statsEl.textContent = String(err.message || err);
      showOnly(resultEl);
      worker.terminate();
    };

    worker.postMessage({ type: 'start', total: TOTAL, pHeads: today.pHeads });
  }

  function renderResult(heads, tails) {
    verdictEl.textContent = heads > tails
      ? 'Yes, you should drink pivo 🍺'
      : 'Not this time, bruh ❌';
    statsEl.textContent =
      `Heads: ${numberFmt.format(heads)} / Tails: ${numberFmt.format(tails)}`;
    showOnly(resultEl);
  }

  decideBtn.addEventListener('click', run);
  againBtn.addEventListener('click', run);
})();
