// FIFA World Cup 2026 Match Data
// 48 teams, 12 groups of 4, 104 total matches

const SCORING = {
  exactScore: 10,
  correctDifference: 5,
  correctOutcome: 3,
  wrongOutcome: 0,
  manOfMatch: 5,
  firstGoalScorer: 3,
  totalCardsWithin1: 2,
  bothTeamsScore: 2,
  cleanSheet: 3,
  bestPlayerRating: 2,
  fairPlay: 3,
  bracketR32: 3,
  bracketR16: 5,
  bracketQF: 8,
  bracketSF: 12,
  bracketFinal: 20,
  groupWinner: 3,
  groupRunnerUp: 2,
  generalTopScorer: 15,
  generalFairPlayTeam: 10,
  generalMostCleanSheets: 10,
  generalBestGoalkeeper: 10,
  generalTotalYellowCards: 8,
  generalTotalRedCards: 8,
  generalFastestGoalTeam: 10,
  generalBestPlayer: 15,
  generalTotalGoals: 8,
};

const TIMEZONE_OFFSETS = {
  'ET': 0, 'CT': -1, 'MT': -2, 'PT': -3, 'GMT': 5, 'CET': 6, 'AST': 4
};

const TEAMS = {
  // Group A
  'MAR': { name: 'Morocco', flag: '🇲🇦', code: 'MAR', group: 'A', fifaRank: 14 },
  'USA': { name: 'USA', flag: '🇺🇸', code: 'USA', group: 'A', fifaRank: 11 },
  'SCO': { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO', group: 'A', fifaRank: 39 },
  'POR': { name: 'Portugal', flag: '🇵🇹', code: 'POR', group: 'A', fifaRank: 6 },
  // Group B
  'ARG': { name: 'Argentina', flag: '🇦🇷', code: 'ARG', group: 'B', fifaRank: 1 },
  'PER': { name: 'Peru', flag: '🇵🇪', code: 'PER', group: 'B', fifaRank: 32 },
  'UKR': { name: 'Ukraine', flag: '🇺🇦', code: 'UKR', group: 'B', fifaRank: 22 },
  'AUS': { name: 'Australia', flag: '🇦🇺', code: 'AUS', group: 'B', fifaRank: 24 },
  // Group C
  'MEX': { name: 'Mexico', flag: '🇲🇽', code: 'MEX', group: 'C', fifaRank: 15 },
  'ECU': { name: 'Ecuador', flag: '🇪🇨', code: 'ECU', group: 'C', fifaRank: 28 },
  'SEN': { name: 'Senegal', flag: '🇸🇳', code: 'SEN', group: 'C', fifaRank: 20 },
  'BOL': { name: 'Bolivia', flag: '🇧🇴', code: 'BOL', group: 'C', fifaRank: 82 },
  // Group D
  'FRA': { name: 'France', flag: '🇫🇷', code: 'FRA', group: 'D', fifaRank: 2 },
  'COL': { name: 'Colombia', flag: '🇨🇴', code: 'COL', group: 'D', fifaRank: 12 },
  'PAN': { name: 'Panama', flag: '🇵🇦', code: 'PAN', group: 'D', fifaRank: 43 },
  'IDN': { name: 'Indonesia', flag: '🇮🇩', code: 'IDN', group: 'D', fifaRank: 89 },
  // Group E
  'BRA': { name: 'Brazil', flag: '🇧🇷', code: 'BRA', group: 'E', fifaRank: 5 },
  'JPN': { name: 'Japan', flag: '🇯🇵', code: 'JPN', group: 'E', fifaRank: 17 },
  'TUR': { name: 'Turkey', flag: '🇹🇷', code: 'TUR', group: 'E', fifaRank: 25 },
  'NZL': { name: 'New Zealand', flag: '🇳🇿', code: 'NZL', group: 'E', fifaRank: 93 },
  // Group F
  'ENG': { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', group: 'F', fifaRank: 4 },
  'DEN': { name: 'Denmark', flag: '🇩🇰', code: 'DEN', group: 'F', fifaRank: 18 },
  'PAR': { name: 'Paraguay', flag: '🇵🇾', code: 'PAR', group: 'F', fifaRank: 56 },
  'SAU': { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SAU', group: 'F', fifaRank: 60 },
  // Group G
  'ESP': { name: 'Spain', flag: '🇪🇸', code: 'ESP', group: 'G', fifaRank: 3 },
  'ALB': { name: 'Albania', flag: '🇦🇱', code: 'ALB', group: 'G', fifaRank: 52 },
  'SLO': { name: 'Slovenia', flag: '🇸🇮', code: 'SLO', group: 'G', fifaRank: 55 },
  'CAN': { name: 'Canada', flag: '🇨🇦', code: 'CAN', group: 'G', fifaRank: 41 },
  // Group H
  'GER': { name: 'Germany', flag: '🇩🇪', code: 'GER', group: 'H', fifaRank: 8 },
  'URU': { name: 'Uruguay', flag: '🇺🇾', code: 'URU', group: 'H', fifaRank: 13 },
  'SVK': { name: 'Slovakia', flag: '🇸🇰', code: 'SVK', group: 'H', fifaRank: 45 },
  'CAM': { name: 'Cameroon', flag: '🇨🇲', code: 'CAM', group: 'H', fifaRank: 47 },
  // Group I
  'NED': { name: 'Netherlands', flag: '🇳🇱', code: 'NED', group: 'I', fifaRank: 7 },
  'KOR': { name: 'South Korea', flag: '🇰🇷', code: 'KOR', group: 'I', fifaRank: 23 },
  'KEN': { name: 'Kenya', flag: '🇰🇪', code: 'KEN', group: 'I', fifaRank: 96 },
  'TAN': { name: 'Tanzania', flag: '🇹🇿', code: 'TAN', group: 'I', fifaRank: 103 },
  // Group J
  'BEL': { name: 'Belgium', flag: '🇧🇪', code: 'BEL', group: 'J', fifaRank: 9 },
  'CRC': { name: 'Costa Rica', flag: '🇨🇷', code: 'CRC', group: 'J', fifaRank: 48 },
  'WAL': { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'WAL', group: 'J', fifaRank: 27 },
  'NGA': { name: 'Nigeria', flag: '🇳🇬', code: 'NGA', group: 'J', fifaRank: 36 },
  // Group K
  'ITA': { name: 'Italy', flag: '🇮🇹', code: 'ITA', group: 'K', fifaRank: 10 },
  'IRN': { name: 'Iran', flag: '🇮🇷', code: 'IRN', group: 'K', fifaRank: 21 },
  'SRB': { name: 'Serbia', flag: '🇷🇸', code: 'SRB', group: 'K', fifaRank: 33 },
  'CHL': { name: 'Chile', flag: '🇨🇱', code: 'CHL', group: 'K', fifaRank: 35 },
  // Group L
  'CRO': { name: 'Croatia', flag: '🇭🇷', code: 'CRO', group: 'L', fifaRank: 16 },
  'EGY': { name: 'Egypt', flag: '🇪🇬', code: 'EGY', group: 'L', fifaRank: 34 },
  'JAM': { name: 'Jamaica', flag: '🇯🇲', code: 'JAM', group: 'L', fifaRank: 61 },
  'QAT': { name: 'Qatar', flag: '🇶🇦', code: 'QAT', group: 'L', fifaRank: 37 },
};

const GROUPS = {
  A: ['MAR', 'USA', 'SCO', 'POR'],
  B: ['ARG', 'PER', 'UKR', 'AUS'],
  C: ['MEX', 'ECU', 'SEN', 'BOL'],
  D: ['FRA', 'COL', 'PAN', 'IDN'],
  E: ['BRA', 'JPN', 'TUR', 'NZL'],
  F: ['ENG', 'DEN', 'PAR', 'SAU'],
  G: ['ESP', 'ALB', 'SLO', 'CAN'],
  H: ['GER', 'URU', 'SVK', 'CAM'],
  I: ['NED', 'KOR', 'KEN', 'TAN'],
  J: ['BEL', 'CRC', 'WAL', 'NGA'],
  K: ['ITA', 'IRN', 'SRB', 'CHL'],
  L: ['CRO', 'EGY', 'JAM', 'QAT'],
};

// All times in ET (Eastern Time) - converted by app based on user timezone
const GROUP_MATCHES = [
  // Group A
  { id: 'M01', group: 'A', home: 'MAR', away: 'SCO', date: '2026-06-11', time: '12:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M02', group: 'A', home: 'USA', away: 'POR', date: '2026-06-11', time: '18:00', venue: 'SoFi Stadium, LA' },
  { id: 'M03', group: 'A', home: 'POR', away: 'SCO', date: '2026-06-16', time: '15:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M04', group: 'A', home: 'USA', away: 'MAR', date: '2026-06-16', time: '21:00', venue: 'SoFi Stadium, LA' },
  { id: 'M05', group: 'A', home: 'SCO', away: 'USA', date: '2026-06-21', time: '18:00', venue: 'Lincoln Financial, Philadelphia' },
  { id: 'M06', group: 'A', home: 'POR', away: 'MAR', date: '2026-06-21', time: '18:00', venue: 'MetLife Stadium, NJ' },
  // Group B
  { id: 'M07', group: 'B', home: 'ARG', away: 'PER', date: '2026-06-12', time: '12:00', venue: 'Hard Rock Stadium, Miami' },
  { id: 'M08', group: 'B', home: 'UKR', away: 'AUS', date: '2026-06-12', time: '15:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'M09', group: 'B', home: 'ARG', away: 'AUS', date: '2026-06-17', time: '18:00', venue: 'Hard Rock Stadium, Miami' },
  { id: 'M10', group: 'B', home: 'UKR', away: 'PER', date: '2026-06-17', time: '15:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'M11', group: 'B', home: 'AUS', away: 'UKR', date: '2026-06-22', time: '15:00', venue: 'Mercedes-Benz, Atlanta' },
  { id: 'M12', group: 'B', home: 'PER', away: 'ARG', date: '2026-06-22', time: '15:00', venue: 'Hard Rock Stadium, Miami' },
  // Group C
  { id: 'M13', group: 'C', home: 'MEX', away: 'SEN', date: '2026-06-12', time: '18:00', venue: 'Estadio Azteca, Mexico City' },
  { id: 'M14', group: 'C', home: 'ECU', away: 'BOL', date: '2026-06-12', time: '21:00', venue: 'Rose Bowl, LA' },
  { id: 'M15', group: 'C', home: 'MEX', away: 'BOL', date: '2026-06-17', time: '12:00', venue: 'Estadio Azteca, Mexico City' },
  { id: 'M16', group: 'C', home: 'SEN', away: 'ECU', date: '2026-06-17', time: '21:00', venue: 'Lumen Field, Seattle' },
  { id: 'M17', group: 'C', home: 'BOL', away: 'MEX', date: '2026-06-22', time: '18:00', venue: 'Rose Bowl, LA' },
  { id: 'M18', group: 'C', home: 'ECU', away: 'SEN', date: '2026-06-22', time: '18:00', venue: 'Lumen Field, Seattle' },
  // Group D
  { id: 'M19', group: 'D', home: 'FRA', away: 'IDN', date: '2026-06-13', time: '12:00', venue: 'Mercedes-Benz, Atlanta' },
  { id: 'M20', group: 'D', home: 'COL', away: 'PAN', date: '2026-06-13', time: '15:00', venue: 'NRG Stadium, Houston' },
  { id: 'M21', group: 'D', home: 'FRA', away: 'COL', date: '2026-06-18', time: '18:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M22', group: 'D', home: 'PAN', away: 'IDN', date: '2026-06-18', time: '12:00', venue: 'NRG Stadium, Houston' },
  { id: 'M23', group: 'D', home: 'IDN', away: 'FRA', date: '2026-06-23', time: '18:00', venue: 'Mercedes-Benz, Atlanta' },
  { id: 'M24', group: 'D', home: 'PAN', away: 'COL', date: '2026-06-23', time: '18:00', venue: 'NRG Stadium, Houston' },
  // Group E
  { id: 'M25', group: 'E', home: 'BRA', away: 'NZL', date: '2026-06-13', time: '18:00', venue: 'Rose Bowl, LA' },
  { id: 'M26', group: 'E', home: 'JPN', away: 'TUR', date: '2026-06-13', time: '21:00', venue: 'Levi Stadium, San Francisco' },
  { id: 'M27', group: 'E', home: 'BRA', away: 'JPN', date: '2026-06-18', time: '21:00', venue: 'Rose Bowl, LA' },
  { id: 'M28', group: 'E', home: 'TUR', away: 'NZL', date: '2026-06-18', time: '15:00', venue: 'Levi Stadium, San Francisco' },
  { id: 'M29', group: 'E', home: 'NZL', away: 'BRA', date: '2026-06-23', time: '21:00', venue: 'Rose Bowl, LA' },
  { id: 'M30', group: 'E', home: 'TUR', away: 'JPN', date: '2026-06-23', time: '21:00', venue: 'Levi Stadium, San Francisco' },
  // Group F
  { id: 'M31', group: 'F', home: 'ENG', away: 'SAU', date: '2026-06-14', time: '12:00', venue: 'Lincoln Financial, Philadelphia' },
  { id: 'M32', group: 'F', home: 'DEN', away: 'PAR', date: '2026-06-14', time: '15:00', venue: 'BMO Field, Toronto' },
  { id: 'M33', group: 'F', home: 'ENG', away: 'DEN', date: '2026-06-19', time: '18:00', venue: 'Lincoln Financial, Philadelphia' },
  { id: 'M34', group: 'F', home: 'PAR', away: 'SAU', date: '2026-06-19', time: '12:00', venue: 'BMO Field, Toronto' },
  { id: 'M35', group: 'F', home: 'SAU', away: 'ENG', date: '2026-06-24', time: '15:00', venue: 'Lincoln Financial, Philadelphia' },
  { id: 'M36', group: 'F', home: 'PAR', away: 'DEN', date: '2026-06-24', time: '15:00', venue: 'BMO Field, Toronto' },
  // Group G
  { id: 'M37', group: 'G', home: 'ESP', away: 'CAN', date: '2026-06-14', time: '18:00', venue: 'BC Place, Vancouver' },
  { id: 'M38', group: 'G', home: 'ALB', away: 'SLO', date: '2026-06-14', time: '21:00', venue: 'BMO Field, Toronto' },
  { id: 'M39', group: 'G', home: 'ESP', away: 'ALB', date: '2026-06-19', time: '21:00', venue: 'BC Place, Vancouver' },
  { id: 'M40', group: 'G', home: 'SLO', away: 'CAN', date: '2026-06-19', time: '15:00', venue: 'BMO Field, Toronto' },
  { id: 'M41', group: 'G', home: 'CAN', away: 'ESP', date: '2026-06-24', time: '18:00', venue: 'BC Place, Vancouver' },
  { id: 'M42', group: 'G', home: 'SLO', away: 'ALB', date: '2026-06-24', time: '18:00', venue: 'BMO Field, Toronto' },
  // Group H
  { id: 'M43', group: 'H', home: 'GER', away: 'CAM', date: '2026-06-15', time: '12:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M44', group: 'H', home: 'URU', away: 'SVK', date: '2026-06-15', time: '15:00', venue: 'Hard Rock Stadium, Miami' },
  { id: 'M45', group: 'H', home: 'GER', away: 'URU', date: '2026-06-20', time: '18:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M46', group: 'H', home: 'SVK', away: 'CAM', date: '2026-06-20', time: '12:00', venue: 'Hard Rock Stadium, Miami' },
  { id: 'M47', group: 'H', home: 'CAM', away: 'GER', date: '2026-06-25', time: '15:00', venue: 'MetLife Stadium, NJ' },
  { id: 'M48', group: 'H', home: 'SVK', away: 'URU', date: '2026-06-25', time: '15:00', venue: 'Hard Rock Stadium, Miami' },
  // Group I
  { id: 'M49', group: 'I', home: 'NED', away: 'TAN', date: '2026-06-15', time: '18:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M50', group: 'I', home: 'KOR', away: 'KEN', date: '2026-06-15', time: '21:00', venue: 'Lumen Field, Seattle' },
  { id: 'M51', group: 'I', home: 'NED', away: 'KOR', date: '2026-06-20', time: '21:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M52', group: 'I', home: 'KEN', away: 'TAN', date: '2026-06-20', time: '15:00', venue: 'Lumen Field, Seattle' },
  { id: 'M53', group: 'I', home: 'TAN', away: 'NED', date: '2026-06-25', time: '18:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M54', group: 'I', home: 'KEN', away: 'KOR', date: '2026-06-25', time: '18:00', venue: 'Lumen Field, Seattle' },
  // Group J
  { id: 'M55', group: 'J', home: 'BEL', away: 'NGA', date: '2026-06-16', time: '12:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M56', group: 'J', home: 'CRC', away: 'WAL', date: '2026-06-16', time: '18:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'M57', group: 'J', home: 'BEL', away: 'WAL', date: '2026-06-21', time: '12:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M58', group: 'J', home: 'NGA', away: 'CRC', date: '2026-06-21', time: '15:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'M59', group: 'J', home: 'NGA', away: 'BEL', date: '2026-06-26', time: '15:00', venue: 'Gillette Stadium, Boston' },
  { id: 'M60', group: 'J', home: 'WAL', away: 'CRC', date: '2026-06-26', time: '15:00', venue: 'AT&T Stadium, Dallas' },
  // Group K
  { id: 'M61', group: 'K', home: 'ITA', away: 'CHL', date: '2026-06-16', time: '21:00', venue: 'SoFi Stadium, LA' },
  { id: 'M62', group: 'K', home: 'IRN', away: 'SRB', date: '2026-06-17', time: '12:00', venue: 'Estadio Azteca, Mexico City' },
  { id: 'M63', group: 'K', home: 'ITA', away: 'IRN', date: '2026-06-21', time: '21:00', venue: 'SoFi Stadium, LA' },
  { id: 'M64', group: 'K', home: 'SRB', away: 'CHL', date: '2026-06-22', time: '12:00', venue: 'Estadio Azteca, Mexico City' },
  { id: 'M65', group: 'K', home: 'CHL', away: 'ITA', date: '2026-06-26', time: '18:00', venue: 'SoFi Stadium, LA' },
  { id: 'M66', group: 'K', home: 'SRB', away: 'IRN', date: '2026-06-26', time: '18:00', venue: 'Estadio Azteca, Mexico City' },
  // Group L
  { id: 'M67', group: 'L', home: 'CRO', away: 'QAT', date: '2026-06-17', time: '18:00', venue: 'NRG Stadium, Houston' },
  { id: 'M68', group: 'L', home: 'EGY', away: 'JAM', date: '2026-06-17', time: '21:00', venue: 'Mercedes-Benz, Atlanta' },
  { id: 'M69', group: 'L', home: 'CRO', away: 'EGY', date: '2026-06-22', time: '21:00', venue: 'NRG Stadium, Houston' },
  { id: 'M70', group: 'L', home: 'JAM', away: 'QAT', date: '2026-06-22', time: '12:00', venue: 'Mercedes-Benz, Atlanta' },
  { id: 'M71', group: 'L', home: 'QAT', away: 'CRO', date: '2026-06-27', time: '15:00', venue: 'NRG Stadium, Houston' },
  { id: 'M72', group: 'L', home: 'JAM', away: 'EGY', date: '2026-06-27', time: '15:00', venue: 'Mercedes-Benz, Atlanta' },
];

const KNOCKOUT_MATCHES = [
  // Round of 32 (matches 73-104 will be filled as groups complete)
  { id: 'M73', round: 'R32', home: '1A', away: '3C/D/E', date: '2026-06-28', time: '12:00', venue: 'TBD' },
  { id: 'M74', round: 'R32', home: '2A', away: '2C', date: '2026-06-28', time: '15:00', venue: 'TBD' },
  { id: 'M75', round: 'R32', home: '1B', away: '3A/F/G', date: '2026-06-28', time: '18:00', venue: 'TBD' },
  { id: 'M76', round: 'R32', home: '2B', away: '2D', date: '2026-06-28', time: '21:00', venue: 'TBD' },
  { id: 'M77', round: 'R32', home: '1C', away: '3B/H/I', date: '2026-06-29', time: '12:00', venue: 'TBD' },
  { id: 'M78', round: 'R32', home: '2E', away: '2G', date: '2026-06-29', time: '15:00', venue: 'TBD' },
  { id: 'M79', round: 'R32', home: '1D', away: '3J/K/L', date: '2026-06-29', time: '18:00', venue: 'TBD' },
  { id: 'M80', round: 'R32', home: '2F', away: '2H', date: '2026-06-29', time: '21:00', venue: 'TBD' },
  { id: 'M81', round: 'R32', home: '1E', away: '3A/B/C', date: '2026-06-30', time: '12:00', venue: 'TBD' },
  { id: 'M82', round: 'R32', home: '1F', away: '3G/H/I', date: '2026-06-30', time: '15:00', venue: 'TBD' },
  { id: 'M83', round: 'R32', home: '1G', away: '3D/E/F', date: '2026-06-30', time: '18:00', venue: 'TBD' },
  { id: 'M84', round: 'R32', home: '2I', away: '2K', date: '2026-06-30', time: '21:00', venue: 'TBD' },
  { id: 'M85', round: 'R32', home: '1H', away: '3J/K/L', date: '2026-07-01', time: '12:00', venue: 'TBD' },
  { id: 'M86', round: 'R32', home: '2J', away: '2L', date: '2026-07-01', time: '15:00', venue: 'TBD' },
  { id: 'M87', round: 'R32', home: '1I', away: '3A/B/F', date: '2026-07-01', time: '18:00', venue: 'TBD' },
  { id: 'M88', round: 'R32', home: '1J', away: '3C/D/E', date: '2026-07-01', time: '21:00', venue: 'TBD' },
  { id: 'M89', round: 'R32', home: '1K', away: '3G/H/I', date: '2026-07-02', time: '12:00', venue: 'TBD' },
  { id: 'M90', round: 'R32', home: '1L', away: '3J/K/L', date: '2026-07-02', time: '15:00', venue: 'TBD' },
  { id: 'M91', round: 'R32', home: '2A', away: '2B', date: '2026-07-02', time: '18:00', venue: 'TBD' },
  { id: 'M92', round: 'R32', home: '2C', away: '2F', date: '2026-07-02', time: '21:00', venue: 'TBD' },
  // Round of 16
  { id: 'M93', round: 'R16', home: 'W73', away: 'W74', date: '2026-07-04', time: '12:00', venue: 'TBD' },
  { id: 'M94', round: 'R16', home: 'W75', away: 'W76', date: '2026-07-04', time: '15:00', venue: 'TBD' },
  { id: 'M95', round: 'R16', home: 'W77', away: 'W78', date: '2026-07-04', time: '18:00', venue: 'TBD' },
  { id: 'M96', round: 'R16', home: 'W79', away: 'W80', date: '2026-07-04', time: '21:00', venue: 'TBD' },
  { id: 'M97', round: 'R16', home: 'W81', away: 'W82', date: '2026-07-05', time: '12:00', venue: 'TBD' },
  { id: 'M98', round: 'R16', home: 'W83', away: 'W84', date: '2026-07-05', time: '15:00', venue: 'TBD' },
  { id: 'M99', round: 'R16', home: 'W85', away: 'W86', date: '2026-07-05', time: '18:00', venue: 'TBD' },
  { id: 'M100', round: 'R16', home: 'W87', away: 'W88', date: '2026-07-05', time: '21:00', venue: 'TBD' },
  // Quarter Finals
  { id: 'M101', round: 'QF', home: 'W93', away: 'W94', date: '2026-07-09', time: '15:00', venue: 'TBD' },
  { id: 'M102', round: 'QF', home: 'W95', away: 'W96', date: '2026-07-09', time: '21:00', venue: 'TBD' },
  { id: 'M103', round: 'QF', home: 'W97', away: 'W98', date: '2026-07-10', time: '15:00', venue: 'TBD' },
  { id: 'M104', round: 'QF', home: 'W99', away: 'W100', date: '2026-07-10', time: '21:00', venue: 'TBD' },
  // Semi Finals
  { id: 'M105', round: 'SF', home: 'W101', away: 'W102', date: '2026-07-14', time: '18:00', venue: 'TBD' },
  { id: 'M106', round: 'SF', home: 'W103', away: 'W104', date: '2026-07-15', time: '18:00', venue: 'TBD' },
  // Third Place
  { id: 'M107', round: '3rd', home: 'L105', away: 'L106', date: '2026-07-18', time: '15:00', venue: 'TBD' },
  // Final
  { id: 'M108', round: 'Final', home: 'W105', away: 'W106', date: '2026-07-19', time: '16:00', venue: 'MetLife Stadium, NJ' },
];

const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];
