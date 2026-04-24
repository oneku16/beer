self.onmessage = (e) => {
  if (!e.data || e.data.type !== 'start') return;

  const total = e.data.total | 0;
  const pHeads = typeof e.data.pHeads === 'number' ? e.data.pHeads : 0.5;
  const chunk = 100000;
  let heads = 0;
  let tails = 0;
  let done = 0;

  while (done < total) {
    const end = Math.min(done + chunk, total);
    for (let i = done; i < end; i++) {
      if (Math.random() < pHeads) heads++;
      else tails++;
    }
    done = end;
    self.postMessage({ type: 'progress', done, total });
  }

  self.postMessage({ type: 'done', heads, tails });
};
