const RESERVED_NICKNAMES = new Set(['准备出发的小萌新']);

const toTrimmedString = (value, maxLength = 512) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

const isManagedAvatar = (value) => toTrimmedString(value).startsWith('cloud://');

const normalizeProfileUpdateInput = (payload = {}) => {
  const username = toTrimmedString(payload.username, 24);
  const avatar = toTrimmedString(payload.avatar);
  const previousAvatar = toTrimmedString(payload.previousAvatar);
  const uploadedAvatar = toTrimmedString(payload.uploadedAvatar);

  return {
    username,
    avatar,
    previousAvatar,
    uploadedAvatar
  };
};

const validateProfileUpdateInput = (payload = {}) => {
  const normalized = normalizeProfileUpdateInput(payload);
  const errors = [];

  if (!normalized.username || RESERVED_NICKNAMES.has(normalized.username)) {
    errors.push({
      field: 'username',
      code: 'INVALID_NICKNAME'
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized
  };
};

const buildProfileUpdatePlan = (payload = {}) => {
  const validation = validateProfileUpdateInput(payload);
  const normalized = validation.normalized;
  const writeAllowed = validation.ok;
  const avatarChanged = normalized.avatar !== normalized.previousAvatar;

  const onWriteFailure =
    writeAllowed && normalized.uploadedAvatar && normalized.uploadedAvatar === normalized.avatar
      ? [
          {
            type: 'delete-file',
            fileID: normalized.uploadedAvatar,
            reason: 'rollback-new-avatar-upload'
          }
        ]
      : [];

  const onWriteSuccess =
    writeAllowed &&
    avatarChanged &&
    isManagedAvatar(normalized.previousAvatar) &&
    normalized.previousAvatar !== normalized.uploadedAvatar &&
    normalized.previousAvatar !== normalized.avatar
      ? [
          {
            type: 'delete-file',
            fileID: normalized.previousAvatar,
            reason: 'delete-replaced-avatar'
          }
        ]
      : [];

  return {
    ok: writeAllowed,
    validation: {
      ok: validation.ok,
      errors: validation.errors
    },
    write: {
      allowed: writeAllowed,
      blockedBy: writeAllowed ? null : 'validation',
      payload: writeAllowed
        ? {
            isProfileSet: true,
            username: normalized.username,
            avatar: normalized.avatar
          }
        : null
    },
    cleanup: {
      onWriteFailure,
      onWriteSuccess
    }
  };
};

module.exports = {
  RESERVED_NICKNAMES,
  isManagedAvatar,
  normalizeProfileUpdateInput,
  validateProfileUpdateInput,
  buildProfileUpdatePlan
};
