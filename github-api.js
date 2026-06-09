// GitHub API Backend - replaces Google Sheets
// Data is stored as JSON files in the repo's data/ directory

const GitHubAPI = {
  // CONFIGURE THESE after creating your repo:
  OWNER: 'skharouf',
  REPO: 'wc2026-predictions',
  BRANCH: 'main',
  TOKEN: '', // Set via Settings modal - stored in localStorage
  // GitHub Enterprise base URL (use 'https://api.github.com' for public GitHub)
  API_BASE: 'https://github.qualcomm.com/api/v3',

  // Data file paths in the repo
  PATHS: {
    predictions: (comp) => `data/${comp}/predictions.json`,
    results: (comp) => `data/${comp}/results.json`,
    general: (comp) => `data/${comp}/general.json`,
    generalResults: (comp) => `data/${comp}/general_results.json`,
    brackets: (comp) => `data/${comp}/brackets.json`,
  },

  getToken() {
    return localStorage.getItem('wc2026_github_token') || this.TOKEN;
  },

  setToken(token) {
    localStorage.setItem('wc2026_github_token', token);
  },

  isConfigured() {
    return !!this.getToken();
  },

  headers() {
    return {
      'Authorization': `token ${this.getToken()}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  },

  // Read a JSON file from the repo
  async readFile(path) {
    try {
      const url = `${this.API_BASE}/repos/${this.OWNER}/${this.REPO}/contents/${path}?ref=${this.BRANCH}`;
      const response = await fetch(url, { headers: this.headers() });
      if (response.status === 404) return { data: null, sha: null };
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const file = await response.json();
      const content = JSON.parse(atob(file.content));
      return { data: content, sha: file.sha };
    } catch (error) {
      console.error('Error reading from GitHub:', error);
      return { data: null, sha: null };
    }
  },

  // Write a JSON file to the repo
  async writeFile(path, data, sha, message) {
    try {
      const url = `${this.API_BASE}/repos/${this.OWNER}/${this.REPO}/contents/${path}`;
      const body = {
        message: message || `Update ${path}`,
        content: btoa(JSON.stringify(data, null, 2)),
        branch: this.BRANCH,
      };
      if (sha) body.sha = sha;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `GitHub API error: ${response.status}`);
      }
      return { success: true };
    } catch (error) {
      console.error('Error writing to GitHub:', error);
      return { success: false, error: error.message };
    }
  },

  // Submit a match prediction
  async submitPrediction(playerName, matchId, prediction) {
    const comp = LocalStorage.getCompetition();
    const path = this.PATHS.predictions(comp);
    const { data, sha } = await this.readFile(path);
    const predictions = data || {};
    if (!predictions[playerName]) predictions[playerName] = {};
    predictions[playerName][matchId] = { ...prediction, timestamp: new Date().toISOString() };
    return await this.writeFile(path, predictions, sha, `Prediction: ${playerName} - Match ${matchId}`);
  },

  // Submit general predictions
  async submitGeneralPredictions(playerName, predictions) {
    const comp = LocalStorage.getCompetition();
    const path = this.PATHS.general(comp);
    const { data, sha } = await this.readFile(path);
    const allGeneral = data || {};
    allGeneral[playerName] = { ...predictions, timestamp: new Date().toISOString() };
    return await this.writeFile(path, allGeneral, sha, `General predictions: ${playerName}`);
  },

  // Get all predictions for a competition
  async getAllPredictions() {
    const comp = LocalStorage.getCompetition();
    const { data } = await this.readFile(this.PATHS.predictions(comp));
    return { success: true, data: data || {} };
  },

  // Get player predictions
  async getPlayerPredictions(playerName) {
    const result = await this.getAllPredictions();
    if (result.success && result.data[playerName]) {
      return { success: true, data: result.data[playerName] };
    }
    return { success: true, data: {} };
  },

  // Submit match result (admin)
  async submitResult(matchId, result) {
    const comp = LocalStorage.getCompetition();
    const path = this.PATHS.results(comp);
    const { data, sha } = await this.readFile(path);
    const results = data || {};
    results[matchId] = { ...result, timestamp: new Date().toISOString() };
    return await this.writeFile(path, results, sha, `Result: Match ${matchId}`);
  },

  // Get all results
  async getResults() {
    const comp = LocalStorage.getCompetition();
    const { data } = await this.readFile(this.PATHS.results(comp));
    return { success: true, data: data || {} };
  },

  // Submit bracket prediction
  async submitBracket(playerName, bracket) {
    const comp = LocalStorage.getCompetition();
    const path = this.PATHS.brackets(comp);
    const { data, sha } = await this.readFile(path);
    const brackets = data || {};
    brackets[playerName] = { ...bracket, timestamp: new Date().toISOString() };
    return await this.writeFile(path, brackets, sha, `Bracket: ${playerName}`);
  },

  // Get leaderboard (computed client-side from predictions + results)
  async getLeaderboard() {
    const comp = LocalStorage.getCompetition();
    const [predResult, resResult, genResult] = await Promise.all([
      this.readFile(this.PATHS.predictions(comp)),
      this.readFile(this.PATHS.results(comp)),
      this.readFile(this.PATHS.general(comp)),
    ]);
    const predictions = predResult.data || {};
    const results = resResult.data || {};
    const general = genResult.data || {};
    // Leaderboard calculation happens in app.js
    return { success: true, predictions, results, general };
  },

  // Get all general predictions
  async getAllGeneralPredictions() {
    const comp = LocalStorage.getCompetition();
    const { data } = await this.readFile(this.PATHS.general(comp));
    return { success: true, data: data || {} };
  },

  // Submit general prediction results (admin)
  async submitGeneralResults(results) {
    const comp = LocalStorage.getCompetition();
    const path = this.PATHS.generalResults(comp);
    const { sha } = await this.readFile(path);
    return await this.writeFile(path, { ...results, timestamp: new Date().toISOString() }, sha, 'General results updated');
  },
};

// Local storage with competition namespace (same as before)
const LocalStorage = {
  _prefix() {
    const comp = this.getCompetition();
    return `wc2026_${comp}_`;
  },

  getCompetition() {
    return localStorage.getItem('wc2026_active_competition') || 'work';
  },

  setCompetition(comp) {
    localStorage.setItem('wc2026_active_competition', comp);
  },

  getPlayerName() {
    return localStorage.getItem(this._prefix() + 'player');
  },

  setPlayerName(name) {
    localStorage.setItem(this._prefix() + 'player', name);
  },

  clearPlayer() {
    localStorage.removeItem(this._prefix() + 'player');
  },

  savePrediction(matchId, prediction) {
    const predictions = this.getAllPredictions();
    predictions[matchId] = { ...prediction, timestamp: new Date().toISOString() };
    localStorage.setItem(this._prefix() + 'predictions', JSON.stringify(predictions));
  },

  getPrediction(matchId) {
    const predictions = this.getAllPredictions();
    return predictions[matchId] || null;
  },

  getAllPredictions() {
    try {
      return JSON.parse(localStorage.getItem(this._prefix() + 'predictions') || '{}');
    } catch { return {}; }
  },

  saveBracket(bracket) {
    localStorage.setItem(this._prefix() + 'bracket', JSON.stringify(bracket));
  },

  getBracket() {
    try {
      return JSON.parse(localStorage.getItem(this._prefix() + 'bracket') || '{}');
    } catch { return {}; }
  },

  saveGeneralPredictions(predictions) {
    localStorage.setItem(this._prefix() + 'general', JSON.stringify(predictions));
  },

  getGeneralPredictions() {
    try {
      return JSON.parse(localStorage.getItem(this._prefix() + 'general') || '{}');
    } catch { return {}; }
  },
};
