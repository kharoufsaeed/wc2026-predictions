// PlayerAPI — writes user predictions directly to GitHub.
//
// PARTICIPANT_TOKEN: fine-grained PAT with Contents: Read & Write on this repo only.
// Risk if extracted: someone could submit or edit predictions in this game.
// The admin token (results, pool management) is separate and lives only in admin.html.
const PlayerAPI = {
  GITHUB_API: 'https://api.github.com',
  OWNER: 'kharoufsaeed',
  REPO: 'wc2026-predictions-data',
  BRANCH: 'main',
  PARTICIPANT_TOKEN: 'PASTE_PARTICIPANT_TOKEN_HERE',

  _headers() {
    return {
      'Authorization': `token ${this.PARTICIPANT_TOKEN}`,
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
    return this.PARTICIPANT_TOKEN !== 'PASTE_PARTICIPANT_TOKEN_HERE';
  },
};
