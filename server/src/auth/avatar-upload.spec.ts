import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('avatar upload runtime paths', () => {
  const originalSharedRoot = process.env.SERVER_SHARED_ROOT;
  const originalSharedUploadsRoot = process.env.SERVER_SHARED_UPLOADS_ROOT;
  const sandboxRoots: string[] = [];

  afterEach(() => {
    if (originalSharedRoot === undefined) {
      delete process.env.SERVER_SHARED_ROOT;
    } else {
      process.env.SERVER_SHARED_ROOT = originalSharedRoot;
    }

    if (originalSharedUploadsRoot === undefined) {
      delete process.env.SERVER_SHARED_UPLOADS_ROOT;
    } else {
      process.env.SERVER_SHARED_UPLOADS_ROOT = originalSharedUploadsRoot;
    }

    jest.resetModules();

    for (const sandboxRoot of sandboxRoots.splice(0)) {
      rmSync(sandboxRoot, { force: true, recursive: true });
    }
  });

  it('prefers the shared uploads root instead of a release-local avatar directory', () => {
    const sandboxRoot = mkdtempSync(join(tmpdir(), 'avatar-runtime-'));
    sandboxRoots.push(sandboxRoot);
    const sharedUploadsRoot = join(sandboxRoot, 'shared', 'uploads');
    process.env.SERVER_SHARED_UPLOADS_ROOT = sharedUploadsRoot;
    delete process.env.SERVER_SHARED_ROOT;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const avatarUpload = require('./avatar-upload');
    const releaseCwd = '/var/www/vocab-master/releases/abc123/server';

    expect(avatarUpload.resolveAvatarUploadDir(releaseCwd)).toBe(
      join(sharedUploadsRoot, 'avatars'),
    );
    expect(
      avatarUpload.resolveAvatarFilePathFromPublicUrl(
        '/uploads/avatars/profile.webp',
        releaseCwd,
      ),
    ).toBe(join(sharedUploadsRoot, 'avatars', 'profile.webp'));
    expect(existsSync(join(sharedUploadsRoot, 'avatars'))).toBe(true);
  });

  it('derives the uploads path from SERVER_SHARED_ROOT when only the shared root is configured', () => {
    const sandboxRoot = mkdtempSync(join(tmpdir(), 'avatar-shared-root-'));
    sandboxRoots.push(sandboxRoot);
    const sharedRoot = join(sandboxRoot, 'shared');
    delete process.env.SERVER_SHARED_UPLOADS_ROOT;
    process.env.SERVER_SHARED_ROOT = sharedRoot;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const avatarUpload = require('./avatar-upload');

    expect(
      avatarUpload.resolveAvatarUploadDir('/var/www/vocab-master/releases/abc123/server'),
    ).toBe(join(sharedRoot, 'uploads', 'avatars'));
  });

  it('falls back to the local server uploads directory when shared runtime paths are unset', () => {
    const sandboxRoot = mkdtempSync(join(tmpdir(), 'avatar-local-'));
    sandboxRoots.push(sandboxRoot);
    delete process.env.SERVER_SHARED_UPLOADS_ROOT;
    delete process.env.SERVER_SHARED_ROOT;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const avatarUpload = require('./avatar-upload');

    expect(avatarUpload.resolveAvatarUploadDir(sandboxRoot)).toBe(
      join(sandboxRoot, 'server', 'uploads', 'avatars'),
    );
  });
});
