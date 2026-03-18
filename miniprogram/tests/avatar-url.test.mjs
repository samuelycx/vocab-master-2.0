import test from 'node:test';
import assert from 'node:assert/strict';

test('display avatar helper accepts cloud avatars and rejects unsupported paths', async () => {
  const avatarModule = await import('../src/utils/avatar-url.js');

  assert.equal(avatarModule.getDisplayAvatarUrl('cloud://bucket/avatar.png'), 'cloud://bucket/avatar.png');
  assert.equal(avatarModule.getDisplayAvatarUrl('https://example.com/avatar.png'), 'https://example.com/avatar.png');
  assert.equal(
    avatarModule.getDisplayAvatarUrl('wxfile://tmp/avatar.png'),
    avatarModule.DEFAULT_DISPLAY_AVATAR
  );
  assert.equal(
    avatarModule.getDisplayAvatarUrl('wxfile://tmp/avatar.png', { allowLocal: true }),
    'wxfile://tmp/avatar.png'
  );
});
