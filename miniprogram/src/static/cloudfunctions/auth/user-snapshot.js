const DEFAULT_USERNAME = '准备出发的小萌新';
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

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

function resolveProfileFlag(rawFlag, username, avatar) {
  const hasCustomProfile = username !== DEFAULT_USERNAME || avatar !== DEFAULT_AVATAR;
  if (!hasCustomProfile) {
    return false;
  }
  return rawFlag === true || hasCustomProfile;
}

function normalizeUserSnapshot(input) {
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

module.exports = {
  DEFAULT_USERNAME,
  DEFAULT_AVATAR,
  normalizeUserSnapshot
};
