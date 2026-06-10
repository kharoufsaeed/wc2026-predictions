// FIFA World Cup 2026 Prediction App - GitHub Backend Version

// Escape HTML to prevent XSS when rendering user-controlled data into innerHTML
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// Helper: render flag icon from ISO code
function flagIcon(isoCode) {
  return `<span class="fi fi-${isoCode}"></span>`;
}

// Helper: generate player options for dropdowns
function playerOptions(positions, selectedValue) {
  let players = [];
  if (Array.isArray(positions)) {
    positions.forEach(pos => { players = players.concat(PLAYERS[pos] || []); });
  } else {
    players = PLAYERS[positions] || [];
  }
  players.sort((a, b) => a.name.localeCompare(b.name));
  return players.map(p => {
    const team = TEAMS[p.country];
    const flag = team ? team.flag : '';
    const label = `${p.name} (${p.country})`;
    const selected = selectedValue === p.name ? 'selected' : '';
    return `<option value="${p.name}" ${selected} data-flag="${flag}">${label}</option>`;
  }).join('');
}

// Helper: generate goalkeeper options
function goalkeeperOptions(selectedValue) {
  return playerOptions('goalkeepers', selectedValue);
}

// Helper: generate all players options (for top scorer, best player, MOTM, FGS)
function allPlayerOptions(selectedValue) {
  return playerOptions(['goalkeepers', 'defenders', 'midfielders', 'forwards'], selectedValue);
}

const App = {
  currentTab: 'general',
  currentCompetition: null,
  playerName: null,
  timezone: 'CT',
  syncStatus: 'idle', // idle, syncing, error

  init() {
    this.timezone = localStorage.getItem('wc2026_timezone') || 'CT';
    document.getElementById('tz-select').value = this.timezone;
    this.setupTabs();
    this.populateCompetitionDropdown(); // async — loads from GitHub

    const savedComp = LocalStorage.getCompetition();
    const savedName = localStorage.getItem(`wc2026_${savedComp}_player`);
    if (savedComp && savedName) {
      this.currentCompetition = savedComp;
      this.playerName = savedName;
      document.getElementById('login-competition').value = savedComp;
      this.showApp();
    }
  },

  // Load pools from GitHub and populate the login dropdown
  async populateCompetitionDropdown() {
    const select = document.getElementById('login-competition');
    select.innerHTML = '<option value="" disabled selected>Loading pools...</option>';
    let pools = [];
    try {
      const { data } = await GitHubAPI.readFile('data/pools.json');
      pools = Array.isArray(data) ? data : [];
      console.log('Loaded pools from', GitHubAPI.REPO + ':', pools);
    } catch (e) {
      console.error('Failed to read pools.json:', e);
      pools = [];
    }
    if (pools.length === 0) {
      console.log('No pools found, using fallback');
      pools = ['work', 'friends'];
    }
    select.innerHTML = '<option value="" disabled selected>Choose competition...</option>';
    pools.forEach(comp => {
      const opt = document.createElement('option');
      opt.value = comp;
      opt.textContent = comp.charAt(0).toUpperCase() + comp.slice(1);
      select.appendChild(opt);
    });
  },

  // Auth
  async login() {
    const comp = document.getElementById('login-competition').value;
    const rawName = document.getElementById('login-name').value.trim();
    const name = rawName.replace(/[^a-zA-Z0-9 _\-'.]/g, '').trim();
    if (!name) return alert('Please enter your name (letters, numbers, spaces, - _ \' . only)');
    if (!comp) return alert('Please select a competition pool');

    this.currentCompetition = comp;
    LocalStorage.setCompetition(comp);
    this.playerName = name;
    LocalStorage.setPlayerName(name);

    // Register member in GitHub via the Worker (no token needed in browser)
    if (PlayerAPI.isReady()) {
      PlayerAPI.join(comp, name); // fire-and-forget — don't block UI
    }

    this.showApp();
  },

  logout() {
    LocalStorage.clearPlayer();
    this.playerName = null;
    this.showLogin();
  },

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
    document.querySelector('.nav').style.display = 'block';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('player-name-display').textContent = this.playerName;
    this.renderCurrentTab();
  },

  showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-content').style.display = 'none';
    document.querySelector('.nav').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
  },

  // Timezone
  setTimezone(tz) {
    this.timezone = tz;
    localStorage.setItem('wc2026_timezone', tz);
    this.renderCurrentTab();
  },

  convertTime(dateStr, timeStr) {
    const offset = TIMEZONE_OFFSETS[this.timezone] || 0;
    const [h, m] = timeStr.split(':').map(Number);
    const totalMins = h * 60 + m + Math.round(offset * 60);
    const norm = ((totalMins % 1440) + 1440) % 1440;
    return `${String(Math.floor(norm / 60)).padStart(2, '0')}:${String(norm % 60).padStart(2, '0')}`;
  },

  formatDateTime(dateStr, timeStr) {
    const converted = this.convertTime(dateStr, timeStr);
    const date = new Date(dateStr + 'T12:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} - ${converted} ${this.timezone}`;
  },

  // Tabs
  setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.getElementById(`tab-${tabName}`).classList.add('active');
        this.currentTab = tabName;
        this.renderCurrentTab();
      });
    });
  },

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'general': this.renderGeneralPredictions(); break;
      case 'matches': this.renderMatches(); break;
      case 'standings': this.renderStandings(); break;
      case 'leaderboard': this.renderLeaderboard(); break;
      case 'bracket': this.renderBracket(); break;
      case 'rules': this.renderRules(); break;
    }
  },

  // ===== GENERAL PREDICTIONS =====
  isGeneralLocked() {
    // Lock after June 11, 2026 (tournament start)
    const lockDate = new Date('2026-06-11T00:00:00-04:00');
    return new Date() >= lockDate;
  },

  renderGeneralPredictions() {
    const container = document.getElementById('general-container');
    const saved = LocalStorage.getGeneralPredictions();
    const hasSaved = Object.keys(saved).length > 0;
    const locked = this.isGeneralLocked();
    const disabledAttr = locked ? 'disabled' : '';

    const title = 'General Tournament Predictions';
    const desc = 'Make your tournament-wide predictions before the first match kicks off. These are worth big points!';
    const lockBanner = locked ? `<div class="lock-banner">🔒 Locked — Tournament has started. General predictions can no longer be changed.</div>` : '';
    const saveFunc = 'saveGeneralPredictions';
    const btnLabel = 'Save Predictions';

    container.innerHTML = `
      <h2>${title}</h2>
      <p class="section-desc">${desc}</p>
      ${lockBanner}
      ${hasSaved ? this.renderSavedGeneral(saved) : ''}
      <div class="general-pred-grid">
        <div class="pred-field">
          <label>Top Scorer (Golden Boot)</label>
          <select id="gen-topscorer" ${disabledAttr}>
            <option value="">Select player...</option>
            ${allPlayerOptions(saved.topScorer)}
          </select>
          <span class="points-hint">${SCORING.generalTopScorer} pts</span>
        </div>
        <div class="pred-field">
          <label>Best Player (Golden Ball)</label>
          <select id="gen-bestplayer" ${disabledAttr}>
            <option value="">Select player...</option>
            ${allPlayerOptions(saved.bestPlayer)}
          </select>
          <span class="points-hint">${SCORING.generalBestPlayer} pts</span>
        </div>
        <div class="pred-field">
          <label>Best Goalkeeper (Golden Glove)</label>
          <select id="gen-goalkeeper" ${disabledAttr}>
            <option value="">Select goalkeeper...</option>
            ${goalkeeperOptions(saved.bestGoalkeeper)}
          </select>
          <span class="points-hint">${SCORING.generalBestGoalkeeper} pts</span>
        </div>
        <div class="pred-field">
          <label>Fair Play Team</label>
          <select id="gen-fairplay" ${disabledAttr}>
            <option value="">Select team...</option>
            ${Object.values(TEAMS).map(t => `<option value="${t.code}" ${saved.fairPlayTeam === t.code ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
          <span class="points-hint">${SCORING.generalFairPlayTeam} pts</span>
        </div>
        <div class="pred-field">
          <label>Most Clean Sheets (Team)</label>
          <select id="gen-cleansheets" ${disabledAttr}>
            <option value="">Select team...</option>
            ${Object.values(TEAMS).map(t => `<option value="${t.code}" ${saved.mostCleanSheets === t.code ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
          <span class="points-hint">${SCORING.generalMostCleanSheets} pts</span>
        </div>
        <div class="pred-field">
          <label>Fastest Goal (Team)</label>
          <select id="gen-fastestgoal" ${disabledAttr}>
            <option value="">Select team...</option>
            ${Object.values(TEAMS).map(t => `<option value="${t.code}" ${saved.fastestGoalTeam === t.code ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
          <span class="points-hint">${SCORING.generalFastestGoalTeam} pts</span>
        </div>
        <div class="pred-field">
          <label>Total Yellow Cards (tournament)</label>
          <input type="number" id="gen-yellows" placeholder="e.g. 220" value="${saved.totalYellowCards || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalYellowCards} pts (within 10)</span>
        </div>
        <div class="pred-field">
          <label>Total Red Cards (tournament)</label>
          <input type="number" id="gen-reds" placeholder="e.g. 15" value="${saved.totalRedCards || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalRedCards} pts (within 3)</span>
        </div>
        <div class="pred-field">
          <label>Total Goals (tournament)</label>
          <input type="number" id="gen-totalgoals" placeholder="e.g. 172" value="${saved.totalGoals || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalGoals} pts (within 10)</span>
        </div>
        <div class="pred-field">
          <label>Total Corners (tournament)</label>
          <input type="number" id="gen-corners" placeholder="e.g. 1000" value="${saved.totalCorners || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalCorners} pts (within 50)</span>
        </div>
        <div class="pred-field">
          <label>Total Penalties (tournament)</label>
          <input type="number" id="gen-penalties" placeholder="e.g. 25" value="${saved.totalPenalties || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalPenalties} pts (within 5)</span>
        </div>
        <div class="pred-field">
          <label>Total Pitch Invaders (tournament)</label>
          <input type="number" id="gen-invaders" placeholder="e.g. 3" value="${saved.totalPitchInvaders || ''}" ${disabledAttr}>
          <span class="points-hint">${SCORING.generalTotalPitchInvaders} pts (exact)</span>
        </div>
      </div>
      ${locked ? '' : `<button class="btn btn-primary" onclick="App.${saveFunc}()">${btnLabel}</button>`}
      <div id="general-sync-status"></div>
    `;
  },

  renderSavedGeneral(saved) {
    return `<div class="saved-general-grid">
      <div class="saved-item"><strong>Top Scorer:</strong> ${escapeHTML(saved.topScorer) || '-'}</div>
      <div class="saved-item"><strong>Best Player:</strong> ${escapeHTML(saved.bestPlayer) || '-'}</div>
      <div class="saved-item"><strong>Best GK:</strong> ${escapeHTML(saved.bestGoalkeeper) || '-'}</div>
      <div class="saved-item"><strong>Fair Play:</strong> ${saved.fairPlayTeam ? flagIcon(TEAMS[saved.fairPlayTeam]?.flag) + ' ' + saved.fairPlayTeam : '-'}</div>
      <div class="saved-item"><strong>Clean Sheets:</strong> ${saved.mostCleanSheets ? flagIcon(TEAMS[saved.mostCleanSheets]?.flag) + ' ' + saved.mostCleanSheets : '-'}</div>
      <div class="saved-item"><strong>Fastest Goal:</strong> ${saved.fastestGoalTeam ? flagIcon(TEAMS[saved.fastestGoalTeam]?.flag) + ' ' + saved.fastestGoalTeam : '-'}</div>
      <div class="saved-item"><strong>Yellow Cards:</strong> ${saved.totalYellowCards || '-'}</div>
      <div class="saved-item"><strong>Red Cards:</strong> ${saved.totalRedCards || '-'}</div>
      <div class="saved-item"><strong>Total Goals:</strong> ${saved.totalGoals || '-'}</div>
      <div class="saved-item"><strong>Total Corners:</strong> ${saved.totalCorners || '-'}</div>
      <div class="saved-item"><strong>Total Penalties:</strong> ${saved.totalPenalties || '-'}</div>
      <div class="saved-item"><strong>Pitch Invaders:</strong> ${saved.totalPitchInvaders || '-'}</div>
    </div>`;
  },

  async saveGeneralPredictions() {
    const predictions = {
      topScorer: document.getElementById('gen-topscorer').value,
      bestPlayer: document.getElementById('gen-bestplayer').value,
      bestGoalkeeper: document.getElementById('gen-goalkeeper').value,
      fairPlayTeam: document.getElementById('gen-fairplay').value,
      mostCleanSheets: document.getElementById('gen-cleansheets').value,
      fastestGoalTeam: document.getElementById('gen-fastestgoal').value,
      totalYellowCards: document.getElementById('gen-yellows').value,
      totalRedCards: document.getElementById('gen-reds').value,
      totalGoals: document.getElementById('gen-totalgoals').value,
      totalCorners: document.getElementById('gen-corners').value,
      totalPenalties: document.getElementById('gen-penalties').value,
      totalPitchInvaders: document.getElementById('gen-invaders').value,
    };
    LocalStorage.saveGeneralPredictions(predictions);
    const status = document.getElementById('general-sync-status');
    if (PlayerAPI.isReady()) {
      status.textContent = 'Syncing...';
      const result = await PlayerAPI.general(this.currentCompetition, this.playerName, predictions);
      status.textContent = result.success ? 'Saved!' : 'Saved locally (sync failed)';
      setTimeout(() => status.textContent = '', 3000);
    }
    this.renderGeneralPredictions();
  },

  // ===== MATCHES =====
  matchGroupFilter: 'all',

  setMatchGroupFilter(group) {
    this.matchGroupFilter = group;
    this.renderMatches();
  },

  renderMatches() {
    const container = document.getElementById('matches-container');
    const allGroups = Object.keys(GROUPS).sort();
    const activeFilter = this.matchGroupFilter;

    let html = '<h2>Matches</h2>';
    html += '<div class="group-filters">';
    html += `<button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" onclick="App.setMatchGroupFilter('all')">All</button>`;
    allGroups.forEach(g => {
      html += `<button class="filter-btn ${activeFilter === g ? 'active' : ''}" onclick="App.setMatchGroupFilter('${g}')">Group ${g}</button>`;
    });
    html += `<button class="filter-btn knockout-btn ${activeFilter === 'knockout' ? 'active' : ''}" onclick="App.setMatchGroupFilter('knockout')">Knockout</button>`;
    html += '</div>';

    // Group stage
    if (activeFilter !== 'knockout') {
      const groups = {};
      GROUP_MATCHES.forEach(m => {
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
      });

      const displayGroups = activeFilter === 'all' ? allGroups : [activeFilter];

      displayGroups.forEach(g => {
        if (!groups[g]) return;
        html += `<h3>Group ${g}</h3><div class="matches-list">`;
        groups[g].forEach(match => {
          html += this.renderMatchCard(match);
        });
        html += '</div>';
      });
    }

    // Knockout stage
    if (activeFilter === 'all' || activeFilter === 'knockout') {
      html += '<h2>Knockout Stage</h2><div class="matches-list">';
      KNOCKOUT_MATCHES.forEach(match => {
        html += `
          <div class="match-card knockout">
            <div class="match-header">
              <span class="match-id">${match.id}</span>
              <span class="match-round">${match.round}</span>
              <span class="match-datetime">${this.formatDateTime(match.date, match.time)}</span>
            </div>
            <div class="match-teams">
              <span class="team">${match.home}</span>
              <span class="vs">vs</span>
              <span class="team">${match.away}</span>
            </div>
            <div class="match-venue">${match.venue}</div>
          </div>`;
      });
      html += '</div>';
    }

    container.innerHTML = html;
  },

  renderMatchCard(match) {
    const home = TEAMS[match.home];
    const away = TEAMS[match.away];
    const pred = LocalStorage.getPrediction(match.id);
    const predClass = pred ? 'has-prediction' : '';
    const expanded = this._expandedMatch === match.id;

    let cardHtml = `<div class="match-card ${predClass}" id="match-card-${match.id}">`;
    cardHtml += `<div class="match-card-header" onclick="App.toggleMatchPrediction('${match.id}')">`;
    cardHtml += `<div class="match-header">
        <span class="match-id">${match.id}</span>
        <span class="match-datetime">${this.formatDateTime(match.date, match.time)}</span>
      </div>
      <div class="match-teams">
        <span class="team">${flagIcon(home.flag)} ${home.code}</span>
        <span class="vs">vs</span>
        <span class="team">${flagIcon(away.flag)} ${away.code}</span>
      </div>
      <div class="match-venue">${VENUES[match.venue] || match.venue}</div>`;

    // Show saved prediction/result summary
    if (pred) {
      cardHtml += `<div class="match-pred-saved">
        <span class="pred-score">${parseInt(pred.homeScore, 10)} - ${parseInt(pred.awayScore, 10)}</span>
        <div class="pred-details">
          ${pred.manOfMatch ? 'MOTM: ' + escapeHTML(pred.manOfMatch) : ''}
          ${pred.firstGoalScorer ? ' | FGS: ' + escapeHTML(pred.firstGoalScorer) : ''}
          ${pred.totalCards ? ' | Cards: ' + parseInt(pred.totalCards, 10) : ''}
          ${pred.bothTeamsScore === 'yes' || pred.bothTeamsScore === 'no' ? ' | BTS: ' + pred.bothTeamsScore : ''}
        </div>
      </div>`;
    } else {
      cardHtml += `<div class="prediction-badge empty">Click to predict</div>`;
    }
    cardHtml += '</div>'; // close match-card-header

    // Inline form (shown when expanded)
    if (expanded) {
      cardHtml += `<div class="match-pred-inline">
        <div class="score-row">
          <div class="score-input">
            <label>${home.code}</label>
            <input type="number" id="pred-home-${match.id}" min="0" max="20" value="${pred?.homeScore ?? ''}">
          </div>
          <span class="score-dash">-</span>
          <div class="score-input">
            <label>${away.code}</label>
            <input type="number" id="pred-away-${match.id}" min="0" max="20" value="${pred?.awayScore ?? ''}">
          </div>
        </div>
        <div class="pred-extras">
          <div class="pred-field">
            <label>Man of the Match</label>
            <select id="pred-motm-${match.id}">
              <option value="">Select player...</option>
              ${playerOptions(['goalkeepers','defenders','midfielders','forwards'], pred?.manOfMatch)}
            </select>
          </div>
          <div class="pred-field">
            <label>First Goal Scorer</label>
            <select id="pred-fgs-${match.id}">
              <option value="">Select player...</option>
              ${playerOptions(['goalkeepers','defenders','midfielders','forwards'], pred?.firstGoalScorer)}
            </select>
          </div>
          <div class="pred-field">
            <label>Total Cards</label>
            <input type="number" id="pred-cards-${match.id}" min="0" max="30" value="${pred?.totalCards ?? ''}">
          </div>
          <div class="pred-field">
            <label>Both Teams Score?</label>
            <select id="pred-bts-${match.id}">
              <option value="">Select...</option>
              <option value="yes" ${pred?.bothTeamsScore === 'yes' ? 'selected' : ''}>Yes</option>
              <option value="no" ${pred?.bothTeamsScore === 'no' ? 'selected' : ''}>No</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.saveInlinePrediction('${match.id}')">Save</button>
        <button class="btn btn-secondary" onclick="App.toggleMatchPrediction(null)">Cancel</button>
        <span id="inline-status-${match.id}"></span>
      </div>`;
    }

    cardHtml += '</div>';
    return cardHtml;
  },

  _expandedMatch: null,

  toggleMatchPrediction(matchId) {
    this._expandedMatch = (this._expandedMatch === matchId) ? null : matchId;
    this.renderMatches();
  },

  async saveInlinePrediction(matchId) {
    const prediction = {
      homeScore: document.getElementById(`pred-home-${matchId}`).value,
      awayScore: document.getElementById(`pred-away-${matchId}`).value,
      manOfMatch: document.getElementById(`pred-motm-${matchId}`).value,
      firstGoalScorer: document.getElementById(`pred-fgs-${matchId}`).value,
      totalCards: document.getElementById(`pred-cards-${matchId}`).value,
      bothTeamsScore: document.getElementById(`pred-bts-${matchId}`).value,
    };
    if (prediction.homeScore === '' || prediction.awayScore === '') {
      return alert('Please enter a score prediction');
    }
    LocalStorage.savePrediction(matchId, prediction);
    if (PlayerAPI.isReady()) {
      PlayerAPI.prediction(this.currentCompetition, this.playerName, matchId, prediction);
    }
    this._expandedMatch = null;
    this.renderMatches();
  },

  // ===== STANDINGS =====
  renderStandings() {
    const container = document.getElementById('standings-container');
    let html = '<h2>Group Standings</h2><div class="standings-grid">';

    Object.keys(GROUPS).sort().forEach(groupName => {
      const standings = this.calculateGroupStandings(groupName);
      html += `
        <div class="standings-group-card">
          <h3 class="standings-group-title">Group ${groupName}</h3>
          <table class="standings-table">
            <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
            <tbody>
              ${standings.map((t, i) => `
                <tr class="${i < 2 ? 'qualified' : i === 2 ? 'third-place' : ''}">
                  <td>${flagIcon(TEAMS[t.team].flag)} ${t.team}</td>
                  <td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
                  <td>${t.gd > 0 ? '+' : ''}${t.gd}</td><td><strong>${t.points}</strong></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    });

    html += '</div>';
    html += this.renderThirdPlaceTable();
    container.innerHTML = html;
  },

  calculateGroupStandings(groupName) {
    const teams = GROUPS[groupName].map(code => ({
      team: code, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
    }));
    // In a real scenario, results would come from GitHub API
    // For now, standings are based on submitted results
    return teams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  },

  renderThirdPlaceTable() {
    return `
      <h3 style="margin-top: 2rem;">Third-Place Teams Ranking</h3>
      <p class="section-desc">Top 8 of 12 third-place teams advance. Ranked by: Points > GD > GF > Fair Play > FIFA Ranking</p>
      <table class="standings-table third-place-table">
        <thead><tr><th>#</th><th>Group</th><th>Team</th><th>Pts</th><th>GD</th><th>GF</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td colspan="7" style="text-align:center; color: var(--text-light);">Results pending...</td></tr>
        </tbody>
      </table>`;
  },

  // ===== LEADERBOARD =====
  leaderboardPool: null,

  async renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    const selectedPool = this.leaderboardPool || this.currentCompetition;
    const poolName = selectedPool.charAt(0).toUpperCase() + selectedPool.slice(1);

    const poolSelector = '';

    container.innerHTML = `<h2>Leaderboard — ${poolName} Pool</h2>${poolSelector}<p>Loading...</p>`;

    if (!GitHubAPI.isConfigured()) {
      container.innerHTML = `<h2>Leaderboard — ${poolName} Pool</h2>${poolSelector}
        <p>Configure GitHub API to see shared leaderboard.</p>
        <p>Currently showing local predictions only.</p>`;
      return;
    }

    const data = await GitHubAPI.getLeaderboard(selectedPool);
    if (!data.success) {
      container.innerHTML = `<h2>Leaderboard — ${poolName} Pool</h2>${poolSelector}<p>Error loading data.</p>`;
      return;
    }

    const leaderboard = this.calculateLeaderboard(data.predictions, data.results, data.general);
    let html = `<h2>Leaderboard — ${poolName} Pool</h2>${poolSelector}`;
    if (leaderboard.length === 0) {
      html += '<p>No results entered yet.</p>';
    } else {
      html += `<table class="leaderboard-table">
        <thead><tr><th>#</th><th>Player</th><th>Points</th><th>Exact</th><th>Correct</th></tr></thead>
        <tbody>`;
      leaderboard.forEach((entry, i) => {
        html += `<tr class="${entry.name === this.playerName ? 'current-player' : ''}">
          <td>${i + 1}</td><td>${escapeHTML(entry.name)}</td><td><strong>${entry.points}</strong></td>
          <td>${entry.exact}</td><td>${entry.correct}</td></tr>`;
      });
      html += '</tbody></table>';
    }
    container.innerHTML = html;
  },

  calculateLeaderboard(predictions, results, general) {
    if (!predictions || !results) return [];
    const board = [];
    Object.keys(predictions).forEach(player => {
      let points = 0, exact = 0, correct = 0;
      const playerPreds = predictions[player];
      Object.keys(results).forEach(matchId => {
        if (playerPreds[matchId]) {
          const score = this.calculateScore(playerPreds[matchId], results[matchId]);
          points += score.total;
          if (score.exactScore) exact++;
          if (score.correctOutcome) correct++;
        }
      });
      board.push({ name: player, points, exact, correct });
    });
    return board.sort((a, b) => b.points - a.points);
  },

  calculateScore(prediction, result) {
    const score = { total: 0, exactScore: false, correctOutcome: false };
    const pH = parseInt(prediction.homeScore), pA = parseInt(prediction.awayScore);
    const rH = parseInt(result.homeScore), rA = parseInt(result.awayScore);

    if (pH === rH && pA === rA) {
      score.total += SCORING.exactScore;
      score.exactScore = true;
      score.correctOutcome = true;
    } else if ((pH - pA) === (rH - rA)) {
      score.total += SCORING.correctDifference;
      score.correctOutcome = true;
    } else if (Math.sign(pH - pA) === Math.sign(rH - rA)) {
      score.total += SCORING.correctOutcome;
      score.correctOutcome = true;
    }

    if (prediction.manOfMatch && result.manOfMatch &&
        prediction.manOfMatch.toLowerCase() === result.manOfMatch.toLowerCase()) {
      score.total += SCORING.manOfMatch;
    }
    if (prediction.firstGoalScorer && result.firstGoalScorer &&
        prediction.firstGoalScorer.toLowerCase() === result.firstGoalScorer.toLowerCase()) {
      score.total += SCORING.firstGoalScorer;
    }
    if (prediction.totalCards && result.totalCards &&
        Math.abs(parseInt(prediction.totalCards) - parseInt(result.totalCards)) <= 1) {
      score.total += SCORING.totalCardsWithin1;
    }
    if (prediction.bothTeamsScore && prediction.bothTeamsScore === result.bothTeamsScore) {
      score.total += SCORING.bothTeamsScore;
    }
    return score;
  },

  // ===== BRACKET =====
  renderBracket() {
    const container = document.getElementById('bracket-container');
    container.innerHTML = `<h2>Bracket Predictions</h2>
      <p class="section-desc">Predict which teams advance from each group and through the knockout rounds.</p>
      <p>Coming soon - bracket predictions will open after group stage begins.</p>`;
  },

  // ===== RULES =====
  renderRules() {
    const container = document.getElementById('rules-container');
    container.innerHTML = `
      <h2>Scoring Rules</h2>
      <div class="rules-grid">
        <div class="rules-card">
          <h3>Match Predictions</h3>
          <table class="rules-table">
            <tr><td>Exact score</td><td><strong>${SCORING.exactScore} pts</strong></td></tr>
            <tr><td>Correct goal difference</td><td><strong>${SCORING.correctDifference} pts</strong></td></tr>
            <tr><td>Correct outcome (W/D/L)</td><td><strong>${SCORING.correctOutcome} pts</strong></td></tr>
            <tr><td>Man of the Match</td><td><strong>${SCORING.manOfMatch} pts</strong></td></tr>
            <tr><td>First Goal Scorer</td><td><strong>${SCORING.firstGoalScorer} pts</strong></td></tr>
            <tr><td>Total Cards (within 1)</td><td><strong>${SCORING.totalCardsWithin1} pts</strong></td></tr>
            <tr><td>Both Teams Score</td><td><strong>${SCORING.bothTeamsScore} pts</strong></td></tr>
          </table>
        </div>
        <div class="rules-card">
          <h3>Bracket Predictions</h3>
          <table class="rules-table">
            <tr><td>Round of 32 correct</td><td><strong>${SCORING.bracketR32} pts</strong></td></tr>
            <tr><td>Round of 16 correct</td><td><strong>${SCORING.bracketR16} pts</strong></td></tr>
            <tr><td>Quarter Final correct</td><td><strong>${SCORING.bracketQF} pts</strong></td></tr>
            <tr><td>Semi Final correct</td><td><strong>${SCORING.bracketSF} pts</strong></td></tr>
            <tr><td>Final winner correct</td><td><strong>${SCORING.bracketFinal} pts</strong></td></tr>
            <tr><td>Group Winner</td><td><strong>${SCORING.groupWinner} pts</strong></td></tr>
            <tr><td>Group Runner-Up</td><td><strong>${SCORING.groupRunnerUp} pts</strong></td></tr>
          </table>
        </div>
        <div class="rules-card">
          <h3>General Predictions</h3>
          <table class="rules-table">
            <tr><td>Top Scorer</td><td><strong>${SCORING.generalTopScorer} pts</strong></td></tr>
            <tr><td>Best Player</td><td><strong>${SCORING.generalBestPlayer} pts</strong></td></tr>
            <tr><td>Best Goalkeeper</td><td><strong>${SCORING.generalBestGoalkeeper} pts</strong></td></tr>
            <tr><td>Fair Play Team</td><td><strong>${SCORING.generalFairPlayTeam} pts</strong></td></tr>
            <tr><td>Most Clean Sheets</td><td><strong>${SCORING.generalMostCleanSheets} pts</strong></td></tr>
            <tr><td>Fastest Goal Team</td><td><strong>${SCORING.generalFastestGoalTeam} pts</strong></td></tr>
            <tr><td>Total Yellow Cards (within 10)</td><td><strong>${SCORING.generalTotalYellowCards} pts</strong></td></tr>
            <tr><td>Total Red Cards (within 3)</td><td><strong>${SCORING.generalTotalRedCards} pts</strong></td></tr>
            <tr><td>Total Goals (within 10)</td><td><strong>${SCORING.generalTotalGoals} pts</strong></td></tr>
            <tr><td>Total Corners (within 50)</td><td><strong>${SCORING.generalTotalCorners} pts</strong></td></tr>
            <tr><td>Total Penalties (within 5)</td><td><strong>${SCORING.generalTotalPenalties} pts</strong></td></tr>
            <tr><td>Total Pitch Invaders (exact)</td><td><strong>${SCORING.generalTotalPitchInvaders} pts</strong></td></tr>
          </table>
        </div>
      </div>`;
  },

};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Pick up participant token from ?t= URL param if present
  PlayerAPI.initToken();

  // Migrate any token previously stored in localStorage to sessionStorage, then remove it
  const legacyToken = localStorage.getItem('wc2026_github_token');
  if (legacyToken) {
    sessionStorage.setItem('wc2026_github_token', legacyToken);
    localStorage.removeItem('wc2026_github_token');
  }
  App.init();
});
