export const DEFAULT_USERNAME = '准备出发的小萌新';
export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const CANONICAL_USER_FIELDS = new Set([
  'id',
  '_id',
  'openid',
  'username',
  'avatar',
  'role',
  'level',
  'xp',
  'coins',
  'streak',
  'totalCorrect',
  'isProfileSet',
  'isLoggedIn'
]);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRole(value) {
  const role = normalizeText(value);
  return role || 'USER';
}

function normalizeLevel(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 1) {
    return 1;
  }
  return Math.floor(normalized);
}

function normalizeCount(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return 0;
  }
  return Math.floor(normalized);
}

function normalizeIdentity(snapshot) {
  const id = normalizeText(snapshot.id) || normalizeText(snapshot._id) || normalizeText(snapshot.openid);
  const openid = normalizeText(snapshot.openid) || id;
  return { id: id || openid || null, openid: openid || id || null };
}

function extractExtraUserFields(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {};
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !CANONICAL_USER_FIELDS.has(key))
  );
}

function resolveProfileFlag(rawFlag, username, avatar) {
  const hasCustomProfile = username !== DEFAULT_USERNAME || avatar !== DEFAULT_AVATAR;
  if (!hasCustomProfile) {
    return false;
  }
  return rawFlag === true || hasCustomProfile;
}

export function normalizeUserSnapshot(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const identity = normalizeIdentity(source);
  const username = normalizeText(source.username) || DEFAULT_USERNAME;
  const avatar = normalizeText(source.avatar) || DEFAULT_AVATAR;

  return {
    id: identity.id,
    openid: identity.openid,
    username,
    avatar,
    role: normalizeRole(source.role),
    level: normalizeLevel(source.level),
    xp: normalizeCount(source.xp),
    coins: normalizeCount(source.coins),
    streak: normalizeCount(source.streak),
    totalCorrect: normalizeCount(source.totalCorrect),
    isProfileSet: resolveProfileFlag(source.isProfileSet, username, avatar)
  };
}

export function mergeUserState(currentUser = {}, incomingUser = {}) {
  const current = currentUser && typeof currentUser === 'object' ? currentUser : {};
  const incoming = incomingUser && typeof incomingUser === 'object' ? incomingUser : {};
  const normalized = normalizeUserSnapshot({ ...current, ...incoming });
  const currentIdentity = normalizeIdentity(current);
  const nextIdentity = normalizeIdentity({ ...current, ...incoming });
  const sameUser = Boolean(currentIdentity.id) && currentIdentity.id === nextIdentity.id;

  return {
    ...(sameUser ? extractExtraUserFields(current) : {}),
    ...extractExtraUserFields(incoming),
    ...normalized
  };
}
