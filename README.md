# FIFA World Cup 2026 - Prediction Competition

A fully client-side prediction game hosted entirely on GitHub.

## Quick Setup

1. **Fork or clone this repo**
2. **Enable GitHub Pages**: Settings → Pages → Deploy from `main` branch
3. **Create a Personal Access Token**: Settings → Developer settings → Fine-grained tokens
   - Scope: Only this repository
   - Permissions: Contents (Read and Write)
4. **Open your site** at `https://YOUR_USERNAME.github.io/wc2026-predictions/`
5. **Configure**: Go to Admin tab → enter your GitHub username, repo name, and token
6. **Share the URL** with your competition pool

## How It Works

- **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages
- **Backend**: JSON files in the `data/` directory, read/written via GitHub API
- **Auth**: A single Personal Access Token enables writes (stored in browser localStorage)
- **Data isolation**: Each competition pool stores data in `data/{pool_name}/` subdirectories

## Features

- Multiple independent competition pools (work, friends, family, etc.)
- All 48 teams, 12 groups, 108 matches
- Match score predictions + Man of the Match, First Goal Scorer, cards, BTS
- General tournament predictions (Golden Boot, Best Player, etc.)
- Auto-calculated leaderboard from submitted results
- Configurable timezone display
- Mobile-responsive design

## For Multiple Pools

Each pool gets its own subdirectory in `data/`. Data is completely isolated.
All participants share the same GitHub Pages URL but select their pool on login.

## Scoring

| Prediction | Points |
|------------|--------|
| Exact score | 10 |
| Correct goal difference | 5 |
| Correct outcome (W/D/L) | 3 |
| Man of the Match | 5 |
| First Goal Scorer | 3 |
| Total Cards (±1) | 2 |
| Both Teams Score | 2 |
| Top Scorer / Best Player | 15 each |
| Other general predictions | 8-10 each |

## Admin

One person acts as admin to enter actual match results via the Admin tab.
Results trigger automatic leaderboard recalculation for all players.
