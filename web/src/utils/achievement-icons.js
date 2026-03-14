const BASE = '/static/achievements';

export function getAchievementId(item) {
  if (!item || typeof item !== 'object') return '';
  return item.achievementId || item.id || '';
}

export function getAchievementIconById(id) {
  const safeId = String(id || '').trim();
  if (!safeId) return `${BASE}/default.svg`;
  return `${BASE}/${safeId}.svg`;
}

export function getAchievementIcon(item) {
  return getAchievementIconById(getAchievementId(item));
}
