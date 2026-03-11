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

export const CATEGORY_ICON_MAP = {
  GROWTH: getAchievementIconById('growth_first_use'),
  CONSISTENCY: getAchievementIconById('cons_30'),
  PRECISION: getAchievementIconById('prec_20'),
  VOLUME: getAchievementIconById('vol_200'),
  WEALTH: getAchievementIconById('wealth_1000'),
  SPECIAL: getAchievementIconById('spec_night')
};
