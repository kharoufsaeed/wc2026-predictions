// WC2026 Predictions — Vercel Serverless Function
// Proxies user writes to GitHub so the token never touches the browser.
//
// Deploy: connect this GitHub repo to vercel.com, then add GITHUB_TOKEN
// as an environment variable in the Vercel project settings.

const GITHUB_API   = 'https://api.github.com';
const REPO_OWNER   = 'kharoufsaeed';
const REPO_NAME    = 'wc2026-predictions';
const BRANCH       = 'main';
const ALLOWED_ORIGIN = 'https://kharoufsaeed.github.io';

function token() {
  return process.env.GITHUB_TOKEN || '';
}

async function ghRead(path) {
  const resp = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`,
    { headers: { Authorization: `token ${token()}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (resp.status === 404) return { data: null, sha: null };
  if (!resp.ok) throw new Error(`GitHub read ${resp.status}: ${path}`);
  const file = await resp.json();
  return { data: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')), sha: file.sha };
}

async function ghWrite(path, data, sha, message) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const resp = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `token ${token()}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `GitHub write ${resp.status}: ${path}`);
  }
  return { success: true };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.headers.origin !== ALLOWED_ORIGIN) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!token()) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const { action, pool, player, matchId, prediction, predictions } = req.body;

    if (action === 'ping') {
      const resp = await fetch(`${GITHUB_API}/rate_limit`, {
        headers: { Authorization: `token ${token()}` },
      });
      const data = await resp.json().catch(() => ({}));
      return res.json({ status: resp.status, limit: data.resources?.core?.limit });
    }

    if (action === 'join') {
      if (!pool || !player) throw new Error('Missing pool or player');
      const { data, sha } = await ghRead(`data/${pool}/members.json`);
      const members = Array.isArray(data) ? data : [];
      if (!members.map(m => m.toLowerCase()).includes(player.toLowerCase())) {
        members.push(player);
        await ghWrite(`data/${pool}/members.json`, members, sha, `Join: ${player} → ${pool}`);
      }
      return res.json({ success: true });
    }

    if (action === 'prediction') {
      if (!pool || !player || !matchId || !prediction) throw new Error('Missing required fields');
      const { data, sha } = await ghRead(`data/${pool}/predictions.json`);
      const all = data || {};
      if (!all[player]) all[player] = {};
      all[player][matchId] = { ...prediction, timestamp: new Date().toISOString() };
      await ghWrite(`data/${pool}/predictions.json`, all, sha, `Prediction: ${player} – ${matchId}`);
      return res.json({ success: true });
    }

    if (action === 'general') {
      if (!pool || !player || !predictions) throw new Error('Missing required fields');
      const { data, sha } = await ghRead(`data/${pool}/general.json`);
      const all = data || {};
      all[player] = { ...predictions, timestamp: new Date().toISOString() };
      await ghWrite(`data/${pool}/general.json`, all, sha, `General: ${player} – ${pool}`);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
