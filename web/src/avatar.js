export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export function hasAvatarImage(avatar) {
  return typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/uploads/'));
}

export function resolveAvatarUrl(avatar) {
  if (hasAvatarImage(avatar)) return avatar;
  return DEFAULT_AVATAR;
}
