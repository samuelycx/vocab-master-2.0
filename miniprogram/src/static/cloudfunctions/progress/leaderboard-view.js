const DEFAULT_LEADERBOARD_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const DEFAULT_LEADERBOARD_NAME = '用户';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value, fallback) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeCount(value, fallback, minimum) {
  const normalized = normalizeNumber(value, fallback);
  return normalized >= minimum ? normalized : fallback;
}

function isValidAvatar(value) {
  const avatar = normalizeString(value);
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('cloud://');
}

function getDisplayName(entry) {
  const candidates = [entry && entry.displayName, entry && entry.nickname, entry && entry.username, entry && entry.name];
  for (const candidate of candidates) {
    const normalized = normalizeString(candidate);
    if (normalized) return normalized;
  }
  return DEFAULT_LEADERBOARD_NAME;
}

function normalizeLeaderboardRow(entry = {}, index = 0) {
  const displayName = getDisplayName(entry);
  const avatar = isValidAvatar(entry.avatar) ? normalizeString(entry.avatar) : DEFAULT_LEADERBOARD_AVATAR;
  const rank = normalizeCount(entry.rank, index + 1, 1);

  return {
    id: normalizeString(entry.id) || normalizeString(entry._id) || normalizeString(entry.openid) || `leaderboard-${rank}`,
    displayName,
    avatar,
    level: normalizeCount(entry.level, 1, 1),
    xp: normalizeCount(entry.xp, 0, 0),
    totalCorrect: normalizeCount(entry.totalCorrect, 0, 0),
    rank,
    isProfileSet: Boolean(entry.isProfileSet) || displayName !== DEFAULT_LEADERBOARD_NAME || avatar !== DEFAULT_LEADERBOARD_AVATAR
  };
}

function buildLeaderboardView(rows = []) {
  return Array.isArray(rows) ? rows.map((row, index) => normalizeLeaderboardRow(row, index)) : [];
}

module.exports = {
  buildLeaderboardView,
  normalizeLeaderboardRow,
  DEFAULT_LEADERBOARD_AVATAR,
  DEFAULT_LEADERBOARD_NAME
};
