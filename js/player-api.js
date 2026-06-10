// PlayerAPI — writes user predictions directly to GitHub.
//
// Token delivery: admin shares a join link containing the token as a URL parameter,
// e.g. https://kharoufsaeed.github.io/wc2026-predictions/?t=github_pat_...
// The app stores it in sessionStorage and removes it from the URL immediately.
// The token never appears in committed code.
const PlayerAPI = {
  GITHUB_API: 'https://api.github.com',
  OWNER: 'kharoufsaeed',
  REPO: 'wc2026-predictions-data',
  BRANCH: 'main',

  _token() {
    return sessionStorage.getItem('wc2026_pt') || '';
  },

  // Called once on page load — picks up ?t=TOKEN from URL, stores in sessionStorage
  initToken() {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('t');
    if (t) {
      sessionStorage.setItem('wc2026_pt', t);
      // Strip token from URL so it doesn't linger in browser history
      params.delete('t');
      const clean = params.toString() ? '?' + params.toString() : window.location.pathname;
      history.replaceState(null, '', clean);
    }
  },

  _headers() {
    return {
      'Authorization': `token ${this._token()}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  },

  async _read(path) {
    const resp = await fetch(
      `${this.GITHUB_API}/repos/${this.OWNER}/${this.REPO}/contents/${path}?ref=${this.BRANCH}`,
      { headers: this._headers() }
    );
    if (resp.status === 404) return { data: null, sha: null };
    if (!resp.ok) throw new Error(`Read failed: ${resp.status}`);
    const file = await resp.json();
    return { data: JSON.parse(atob(file.content)), sha: file.sha };
  },

  async _write(path, data, sha, message) {
    const body = { message, content: btoa(JSON.stringify(data, null, 2)), branch: this.BRANCH };
    if (sha) body.sha = sha;
    const resp = await fetch(
      `${this.GITHUB_API}/repos/${this.OWNER}/${this.REPO}/contents/${path}`,
      { method: 'PUT', headers: this._headers(), body: JSON.stringify(body) }
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || `Write failed: ${resp.status}`);
    }
    return { success: true };
  },

  async join(pool, player) {
    try {
      const { data, sha } = await this._read(`data/${pool}/members.json`);
      const members = Array.isArray(data) ? data : [];
      if (!members.map(m => m.toLowerCase()).includes(player.toLowerCase())) {
        members.push(player);
        await this._write(`data/${pool}/members.json`, members, sha, `Join: ${player} → ${pool}`);
      }
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  },

  async prediction(pool, player, matchId, pred) {
    try {
      const { data, sha } = await this._read(`data/${pool}/predictions.json`);
      const all = data || {};
      if (!all[player]) all[player] = {};
      all[player][matchId] = { ...pred, timestamp: new Date().toISOString() };
      await this._write(`data/${pool}/predictions.json`, all, sha, `Prediction: ${player} – ${matchId}`);
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  },

  async general(pool, player, predictions) {
    try {
      const { data, sha } = await this._read(`data/${pool}/general.json`);
      const all = data || {};
      all[player] = { ...predictions, timestamp: new Date().toISOString() };
      await this._write(`data/${pool}/general.json`, all, sha, `General: ${player} – ${pool}`);
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  },

  isReady() {
    return !!this._token();
  },
};
