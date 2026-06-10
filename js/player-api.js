// PlayerAPI — routes all user writes through the Cloudflare Worker.
// The GitHub token lives in the Worker as a secret; the browser never sees it.
//
// After deploying the worker (see worker/wrangler.toml), paste your Worker URL below.
const PlayerAPI = {
  WORKER_URL: 'https://wc2026-predictions-game.wc2026-predictions-game.workers.dev',

  async _post(action, data) {
    try {
      const resp = await fetch(this.WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) return { success: false, error: json.error || `HTTP ${resp.status}` };
      return json;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  join(pool, player) {
    return this._post('join', { pool, player });
  },

  prediction(pool, player, matchId, prediction) {
    return this._post('prediction', { pool, player, matchId, prediction });
  },

  general(pool, player, predictions) {
    return this._post('general', { pool, player, predictions });
  },

  isReady() {
    return !this.WORKER_URL.includes('REPLACE_WITH_YOUR_SUBDOMAIN');
  },
};
