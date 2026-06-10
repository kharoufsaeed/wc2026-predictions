// WC2026 Predictions — Cloudflare Worker
// Proxies user writes to GitHub so the GitHub token never touches the browser.
//
// Deploy:
//   cd worker
//   npm install -g wrangler
//   wrangler login
//   wrangler secret put GITHUB_TOKEN   ← paste your participant PAT here
//   wrangler deploy
//
// The participant PAT needs: Contents → Read & Write on this repo only.
// It cannot be used for anything else and does NOT need admin permissions.

const GITHUB_API  = 'https://api.github.com';
const REPO_OWNER  = 'kharoufsaeed';
const REPO_NAME   = 'wc2026-predictions';
const BRANCH      = 'main';
// Only requests from this origin are accepted — change if you move the site
const ALLOWED_ORIGIN = 'https://kharoufsaeed.github.io';

// ── GitHub helpers ────────────────────────────────────────────────────────────

async function ghRead(path, token) {
  // Use raw URL for reads — works without auth on public repos, no IP restrictions
  const rawResp = await fetch(
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`,
    { headers: { 'Cache-Control': 'no-cache' } }
  );
  if (rawResp.status === 404) return { data: null, sha: null };
  if (!rawResp.ok) throw new Error(`GitHub read ${rawResp.status}: ${path}`);
  const data = await rawResp.json();

  // SHA is needed for writes — fetch via API with token
  const metaResp = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`,
    { headers: { Accept: 'application/vnd.github.v3+json', Authorization: `Bearer ${token}` } }
  );
  const sha = metaResp.ok ? (await metaResp.json()).sha : null;
  return { data, sha };
}


async function ghWrite(path, data, sha, message, token) {
  const body = { message, content: btoa(JSON.stringify(data, null, 2)), branch: BRANCH };
  if (sha) body.sha = sha;
  const resp = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `GitHub write ${resp.status}: ${path}`);
  }
  return { success: true };
}

// ── Action handlers ───────────────────────────────────────────────────────────

async function handleJoin({ pool, player }, token) {
  if (!pool || !player) throw new Error('Missing pool or player');
  const path = `data/${pool}/members.json`;
  const { data, sha } = await ghRead(path, token);
  const members = Array.isArray(data) ? data : [];
  if (!members.map(m => m.toLowerCase()).includes(player.toLowerCase())) {
    members.push(player);
    await ghWrite(path, members, sha, `Join: ${player} → ${pool}`, token);
  }
  return { success: true };
}

async function handlePrediction({ pool, player, matchId, prediction }, token) {
  if (!pool || !player || !matchId || !prediction) throw new Error('Missing required fields');
  const path = `data/${pool}/predictions.json`;
  const { data, sha } = await ghRead(path, token);
  const all = data || {};
  if (!all[player]) all[player] = {};
  all[player][matchId] = { ...prediction, timestamp: new Date().toISOString() };
  await ghWrite(path, all, sha, `Prediction: ${player} – ${matchId}`, token);
  return { success: true };
}

async function handleGeneral({ pool, player, predictions }, token) {
  if (!pool || !player || !predictions) throw new Error('Missing required fields');
  const path = `data/${pool}/general.json`;
  const { data, sha } = await ghRead(path, token);
  const all = data || {};
  all[player] = { ...predictions, timestamp: new Date().toISOString() };
  await ghWrite(path, all, sha, `General: ${player} – ${pool}`, token);
  return { success: true };
}

// ── Request router ────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    // Reject requests from other origins
    const origin = request.headers.get('Origin') || '';
    if (origin !== ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
    }

    try {
      const body = await request.json();
      const token = env.GITHUB_TOKEN;
      if (!token) throw new Error('Worker not configured — GITHUB_TOKEN secret missing');

      // Diagnostic: verify token is working
      if (body.action === 'ping') {
        const resp = await fetch(`${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
        });
        const info = await resp.json().catch(() => ({}));
        return new Response(JSON.stringify({ status: resp.status, message: info.message || 'ok', hasToken: !!token }), {
          status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }

      let result;
      switch (body.action) {
        case 'join':       result = await handleJoin(body, token);       break;
        case 'prediction': result = await handlePrediction(body, token); break;
        case 'general':    result = await handleGeneral(body, token);    break;
        default: throw new Error(`Unknown action: ${body.action}`);
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  },
};
