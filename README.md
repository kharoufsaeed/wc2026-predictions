# FIFA World Cup 2026 - Prediction Competition

A fully client-side prediction game hosted on GitHub Pages (works with GitHub Enterprise).

## Quick Setup

1. **Fork or clone this repo**
2. **Enable GitHub Pages**: Settings → Pages → Deploy from `main` branch
3. **Create a Personal Access Token**: Settings → Developer settings → Fine-grained tokens
   - Scope: Only this repository
   - Permissions: Contents (Read and Write)
4. **Open your site** at `https://YOUR_ORG.github.io/wc2026-predictions/`
5. **Configure**: Login as admin → Admin tab → enter your GitHub username, repo name, and token
6. **Share the URL** with your competition pool

## How It Works

- **Frontend**: Static HTML/CSS/JS single-page app hosted on GitHub Pages
- **Backend**: JSON files in the `data/` directory, read/written via GitHub Contents API
- **Auth**: A Personal Access Token enables writes (stored in browser localStorage)
- **Data isolation**: Each competition pool stores data in `data/{pool_name}/` subdirectories
- **Admin**: Protected with username `admin` + password (hardcoded in app.js)

## Features

- Multiple independent competition pools (work, friends, family, etc.)
- All 48 teams, 12 groups, 108 matches (group + knockout stage)
- Inline match predictions — click any match card to expand the prediction form
- Predictions include: score, Man of the Match, First Goal Scorer, cards, Both Teams Score
- General tournament predictions (Golden Boot, Golden Ball, Golden Glove, Fair Play, etc.)
- Auto-calculated leaderboard from admin-submitted results
- Admin can view leaderboard per pool
- Unique usernames per pool
- Group-stage filters (by group) and knockout filter
- 3-column match grid layout
- Configurable timezone display (ET/CT/MT/PT/GMT/CET/AST)
- Player database with 1250+ players for dropdown selection
- Country flags via flag-icons CSS library
- Mobile-responsive design
- WC2026-themed color scheme (purple/red/lime extracted from official banner)

## Architecture

```
index.html      — SPA structure (header, nav, tabs, login)
style.css       — Responsive styling, WC2026 color theme
app.js          — Core application logic, tab rendering, scoring
matches.js      — Match schedule data (groups, knockout, teams, venues)
players.js      — Player database (1250+ players by position)
github-api.js   — GitHub Contents API wrapper + localStorage helpers
pictures/       — Banner image, WC2026 emblem
data/           — JSON data files per pool (created via API)
```

## For Multiple Pools

Each pool gets its own subdirectory in `data/`. Data is completely isolated.
All participants share the same GitHub Pages URL but select their pool on login.

## Scoring

### Match Predictions

| Prediction | Points |
|------------|--------|
| Exact score | 10 |
| Correct goal difference | 5 |
| Correct outcome (W/D/L) | 3 |
| Man of the Match | 5 |
| First Goal Scorer | 3 |
| Total Cards (within 1) | 2 |
| Both Teams Score | 2 |

### General Predictions

| Prediction | Points |
|------------|--------|
| Top Scorer (Golden Boot) | 15 |
| Best Player (Golden Ball) | 15 |
| Best Goalkeeper (Golden Glove) | 12 |
| Fair Play Team | 10 |
| Most Clean Sheets | 10 |
| Fastest Goal Team | 8 |
| Total Yellow Cards (within 10) | 8 |
| Total Red Cards (within 3) | 8 |
| Total Goals (within 10) | 10 |

### Bracket Predictions

| Prediction | Points |
|------------|--------|
| Group Winner | 5 |
| Group Runner-Up | 3 |
| Round of 32 | 3 |
| Round of 16 | 5 |
| Quarter Final | 8 |
| Semi Final | 12 |
| Final Winner | 20 |

## Admin

Login as `admin` with the configured password to:
- Enter actual match results (triggers leaderboard recalculation)
- Enter general prediction results (Golden Boot winner, etc.)
- Configure GitHub API connection
- View leaderboard for any pool

## License

Internal use only.
