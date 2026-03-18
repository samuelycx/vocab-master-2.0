export const DEFAULT_DISPLAY_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

const normalizeAvatar = (value) => (typeof value === 'string' ? value.trim() : '');

export function getDisplayAvatarUrl(value, { allowLocal = false } = {}) {
  const avatar = normalizeAvatar(value);
  if (!avatar) return DEFAULT_DISPLAY_AVATAR;
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('cloud://')) {
    return avatar;
  }
  if (allowLocal && avatar.startsWith('wxfile://')) {
    return avatar;
  }
  return DEFAULT_DISPLAY_AVATAR;
}
