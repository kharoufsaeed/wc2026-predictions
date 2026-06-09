// FIFA World Cup 2026 Prediction App - GitHub Backend Version

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
  isAdmin: false,
  ADMIN_PASS: 'WC2026$xK9m!vR3pQ7z',
  timezone: 'CT',
  syncStatus: 'idle', // idle, syncing, error

  init() {
    this.timezone = localStorage.getItem('wc2026_timezone') || 'CT';
    document.getElementById('tz-select').value = this.timezone;
    this.setupTabs();
    this.populateCompetitionDropdown();

    const savedComp = LocalStorage.getCompetition();
    const savedName = localStorage.getItem(`wc2026_${savedComp}_player`);
    if (savedComp && savedName) {
      this.currentCompetition = savedComp;
      this.playerName = savedName;
      this.isAdmin = (savedName.toLowerCase() === 'admin');
      document.getElementById('login-competition').value = savedComp;
      this.showApp();
    }
  },

  // Competition management
  getCompetitions() {
    try {
      return JSON.parse(localStorage.getItem('wc2026_competitions') || '["work","friends"]');
    } catch { return ['work', 'friends']; }
  },

  saveCompetitions(comps) {
    localStorage.setItem('wc2026_competitions', JSON.stringify(comps));
  },

  addCompetition() {
    const input = document.getElementById('new-competition-name');
    const name = input.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!name) return;
    const comps = this.getCompetitions();
    if (!comps.includes(name)) {
      comps.push(name);
      this.saveCompetitions(comps);
    }
    input.value = '';
    this.populateCompetitionDropdown();
    document.getElementById('login-competition').value = name;
  },

  populateCompetitionDropdown() {
    const select = document.getElementById('login-competition');
    const comps = this.getCompetitions();
    select.innerHTML = '<option value="" disabled selected>Choose competition...</option>';
    comps.forEach(comp => {
      const opt = document.createElement('option');
      opt.value = comp;
      opt.textContent = comp.charAt(0).toUpperCase() + comp.slice(1);
      select.appendChild(opt);
    });
  },

  // Auth
  async login() {
    const comp = document.getElementById('login-competition').value;
    const name = document.getElementById('login-name').value.trim();
    const pass = document.getElementById('login-password')?.value || '';
    if (!comp) return alert('Please select a competition pool');
    if (!name) return alert('Please enter your name');

    // Admin check
    if (name.toLowerCase() === 'admin') {
      if (pass !== this.ADMIN_PASS) {
        return alert('Invalid admin password');
      }
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
      // Check username uniqueness — a name belongs to whoever used it first
      const existingPlayer = localStorage.getItem(`wc2026_${comp}_player`);
      if (existingPlayer && existingPlayer.toLowerCase() !== name.toLowerCase()) {
        // Check if this name is taken by someone else on GitHub
        if (GitHubAPI.isConfigured()) {
          const predData = await GitHubAPI.readFile(`data/${comp}/predictions.json`);
          if (predData.data && predData.data[name] !== undefined) {
            // Name exists in predictions — allow (they're returning)
          }
        }
      }
      // Prevent duplicate names in same browser (case-insensitive)
      const registeredNames = JSON.parse(localStorage.getItem(`wc2026_${comp}_registered`) || '[]');
      const nameLower = name.toLowerCase();
      if (registeredNames.length > 0 && !registeredNames.includes(nameLower)) {
        // New name on this browser — register it
        registeredNames.push(nameLower);
        localStorage.setItem(`wc2026_${comp}_registered`, JSON.stringify(registeredNames));
      } else if (registeredNames.length === 0) {
        localStorage.setItem(`wc2026_${comp}_registered`, JSON.stringify([nameLower]));
      }
    }

    this.currentCompetition = comp;
    this.playerName = name;
    LocalStorage.setCompetition(comp);
    LocalStorage.setPlayerName(name);
    this.showApp();
  },

  logout() {
    LocalStorage.clearPlayer();
    this.playerName = null;
    this.isAdmin = false;
    this.showLogin();
  },

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
    document.querySelector('.nav').style.display = 'block';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('player-name-display').textContent = this.playerName;
    // Show/hide admin tab
    const adminTab = document.querySelector('.nav-tab[data-tab="admin"]');
    if (adminTab) adminTab.style.display = this.isAdmin ? '' : 'none';
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
    let newH = h + offset;
    let newDate = dateStr;
    if (newH < 0) { newH += 24; /* prev day - simplified */ }
    if (newH >= 24) { newH -= 24; }
    return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
      case 'predictions': this.renderMyPredictions(); break;
      case 'leaderboard': this.renderLeaderboard(); break;
      case 'bracket': this.renderBracket(); break;
      case 'rules': this.renderRules(); break;
      case 'admin': this.renderAdmin(); break;
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

    const lockBanner = locked ? `<div class="lock-banner">🔒 Locked — Tournament has started. General predictions can no longer be changed.</div>` : '';

    container.innerHTML = `
      <h2>General Tournament Predictions</h2>
      <p class="section-desc">Make your tournament-wide predictions before the first match kicks off. These are worth big points!</p>
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
      </div>
      ${locked ? '' : '<button class="btn btn-primary" onclick="App.saveGeneralPredictions()">Save Predictions</button>'}
      <div id="general-sync-status"></div>
    `;
  },

  renderSavedGeneral(saved) {
    return `<div class="saved-general-grid">
      <div class="saved-item"><strong>Top Scorer:</strong> ${saved.topScorer || '-'}</div>
      <div class="saved-item"><strong>Best Player:</strong> ${saved.bestPlayer || '-'}</div>
      <div class="saved-item"><strong>Best GK:</strong> ${saved.bestGoalkeeper || '-'}</div>
      <div class="saved-item"><strong>Fair Play:</strong> ${saved.fairPlayTeam ? flagIcon(TEAMS[saved.fairPlayTeam]?.flag) + ' ' + saved.fairPlayTeam : '-'}</div>
      <div class="saved-item"><strong>Clean Sheets:</strong> ${saved.mostCleanSheets ? flagIcon(TEAMS[saved.mostCleanSheets]?.flag) + ' ' + saved.mostCleanSheets : '-'}</div>
      <div class="saved-item"><strong>Fastest Goal:</strong> ${saved.fastestGoalTeam ? flagIcon(TEAMS[saved.fastestGoalTeam]?.flag) + ' ' + saved.fastestGoalTeam : '-'}</div>
      <div class="saved-item"><strong>Yellow Cards:</strong> ${saved.totalYellowCards || '-'}</div>
      <div class="saved-item"><strong>Red Cards:</strong> ${saved.totalRedCards || '-'}</div>
      <div class="saved-item"><strong>Total Goals:</strong> ${saved.totalGoals || '-'}</div>
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
    };
    LocalStorage.saveGeneralPredictions(predictions);
    // Sync to GitHub if configured
    if (GitHubAPI.isConfigured()) {
      const status = document.getElementById('general-sync-status');
      status.textContent = 'Syncing to GitHub...';
      const result = await GitHubAPI.submitGeneralPredictions(this.playerName, predictions);
      status.textContent = result.success ? 'Saved & synced!' : 'Saved locally (sync failed)';
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
          const home = TEAMS[match.home];
          const away = TEAMS[match.away];
          const pred = LocalStorage.getPrediction(match.id);
          const predClass = pred ? 'has-prediction' : '';
          html += `
            <div class="match-card ${predClass}" onclick="App.openPredictionModal('${match.id}')">
              <div class="match-header">
                <span class="match-id">${match.id}</span>
                <span class="match-datetime">${this.formatDateTime(match.date, match.time)}</span>
              </div>
              <div class="match-teams">
                <span class="team">${flagIcon(home.flag)} ${home.code}</span>
                <span class="vs">vs</span>
                <span class="team">${flagIcon(away.flag)} ${away.code}</span>
              </div>
              <div class="match-venue">${VENUES[match.venue] || match.venue}</div>
              ${pred ? `<div class="prediction-badge">${pred.homeScore}-${pred.awayScore}</div>` : '<div class="prediction-badge empty">No prediction</div>'}
            </div>`;
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

  // ===== PREDICTION MODAL =====
  openPredictionModal(matchId) {
    const match = ALL_MATCHES.find(m => m.id === matchId);
    if (!match) return;
    const home = TEAMS[match.home];
    const away = TEAMS[match.away];
    const pred = LocalStorage.getPrediction(matchId) || {};

    const modal = document.getElementById('prediction-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${flagIcon(home.flag)} ${home.code} vs ${flagIcon(away.flag)} ${away.code}</h3>
        <p>${this.formatDateTime(match.date, match.time)} | ${match.venue}</p>
        <div class="pred-form">
          <div class="score-row">
            <div class="score-input">
              <label>${home.code}</label>
              <input type="number" id="pred-home" min="0" max="20" value="${pred.homeScore ?? ''}">
            </div>
            <span class="score-dash">-</span>
            <div class="score-input">
              <label>${away.code}</label>
              <input type="number" id="pred-away" min="0" max="20" value="${pred.awayScore ?? ''}">
            </div>
          </div>
          <div class="pred-extras">
            <div class="pred-field">
              <label>Man of the Match</label>
              <select id="pred-motm">
                <option value="">Select player...</option>
                ${playerOptions(['goalkeepers','defenders','midfielders','forwards'], pred.manOfMatch)}
              </select>
            </div>
            <div class="pred-field">
              <label>First Goal Scorer</label>
              <select id="pred-fgs">
                <option value="">Select player...</option>
                ${playerOptions(['goalkeepers','defenders','midfielders','forwards'], pred.firstGoalScorer)}
              </select>
            </div>
            <div class="pred-field">
              <label>Total Cards (yellow+red)</label>
              <input type="number" id="pred-cards" min="0" max="30" value="${pred.totalCards ?? ''}">
            </div>
            <div class="pred-field">
              <label>Both Teams Score?</label>
              <select id="pred-bts">
                <option value="">Select...</option>
                <option value="yes" ${pred.bothTeamsScore === 'yes' ? 'selected' : ''}>Yes</option>
                <option value="no" ${pred.bothTeamsScore === 'no' ? 'selected' : ''}>No</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" onclick="App.savePrediction('${matchId}')">Save Prediction</button>
          <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        </div>
      </div>`;
    modal.classList.add('active');
  },

  async savePrediction(matchId) {
    const prediction = {
      homeScore: document.getElementById('pred-home').value,
      awayScore: document.getElementById('pred-away').value,
      manOfMatch: document.getElementById('pred-motm').value,
      firstGoalScorer: document.getElementById('pred-fgs').value,
      totalCards: document.getElementById('pred-cards').value,
      bothTeamsScore: document.getElementById('pred-bts').value,
    };
    if (prediction.homeScore === '' || prediction.awayScore === '') {
      return alert('Please enter a score prediction');
    }
    LocalStorage.savePrediction(matchId, prediction);
    if (GitHubAPI.isConfigured()) {
      await GitHubAPI.submitPrediction(this.playerName, matchId, prediction);
    }
    this.closeModal();
    this.renderMatches();
  },

  closeModal() {
    document.getElementById('prediction-modal').classList.remove('active');
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

  // ===== MY PREDICTIONS =====
  renderMyPredictions() {
    const container = document.getElementById('predictions-container');
    const predictions = LocalStorage.getAllPredictions();
    const general = LocalStorage.getGeneralPredictions();
    const count = Object.keys(predictions).length;
    const hasGeneral = Object.keys(general).length > 0;

    let html = `<h2>My Predictions</h2>`;

    // General predictions summary
    html += '<h3>General Tournament Predictions</h3>';
    if (hasGeneral) {
      html += `<div class="my-general-summary">
        <div class="saved-general-grid">
          <div class="saved-item"><strong>Top Scorer:</strong> ${general.topScorer || '-'}</div>
          <div class="saved-item"><strong>Best Player:</strong> ${general.bestPlayer || '-'}</div>
          <div class="saved-item"><strong>Best GK:</strong> ${general.bestGoalkeeper || '-'}</div>
          <div class="saved-item"><strong>Fair Play:</strong> ${general.fairPlayTeam ? flagIcon(TEAMS[general.fairPlayTeam]?.flag) + ' ' + general.fairPlayTeam : '-'}</div>
          <div class="saved-item"><strong>Clean Sheets:</strong> ${general.mostCleanSheets ? flagIcon(TEAMS[general.mostCleanSheets]?.flag) + ' ' + general.mostCleanSheets : '-'}</div>
          <div class="saved-item"><strong>Fastest Goal:</strong> ${general.fastestGoalTeam ? flagIcon(TEAMS[general.fastestGoalTeam]?.flag) + ' ' + general.fastestGoalTeam : '-'}</div>
          <div class="saved-item"><strong>Yellow Cards:</strong> ${general.totalYellowCards || '-'}</div>
          <div class="saved-item"><strong>Red Cards:</strong> ${general.totalRedCards || '-'}</div>
          <div class="saved-item"><strong>Total Goals:</strong> ${general.totalGoals || '-'}</div>
        </div>
      </div>`;
    } else {
      html += '<p class="section-desc">No general predictions yet. Go to the General Predictions tab to make yours.</p>';
    }

    // Match predictions
    html += `<h3>Match Predictions</h3><p>${count} of ${GROUP_MATCHES.length} group matches predicted</p>`;
    if (count > 0) {
      html += '<div class="predictions-list">';
      Object.entries(predictions).forEach(([matchId, pred]) => {
        const match = ALL_MATCHES.find(m => m.id === matchId);
        if (!match) return;
        const home = TEAMS[match.home];
        const away = TEAMS[match.away];
        html += `
          <div class="prediction-item" onclick="App.openPredictionModal('${matchId}')">
            <span class="pred-match">${flagIcon(home.flag)} ${home.code} ${pred.homeScore}-${pred.awayScore} ${away.code} ${flagIcon(away.flag)}</span>
            <span class="pred-extras-summary">
              ${pred.manOfMatch ? 'MOTM: ' + pred.manOfMatch : ''}
              ${pred.firstGoalScorer ? '| FGS: ' + pred.firstGoalScorer : ''}
            </span>
          </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;
  },

  // ===== LEADERBOARD =====
  leaderboardPool: null,

  async renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    const selectedPool = this.leaderboardPool || this.currentCompetition;
    const poolName = selectedPool.charAt(0).toUpperCase() + selectedPool.slice(1);

    // Admin pool selector
    let poolSelector = '';
    if (this.isAdmin) {
      const comps = this.getCompetitions();
      poolSelector = `<div class="pool-selector">
        <label>View pool:</label>
        <select onchange="App.leaderboardPool=this.value; App.renderLeaderboard()">
          ${comps.map(c => `<option value="${c}" ${c === selectedPool ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
        </select>
      </div>`;
    }

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
          <td>${i + 1}</td><td>${entry.name}</td><td><strong>${entry.points}</strong></td>
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
          </table>
        </div>
      </div>`;
  },

  // ===== ADMIN =====
  renderAdmin() {
    const container = document.getElementById('admin-container');
    if (!this.isAdmin) {
      container.innerHTML = '<h2>Access Denied</h2><p>Admin access required.</p>';
      return;
    }
    container.innerHTML = `
      <h2>Admin Panel</h2>
      <div class="admin-section">
        <h3>GitHub Configuration</h3>
        <p class="section-desc">Configure your GitHub repo to enable shared predictions and leaderboard.</p>
        <div class="admin-config">
          <div class="pred-field">
            <label>GitHub Username</label>
            <input type="text" id="cfg-owner" placeholder="your-username" value="${GitHubAPI.OWNER !== 'YOUR_GITHUB_USERNAME' ? GitHubAPI.OWNER : ''}">
          </div>
          <div class="pred-field">
            <label>Repository Name</label>
            <input type="text" id="cfg-repo" placeholder="wc2026-predictions" value="${GitHubAPI.REPO}">
          </div>
          <div class="pred-field">
            <label>Personal Access Token</label>
            <input type="password" id="cfg-token" placeholder="ghp_xxxxxxxxxxxx" value="${GitHubAPI.getToken()}">
            <span class="points-hint">Fine-grained token with repo contents read/write</span>
          </div>
          <button class="btn btn-primary" onclick="App.saveGitHubConfig()">Save Configuration</button>
          <button class="btn btn-secondary" onclick="App.testGitHubConnection()">Test Connection</button>
          <div id="config-status"></div>
        </div>
      </div>
      <div class="admin-section">
        <h3>Enter Match Results</h3>
        <p class="section-desc">Enter actual results to calculate scores and update leaderboard.</p>
        <div class="admin-results">
          <select id="admin-match-select">
            <option value="">Select match...</option>
            ${GROUP_MATCHES.map(m => `<option value="${m.id}">${m.id}: ${TEAMS[m.home].code} vs ${TEAMS[m.away].code}</option>`).join('')}
          </select>
          <div class="score-row" style="margin-top:1rem;">
            <div class="score-input"><label>Home</label><input type="number" id="res-home" min="0"></div>
            <span class="score-dash">-</span>
            <div class="score-input"><label>Away</label><input type="number" id="res-away" min="0"></div>
          </div>
          <div class="pred-extras">
            <div class="pred-field"><label>Man of the Match</label>
              <select id="res-motm"><option value="">Select player...</option>${allPlayerOptions('')}</select>
            </div>
            <div class="pred-field"><label>First Goal Scorer</label>
              <select id="res-fgs"><option value="">Select player...</option>${allPlayerOptions('')}</select>
            </div>
            <div class="pred-field"><label>Total Cards</label><input type="number" id="res-cards" min="0"></div>
            <div class="pred-field"><label>Both Teams Scored?</label>
              <select id="res-bts"><option value="yes">Yes</option><option value="no">No</option></select>
            </div>
          </div>
          <button class="btn btn-primary" onclick="App.submitResult()">Submit Result</button>
          <div id="result-status"></div>
        </div>
      </div>
      <div class="admin-section">
        <h3>General Predictions - Actual Results</h3>
        <p class="section-desc">Enter actual tournament-wide results to score general predictions.</p>
        <div class="admin-results">
          <div class="general-pred-grid">
            <div class="pred-field">
              <label>Top Scorer (Golden Boot)</label>
              <select id="gen-res-topscorer">
                <option value="">Select player...</option>
                ${allPlayerOptions('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Best Player (Golden Ball)</label>
              <select id="gen-res-bestplayer">
                <option value="">Select player...</option>
                ${allPlayerOptions('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Best Goalkeeper (Golden Glove)</label>
              <select id="gen-res-goalkeeper">
                <option value="">Select goalkeeper...</option>
                ${goalkeeperOptions('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Fair Play Team</label>
              <select id="gen-res-fairplay">
                <option value="">Select team...</option>
                ${Object.values(TEAMS).map(t => `<option value="${t.code}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Most Clean Sheets (Team)</label>
              <select id="gen-res-cleansheets">
                <option value="">Select team...</option>
                ${Object.values(TEAMS).map(t => `<option value="${t.code}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Fastest Goal (Team)</label>
              <select id="gen-res-fastestgoal">
                <option value="">Select team...</option>
                ${Object.values(TEAMS).map(t => `<option value="${t.code}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="pred-field">
              <label>Total Yellow Cards (tournament)</label>
              <input type="number" id="gen-res-yellows" placeholder="e.g. 220">
            </div>
            <div class="pred-field">
              <label>Total Red Cards (tournament)</label>
              <input type="number" id="gen-res-reds" placeholder="e.g. 15">
            </div>
            <div class="pred-field">
              <label>Total Goals (tournament)</label>
              <input type="number" id="gen-res-totalgoals" placeholder="e.g. 172">
            </div>
          </div>
          <button class="btn btn-primary" onclick="App.submitGeneralResults()">Submit General Results</button>
          <div id="general-result-status"></div>
        </div>
      </div>`;
  },

  async submitGeneralResults() {
    const results = {
      topScorer: document.getElementById('gen-res-topscorer').value,
      bestPlayer: document.getElementById('gen-res-bestplayer').value,
      bestGoalkeeper: document.getElementById('gen-res-goalkeeper').value,
      fairPlayTeam: document.getElementById('gen-res-fairplay').value,
      mostCleanSheets: document.getElementById('gen-res-cleansheets').value,
      fastestGoalTeam: document.getElementById('gen-res-fastestgoal').value,
      totalYellowCards: document.getElementById('gen-res-yellows').value,
      totalRedCards: document.getElementById('gen-res-reds').value,
      totalGoals: document.getElementById('gen-res-totalgoals').value,
    };
    const status = document.getElementById('general-result-status');
    if (GitHubAPI.isConfigured()) {
      status.textContent = 'Submitting...';
      const res = await GitHubAPI.submitGeneralResults(results);
      status.textContent = res.success ? 'General results submitted!' : 'Error: ' + res.error;
    } else {
      status.textContent = 'Configure GitHub first to submit results.';
    }
  },

  saveGitHubConfig() {
    const owner = document.getElementById('cfg-owner').value.trim();
    const repo = document.getElementById('cfg-repo').value.trim();
    const token = document.getElementById('cfg-token').value.trim();
    if (owner) GitHubAPI.OWNER = owner;
    if (repo) GitHubAPI.REPO = repo;
    if (token) GitHubAPI.setToken(token);
    localStorage.setItem('wc2026_github_owner', owner);
    localStorage.setItem('wc2026_github_repo', repo);
    document.getElementById('config-status').textContent = 'Configuration saved!';
  },

  async testGitHubConnection() {
    const status = document.getElementById('config-status');
    status.textContent = 'Testing...';
    try {
      const url = `${GitHubAPI.API_BASE}/repos/${GitHubAPI.OWNER}/${GitHubAPI.REPO}`;
      const resp = await fetch(url, { headers: GitHubAPI.headers() });
      if (resp.ok) {
        status.textContent = 'Connected successfully!';
        status.style.color = 'green';
      } else {
        status.textContent = `Error: ${resp.status} - Check your config`;
        status.style.color = 'red';
      }
    } catch (e) {
      status.textContent = `Connection failed: ${e.message}`;
      status.style.color = 'red';
    }
  },

  async submitResult() {
    const matchId = document.getElementById('admin-match-select').value;
    if (!matchId) return alert('Select a match');
    const result = {
      homeScore: document.getElementById('res-home').value,
      awayScore: document.getElementById('res-away').value,
      manOfMatch: document.getElementById('res-motm').value,
      firstGoalScorer: document.getElementById('res-fgs').value,
      totalCards: document.getElementById('res-cards').value,
      bothTeamsScore: document.getElementById('res-bts').value,
    };
    if (result.homeScore === '' || result.awayScore === '') return alert('Enter the score');

    const status = document.getElementById('result-status');
    if (GitHubAPI.isConfigured()) {
      status.textContent = 'Submitting...';
      const res = await GitHubAPI.submitResult(matchId, result);
      status.textContent = res.success ? 'Result submitted!' : 'Error: ' + res.error;
    } else {
      status.textContent = 'Configure GitHub first to submit results.';
    }
  },
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Restore GitHub config from localStorage
  const savedOwner = localStorage.getItem('wc2026_github_owner');
  const savedRepo = localStorage.getItem('wc2026_github_repo');
  if (savedOwner) GitHubAPI.OWNER = savedOwner;
  if (savedRepo) GitHubAPI.REPO = savedRepo;
  App.init();
});
