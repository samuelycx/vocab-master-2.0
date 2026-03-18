export const DEFAULT_LEADERBOARD_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
export const DEFAULT_LEADERBOARD_NAME = '用户';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value, fallback) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeCount(value, fallback, minimum = 0) {
  const normalized = normalizeNumber(value, fallback);
  return normalized >= minimum ? normalized : fallback;
}

export function isValidLeaderboardAvatar(value) {
  const avatar = normalizeString(value);
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('cloud://');
}

export function normalizeLeaderboardAvatar(value) {
  return isValidLeaderboardAvatar(value) ? normalizeString(value) : DEFAULT_LEADERBOARD_AVATAR;
}

export function normalizeLeaderboardDisplayName(entry = {}) {
  const candidates = [entry.displayName, entry.nickname, entry.username, entry.name];
  for (const candidate of candidates) {
    const normalized = normalizeString(candidate);
    if (normalized) return normalized;
  }
  return DEFAULT_LEADERBOARD_NAME;
}

export function normalizeLeaderboardEntry(entry = {}, index = 0) {
  const displayName = normalizeLeaderboardDisplayName(entry);
  const avatar = normalizeLeaderboardAvatar(entry.avatar);
  const hasCustomName = displayName !== DEFAULT_LEADERBOARD_NAME;
  const hasCustomAvatar = avatar !== DEFAULT_LEADERBOARD_AVATAR;
  const rank = normalizeCount(entry.rank, index + 1, 1);

  return {
    id: normalizeString(entry.id) || normalizeString(entry._id) || normalizeString(entry.openid) || `leaderboard-${rank}`,
    displayName,
    avatar,
    level: normalizeCount(entry.level, 1, 1),
    xp: normalizeCount(entry.xp, 0, 0),
    totalCorrect: normalizeCount(entry.totalCorrect, 0, 0),
    rank,
    isProfileSet: Boolean(entry.isProfileSet) || hasCustomName || hasCustomAvatar
  };
}

export function normalizeLeaderboardEntries(entries = []) {
  return Array.isArray(entries) ? entries.map((entry, index) => normalizeLeaderboardEntry(entry, index)) : [];
}
