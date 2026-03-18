const RESERVED_NICKNAMES = new Set(['准备出发的小萌新']);

const toTrimmedString = (value, maxLength = 512) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

export const isCloudAvatar = (value) => toTrimmedString(value).startsWith('cloud://');

export const isRemoteAvatar = (value) => /^https?:\/\//.test(toTrimmedString(value));

export const isLocalTemporaryAvatar = (value) => {
  const normalized = toTrimmedString(value);
  if (!normalized) return false;
  return !isCloudAvatar(normalized) && !isRemoteAvatar(normalized);
};

export const normalizeProfileDraft = ({ currentProfile = {}, nextProfile = {}, uploadedAvatar = '' } = {}) => {
  const usernameSource = nextProfile.username ?? nextProfile.nickname;
  const currentAvatarSource = currentProfile.avatar ?? '';
  const nextAvatarSource = nextProfile.avatar ?? nextProfile.avatarUrl ?? '';

  const username = toTrimmedString(usernameSource, 24);
  const previousAvatar = toTrimmedString(currentAvatarSource);
  const requestedAvatar = toTrimmedString(nextAvatarSource);
  const resolvedAvatar = isLocalTemporaryAvatar(requestedAvatar)
    ? toTrimmedString(uploadedAvatar)
    : requestedAvatar;

  return {
    username,
    previousAvatar,
    requestedAvatar,
    resolvedAvatar
  };
};

export const validateProfileDraft = ({ username } = {}) => {
  const normalized = toTrimmedString(username, 24);
  const errors = [];

  if (!normalized || RESERVED_NICKNAMES.has(normalized)) {
    errors.push({
      field: 'username',
      code: 'INVALID_NICKNAME'
    });
  }

  return {
    ok: errors.length === 0,
    errors
  };
};

export const buildProfileSavePlan = (input = {}) => {
  const normalized = normalizeProfileDraft(input);
  const validation = validateProfileDraft(normalized);
  const needsUpload = isLocalTemporaryAvatar(normalized.requestedAvatar);
  const uploadResolved = !needsUpload || Boolean(normalized.resolvedAvatar);

  const writeAllowed = validation.ok && uploadResolved;
  const payload = writeAllowed
    ? {
        username: normalized.username,
        avatar: normalized.resolvedAvatar,
        previousAvatar: normalized.previousAvatar
      }
    : null;

  return {
    ok: writeAllowed,
    validation,
    upload: {
      required: needsUpload,
      filePath: needsUpload ? normalized.requestedAvatar : '',
      resolved: uploadResolved
    },
    write: {
      allowed: writeAllowed,
      blockedBy: validation.ok ? (uploadResolved ? null : 'upload') : 'validation',
      payload
    },
    cleanup: {
      onWriteFailure: [],
      onWriteSuccess: []
    }
  };
};

export { RESERVED_NICKNAMES };
