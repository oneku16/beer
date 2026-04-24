(() => {
  const TOTAL = 1_000_000;
  const MIN_LOADING_MS = 400;

  const idleEl = document.getElementById('idle');
  const loadingEl = document.getElementById('loading');
  const resultEl = document.getElementById('result');
  const decideBtn = document.getElementById('decide');
  const againBtn = document.getElementById('again');
  const progressEl = document.getElementById('progress');
  const verdictEl = document.getElementById('verdict');
  const statsEl = document.getElementById('stats');

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

    worker.postMessage({ type: 'start', total: TOTAL });
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
