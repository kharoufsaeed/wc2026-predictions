// FIFA World Cup 2026 - Match Data (Official Draw & Schedule)
// 48 teams, 12 groups of 4, 104 total matches
// Tournament: June 11 - July 19, 2026 (USA / Canada / Mexico)

const TEAMS = {
  // Group A
  'MEX': { name: 'Mexico', flag: 'mx', code: 'MEX', group: 'A' },
  'RSA': { name: 'South Africa', flag: 'za', code: 'RSA', group: 'A' },
  'KOR': { name: 'South Korea', flag: 'kr', code: 'KOR', group: 'A' },
  'CZE': { name: 'Czechia', flag: 'cz', code: 'CZE', group: 'A' },
  // Group B
  'CAN': { name: 'Canada', flag: 'ca', code: 'CAN', group: 'B' },
  'BIH': { name: 'Bosnia & Herzegovina', flag: 'ba', code: 'BIH', group: 'B' },
  'QAT': { name: 'Qatar', flag: 'qa', code: 'QAT', group: 'B' },
  'SUI': { name: 'Switzerland', flag: 'ch', code: 'SUI', group: 'B' },
  // Group C
  'BRA': { name: 'Brazil', flag: 'br', code: 'BRA', group: 'C' },
  'MAR': { name: 'Morocco', flag: 'ma', code: 'MAR', group: 'C' },
  'HAI': { name: 'Haiti', flag: 'ht', code: 'HAI', group: 'C' },
  'SCO': { name: 'Scotland', flag: 'gb-sct', code: 'SCO', group: 'C' },
  // Group D
  'USA': { name: 'United States', flag: 'us', code: 'USA', group: 'D' },
  'PAR': { name: 'Paraguay', flag: 'py', code: 'PAR', group: 'D' },
  'AUS': { name: 'Australia', flag: 'au', code: 'AUS', group: 'D' },
  'TUR': { name: 'Turkey', flag: 'tr', code: 'TUR', group: 'D' },
  // Group E
  'GER': { name: 'Germany', flag: 'de', code: 'GER', group: 'E' },
  'CUR': { name: 'Curacao', flag: 'cw', code: 'CUR', group: 'E' },
  'CIV': { name: 'Ivory Coast', flag: 'ci', code: 'CIV', group: 'E' },
  'ECU': { name: 'Ecuador', flag: 'ec', code: 'ECU', group: 'E' },
  // Group F
  'NED': { name: 'Netherlands', flag: 'nl', code: 'NED', group: 'F' },
  'JPN': { name: 'Japan', flag: 'jp', code: 'JPN', group: 'F' },
  'SWE': { name: 'Sweden', flag: 'se', code: 'SWE', group: 'F' },
  'TUN': { name: 'Tunisia', flag: 'tn', code: 'TUN', group: 'F' },
  // Group G
  'BEL': { name: 'Belgium', flag: 'be', code: 'BEL', group: 'G' },
  'EGY': { name: 'Egypt', flag: 'eg', code: 'EGY', group: 'G' },
  'IRN': { name: 'Iran', flag: 'ir', code: 'IRN', group: 'G' },
  'NZL': { name: 'New Zealand', flag: 'nz', code: 'NZL', group: 'G' },
  // Group H
  'ESP': { name: 'Spain', flag: 'es', code: 'ESP', group: 'H' },
  'CPV': { name: 'Cape Verde', flag: 'cv', code: 'CPV', group: 'H' },
  'KSA': { name: 'Saudi Arabia', flag: 'sa', code: 'KSA', group: 'H' },
  'URU': { name: 'Uruguay', flag: 'uy', code: 'URU', group: 'H' },
  // Group I
  'FRA': { name: 'France', flag: 'fr', code: 'FRA', group: 'I' },
  'SEN': { name: 'Senegal', flag: 'sn', code: 'SEN', group: 'I' },
  'IRQ': { name: 'Iraq', flag: 'iq', code: 'IRQ', group: 'I' },
  'NOR': { name: 'Norway', flag: 'no', code: 'NOR', group: 'I' },
  // Group J
  'ARG': { name: 'Argentina', flag: 'ar', code: 'ARG', group: 'J' },
  'ALG': { name: 'Algeria', flag: 'dz', code: 'ALG', group: 'J' },
  'AUT': { name: 'Austria', flag: 'at', code: 'AUT', group: 'J' },
  'JOR': { name: 'Jordan', flag: 'jo', code: 'JOR', group: 'J' },
  // Group K
  'POR': { name: 'Portugal', flag: 'pt', code: 'POR', group: 'K' },
  'COD': { name: 'DR Congo', flag: 'cd', code: 'COD', group: 'K' },
  'UZB': { name: 'Uzbekistan', flag: 'uz', code: 'UZB', group: 'K' },
  'COL': { name: 'Colombia', flag: 'co', code: 'COL', group: 'K' },
  // Group L
  'ENG': { name: 'England', flag: 'gb-eng', code: 'ENG', group: 'L' },
  'CRO': { name: 'Croatia', flag: 'hr', code: 'CRO', group: 'L' },
  'GHA': { name: 'Ghana', flag: 'gh', code: 'GHA', group: 'L' },
  'PAN': { name: 'Panama', flag: 'pa', code: 'PAN', group: 'L' },
};

const VENUES = {
  'Estadio Banorte': 'Estadio Banorte, Mexico City',
  'Estadio Akron': 'Estadio Akron, Guadalajara',
  'Estadio BBVA': 'Estadio BBVA, Guadalupe (Monterrey)',
  'BMO Field': 'BMO Field, Toronto',
  'BC Place': 'BC Place, Vancouver',
  'MetLife': 'MetLife Stadium, East Rutherford, NJ',
  'SoFi': 'SoFi Stadium, Inglewood, CA',
  'AT&T': 'AT&T Stadium, Arlington, TX',
  'Hard Rock': 'Hard Rock Stadium, Miami Gardens, FL',
  'Lumen': 'Lumen Field, Seattle, WA',
  'Gillette': 'Gillette Stadium, Foxborough, MA',
  'NRG': 'NRG Stadium, Houston, TX',
  'Mercedes-Benz': 'Mercedes-Benz Stadium, Atlanta, GA',
  'Lincoln Financial': 'Lincoln Financial Field, Philadelphia, PA',
  'Levi\'s': 'Levi\'s Stadium, Santa Clara, CA',
  'GEHA Arrowhead': 'GEHA Field at Arrowhead Stadium, Kansas City, MO',
};

// Group Stage Matches - 72 total (6 per group x 12 groups)
// All times in ET
const GROUP_MATCHES = [
  // === MATCHDAY 1 ===
  { id: 'M01', home: 'MEX', away: 'RSA', group: 'A', date: '2026-06-11', time: '15:00', venue: 'Estadio Banorte', matchday: 1 },
  { id: 'M02', home: 'KOR', away: 'CZE', group: 'A', date: '2026-06-11', time: '22:00', venue: 'Estadio Akron', matchday: 1 },
  { id: 'M03', home: 'CAN', away: 'BIH', group: 'B', date: '2026-06-12', time: '15:00', venue: 'BMO Field', matchday: 1 },
  { id: 'M04', home: 'USA', away: 'PAR', group: 'D', date: '2026-06-12', time: '21:00', venue: 'SoFi', matchday: 1 },
  { id: 'M05', home: 'QAT', away: 'SUI', group: 'B', date: '2026-06-13', time: '15:00', venue: 'Levi\'s', matchday: 1 },
  { id: 'M06', home: 'BRA', away: 'MAR', group: 'C', date: '2026-06-13', time: '18:00', venue: 'MetLife', matchday: 1 },
  { id: 'M07', home: 'HAI', away: 'SCO', group: 'C', date: '2026-06-13', time: '21:00', venue: 'Gillette', matchday: 1 },
  { id: 'M08', home: 'AUS', away: 'TUR', group: 'D', date: '2026-06-14', time: '00:00', venue: 'BC Place', matchday: 1 },
  { id: 'M09', home: 'GER', away: 'CUR', group: 'E', date: '2026-06-14', time: '13:00', venue: 'NRG', matchday: 1 },
  { id: 'M10', home: 'NED', away: 'JPN', group: 'F', date: '2026-06-14', time: '16:00', venue: 'AT&T', matchday: 1 },
  { id: 'M11', home: 'CIV', away: 'ECU', group: 'E', date: '2026-06-14', time: '19:00', venue: 'Lincoln Financial', matchday: 1 },
  { id: 'M12', home: 'SWE', away: 'TUN', group: 'F', date: '2026-06-14', time: '22:00', venue: 'Estadio BBVA', matchday: 1 },
  { id: 'M13', home: 'ESP', away: 'CPV', group: 'H', date: '2026-06-15', time: '12:00', venue: 'Mercedes-Benz', matchday: 1 },
  { id: 'M14', home: 'BEL', away: 'EGY', group: 'G', date: '2026-06-15', time: '15:00', venue: 'Lumen', matchday: 1 },
  { id: 'M15', home: 'KSA', away: 'URU', group: 'H', date: '2026-06-15', time: '18:00', venue: 'Hard Rock', matchday: 1 },
  { id: 'M16', home: 'IRN', away: 'NZL', group: 'G', date: '2026-06-15', time: '21:00', venue: 'SoFi', matchday: 1 },
  { id: 'M17', home: 'FRA', away: 'SEN', group: 'I', date: '2026-06-16', time: '15:00', venue: 'MetLife', matchday: 1 },
  { id: 'M18', home: 'IRQ', away: 'NOR', group: 'I', date: '2026-06-16', time: '18:00', venue: 'Gillette', matchday: 1 },
  { id: 'M19', home: 'ARG', away: 'ALG', group: 'J', date: '2026-06-16', time: '21:00', venue: 'GEHA Arrowhead', matchday: 1 },
  { id: 'M20', home: 'AUT', away: 'JOR', group: 'J', date: '2026-06-17', time: '00:00', venue: 'Levi\'s', matchday: 1 },
  { id: 'M21', home: 'POR', away: 'COD', group: 'K', date: '2026-06-17', time: '13:00', venue: 'NRG', matchday: 1 },
  { id: 'M22', home: 'ENG', away: 'CRO', group: 'L', date: '2026-06-17', time: '16:00', venue: 'AT&T', matchday: 1 },
  { id: 'M23', home: 'GHA', away: 'PAN', group: 'L', date: '2026-06-17', time: '19:00', venue: 'BMO Field', matchday: 1 },
  { id: 'M24', home: 'UZB', away: 'COL', group: 'K', date: '2026-06-17', time: '22:00', venue: 'Estadio Banorte', matchday: 1 },

  // === MATCHDAY 2 ===
  { id: 'M25', home: 'CZE', away: 'RSA', group: 'A', date: '2026-06-18', time: '12:00', venue: 'Mercedes-Benz', matchday: 2 },
  { id: 'M26', home: 'MEX', away: 'KOR', group: 'A', date: '2026-06-18', time: '21:00', venue: 'Estadio Akron', matchday: 2 },
  { id: 'M27', home: 'SUI', away: 'BIH', group: 'B', date: '2026-06-18', time: '15:00', venue: 'SoFi', matchday: 2 },
  { id: 'M28', home: 'CAN', away: 'QAT', group: 'B', date: '2026-06-18', time: '18:00', venue: 'BC Place', matchday: 2 },
  { id: 'M29', home: 'USA', away: 'AUS', group: 'D', date: '2026-06-19', time: '15:00', venue: 'Lumen', matchday: 2 },
  { id: 'M30', home: 'SCO', away: 'MAR', group: 'C', date: '2026-06-19', time: '18:00', venue: 'Gillette', matchday: 2 },
  { id: 'M31', home: 'BRA', away: 'HAI', group: 'C', date: '2026-06-19', time: '20:30', venue: 'Lincoln Financial', matchday: 2 },
  { id: 'M32', home: 'TUR', away: 'PAR', group: 'D', date: '2026-06-19', time: '23:00', venue: 'Levi\'s', matchday: 2 },
  { id: 'M33', home: 'NED', away: 'SWE', group: 'F', date: '2026-06-20', time: '13:00', venue: 'NRG', matchday: 2 },
  { id: 'M34', home: 'GER', away: 'CIV', group: 'E', date: '2026-06-20', time: '16:00', venue: 'BMO Field', matchday: 2 },
  { id: 'M35', home: 'ECU', away: 'CUR', group: 'E', date: '2026-06-20', time: '20:00', venue: 'GEHA Arrowhead', matchday: 2 },
  { id: 'M36', home: 'TUN', away: 'JPN', group: 'F', date: '2026-06-21', time: '00:00', venue: 'Estadio BBVA', matchday: 2 },
  { id: 'M37', home: 'ESP', away: 'KSA', group: 'H', date: '2026-06-21', time: '12:00', venue: 'Mercedes-Benz', matchday: 2 },
  { id: 'M38', home: 'BEL', away: 'IRN', group: 'G', date: '2026-06-21', time: '15:00', venue: 'SoFi', matchday: 2 },
  { id: 'M39', home: 'URU', away: 'CPV', group: 'H', date: '2026-06-21', time: '18:00', venue: 'Hard Rock', matchday: 2 },
  { id: 'M40', home: 'EGY', away: 'NZL', group: 'G', date: '2026-06-21', time: '21:00', venue: 'BC Place', matchday: 2 },
  { id: 'M41', home: 'ARG', away: 'AUT', group: 'J', date: '2026-06-22', time: '13:00', venue: 'AT&T', matchday: 2 },
  { id: 'M42', home: 'FRA', away: 'IRQ', group: 'I', date: '2026-06-22', time: '17:00', venue: 'Lincoln Financial', matchday: 2 },
  { id: 'M43', home: 'SEN', away: 'NOR', group: 'I', date: '2026-06-22', time: '20:00', venue: 'MetLife', matchday: 2 },
  { id: 'M44', home: 'ALG', away: 'JOR', group: 'J', date: '2026-06-22', time: '23:00', venue: 'Levi\'s', matchday: 2 },
  { id: 'M45', home: 'POR', away: 'UZB', group: 'K', date: '2026-06-23', time: '13:00', venue: 'NRG', matchday: 2 },
  { id: 'M46', home: 'ENG', away: 'GHA', group: 'L', date: '2026-06-23', time: '16:00', venue: 'Gillette', matchday: 2 },
  { id: 'M47', home: 'CRO', away: 'PAN', group: 'L', date: '2026-06-23', time: '19:00', venue: 'BMO Field', matchday: 2 },
  { id: 'M48', home: 'COL', away: 'COD', group: 'K', date: '2026-06-23', time: '22:00', venue: 'Estadio Akron', matchday: 2 },

  // === MATCHDAY 3 ===
  { id: 'M49', home: 'BIH', away: 'QAT', group: 'B', date: '2026-06-24', time: '15:00', venue: 'Lumen', matchday: 3 },
  { id: 'M50', home: 'SUI', away: 'CAN', group: 'B', date: '2026-06-24', time: '15:00', venue: 'BC Place', matchday: 3 },
  { id: 'M51', home: 'MAR', away: 'HAI', group: 'C', date: '2026-06-24', time: '18:00', venue: 'Mercedes-Benz', matchday: 3 },
  { id: 'M52', home: 'BRA', away: 'SCO', group: 'C', date: '2026-06-24', time: '18:00', venue: 'Hard Rock', matchday: 3 },
  { id: 'M53', home: 'MEX', away: 'CZE', group: 'A', date: '2026-06-24', time: '21:00', venue: 'Estadio Banorte', matchday: 3 },
  { id: 'M54', home: 'KOR', away: 'RSA', group: 'A', date: '2026-06-24', time: '21:00', venue: 'Estadio BBVA', matchday: 3 },
  { id: 'M55', home: 'CUR', away: 'CIV', group: 'E', date: '2026-06-25', time: '16:00', venue: 'Lincoln Financial', matchday: 3 },
  { id: 'M56', home: 'ECU', away: 'GER', group: 'E', date: '2026-06-25', time: '16:00', venue: 'MetLife', matchday: 3 },
  { id: 'M57', home: 'JPN', away: 'SWE', group: 'F', date: '2026-06-25', time: '19:00', venue: 'AT&T', matchday: 3 },
  { id: 'M58', home: 'TUN', away: 'NED', group: 'F', date: '2026-06-25', time: '19:00', venue: 'GEHA Arrowhead', matchday: 3 },
  { id: 'M59', home: 'PAR', away: 'AUS', group: 'D', date: '2026-06-25', time: '22:00', venue: 'Levi\'s', matchday: 3 },
  { id: 'M60', home: 'TUR', away: 'USA', group: 'D', date: '2026-06-25', time: '22:00', venue: 'SoFi', matchday: 3 },
  { id: 'M61', home: 'IRQ', away: 'SEN', group: 'I', date: '2026-06-26', time: '15:00', venue: 'BMO Field', matchday: 3 },
  { id: 'M62', home: 'NOR', away: 'FRA', group: 'I', date: '2026-06-26', time: '15:00', venue: 'Gillette', matchday: 3 },
  { id: 'M63', home: 'CPV', away: 'KSA', group: 'H', date: '2026-06-26', time: '20:00', venue: 'NRG', matchday: 3 },
  { id: 'M64', home: 'URU', away: 'ESP', group: 'H', date: '2026-06-26', time: '20:00', venue: 'Estadio Akron', matchday: 3 },
  { id: 'M65', home: 'EGY', away: 'IRN', group: 'G', date: '2026-06-26', time: '23:00', venue: 'Lumen', matchday: 3 },
  { id: 'M66', home: 'NZL', away: 'BEL', group: 'G', date: '2026-06-26', time: '23:00', venue: 'BC Place', matchday: 3 },
  { id: 'M67', home: 'GHA', away: 'CRO', group: 'L', date: '2026-06-27', time: '17:00', venue: 'Lincoln Financial', matchday: 3 },
  { id: 'M68', home: 'PAN', away: 'ENG', group: 'L', date: '2026-06-27', time: '17:00', venue: 'MetLife', matchday: 3 },
  { id: 'M69', home: 'POR', away: 'COL', group: 'K', date: '2026-06-27', time: '19:30', venue: 'Hard Rock', matchday: 3 },
  { id: 'M70', home: 'UZB', away: 'COD', group: 'K', date: '2026-06-27', time: '19:30', venue: 'Mercedes-Benz', matchday: 3 },
  { id: 'M71', home: 'AUT', away: 'ALG', group: 'J', date: '2026-06-27', time: '22:00', venue: 'GEHA Arrowhead', matchday: 3 },
  { id: 'M72', home: 'JOR', away: 'ARG', group: 'J', date: '2026-06-27', time: '22:00', venue: 'AT&T', matchday: 3 },
];

// Knockout stage matches
const KNOCKOUT_MATCHES = [
  // Round of 32 (16 matches) - June 28 - July 3
  { id: 'M73', home: '2A', away: '2B', round: 'R32', date: '2026-06-28', time: '15:00', venue: 'SoFi' },
  { id: 'M74', home: '1C', away: '2F', round: 'R32', date: '2026-06-29', time: '13:00', venue: 'NRG' },
  { id: 'M75', home: '1E', away: '3rd ABCDF', round: 'R32', date: '2026-06-29', time: '16:30', venue: 'Gillette' },
  { id: 'M76', home: '1F', away: '2C', round: 'R32', date: '2026-06-29', time: '21:00', venue: 'Estadio BBVA' },
  { id: 'M77', home: '2E', away: '2I', round: 'R32', date: '2026-06-30', time: '13:00', venue: 'AT&T' },
  { id: 'M78', home: '1I', away: '3rd CDFGH', round: 'R32', date: '2026-06-30', time: '17:00', venue: 'MetLife' },
  { id: 'M79', home: '1A', away: '3rd CEFHI', round: 'R32', date: '2026-06-30', time: '21:00', venue: 'Estadio Banorte' },
  { id: 'M80', home: '1L', away: '3rd EHIJK', round: 'R32', date: '2026-07-01', time: '12:00', venue: 'Mercedes-Benz' },
  { id: 'M81', home: '1G', away: '3rd AEHIJ', round: 'R32', date: '2026-07-01', time: '16:00', venue: 'Lumen' },
  { id: 'M82', home: '1D', away: '3rd BEFIJ', round: 'R32', date: '2026-07-01', time: '20:00', venue: 'Levi\'s' },
  { id: 'M83', home: '1H', away: '2J', round: 'R32', date: '2026-07-02', time: '15:00', venue: 'SoFi' },
  { id: 'M84', home: '2K', away: '2L', round: 'R32', date: '2026-07-02', time: '19:00', venue: 'BMO Field' },
  { id: 'M85', home: '1B', away: '3rd EFGIJ', round: 'R32', date: '2026-07-02', time: '23:00', venue: 'BC Place' },
  { id: 'M86', home: '2D', away: '2G', round: 'R32', date: '2026-07-03', time: '14:00', venue: 'AT&T' },
  { id: 'M87', home: '1J', away: '2H', round: 'R32', date: '2026-07-03', time: '18:00', venue: 'Hard Rock' },
  { id: 'M88', home: '1K', away: '3rd DEIJL', round: 'R32', date: '2026-07-03', time: '21:30', venue: 'GEHA Arrowhead' },

  // Round of 16 (8 matches) - July 4-7
  { id: 'M89', home: 'W73', away: 'W75', round: 'R16', date: '2026-07-04', time: '13:00', venue: 'NRG' },
  { id: 'M90', home: 'W74', away: 'W77', round: 'R16', date: '2026-07-04', time: '17:00', venue: 'Lincoln Financial' },
  { id: 'M91', home: 'W76', away: 'W78', round: 'R16', date: '2026-07-05', time: '16:00', venue: 'MetLife' },
  { id: 'M92', home: 'W79', away: 'W80', round: 'R16', date: '2026-07-05', time: '20:00', venue: 'Estadio Banorte' },
  { id: 'M93', home: 'W83', away: 'W84', round: 'R16', date: '2026-07-06', time: '15:00', venue: 'AT&T' },
  { id: 'M94', home: 'W81', away: 'W82', round: 'R16', date: '2026-07-06', time: '20:00', venue: 'Lumen' },
  { id: 'M95', home: 'W86', away: 'W88', round: 'R16', date: '2026-07-07', time: '12:00', venue: 'Mercedes-Benz' },
  { id: 'M96', home: 'W85', away: 'W87', round: 'R16', date: '2026-07-07', time: '16:00', venue: 'BC Place' },

  // Quarter-finals (4 matches) - July 10-11
  { id: 'M97', home: 'W89', away: 'W90', round: 'QF', date: '2026-07-10', time: '15:00', venue: 'SoFi' },
  { id: 'M98', home: 'W91', away: 'W92', round: 'QF', date: '2026-07-11', time: '17:00', venue: 'Hard Rock' },
  { id: 'M99', home: 'W93', away: 'W94', round: 'QF', date: '2026-07-11', time: '21:00', venue: 'GEHA Arrowhead' },
  { id: 'M100', home: 'W95', away: 'W96', round: 'QF', date: '2026-07-10', time: '19:00', venue: 'MetLife' },

  // Semi-finals (2 matches) - July 14-15
  { id: 'M101', home: 'W97', away: 'W98', round: 'SF', date: '2026-07-14', time: '15:00', venue: 'AT&T' },
  { id: 'M102', home: 'W99', away: 'W100', round: 'SF', date: '2026-07-15', time: '15:00', venue: 'Mercedes-Benz' },

  // Third-place match - July 18
  { id: 'M103', home: 'L101', away: 'L102', round: '3RD', date: '2026-07-18', time: '17:00', venue: 'Hard Rock' },

  // FINAL - July 19
  { id: 'M104', home: 'W101', away: 'W102', round: 'FINAL', date: '2026-07-19', time: '15:00', venue: 'MetLife' },
];

// Combine all matches
const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];

// Group definitions
const GROUPS = {
  'A': ['MEX', 'RSA', 'KOR', 'CZE'],
  'B': ['CAN', 'BIH', 'QAT', 'SUI'],
  'C': ['BRA', 'MAR', 'HAI', 'SCO'],
  'D': ['USA', 'PAR', 'AUS', 'TUR'],
  'E': ['GER', 'CUR', 'CIV', 'ECU'],
  'F': ['NED', 'JPN', 'SWE', 'TUN'],
  'G': ['BEL', 'EGY', 'IRN', 'NZL'],
  'H': ['ESP', 'CPV', 'KSA', 'URU'],
  'I': ['FRA', 'SEN', 'IRQ', 'NOR'],
  'J': ['ARG', 'ALG', 'AUT', 'JOR'],
  'K': ['POR', 'COD', 'UZB', 'COL'],
  'L': ['ENG', 'CRO', 'GHA', 'PAN'],
};

// Scoring rules
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
  generalTotalCorners: 8,
  generalTotalPenalties: 8,
  generalTotalPitchInvaders: 5,
};

// Timezone offsets from ET (hours)
const TIMEZONE_OFFSETS = {
  'ET': 0,
  'CT': -1,
  'MT': -2,
  'PT': -3,
  'GMT': 5,
  'CET': 6,
  'AST': 4,
};
