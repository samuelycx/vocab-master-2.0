import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('uploads static assets runtime paths', () => {
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

  it('serves uploads from the shared runtime directory when configured', () => {
    const sandboxRoot = mkdtempSync(join(tmpdir(), 'static-assets-'));
    sandboxRoots.push(sandboxRoot);
    const sharedUploadsRoot = join(sandboxRoot, 'shared', 'uploads');
    process.env.SERVER_SHARED_UPLOADS_ROOT = sharedUploadsRoot;
    delete process.env.SERVER_SHARED_ROOT;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const staticAssets = require('./static-assets');
    const releaseCwd = '/var/www/vocab-master/releases/abc123/server';

    expect(staticAssets.resolveUploadsRootPath(releaseCwd)).toBe(sharedUploadsRoot);
    expect(staticAssets.createUploadsStaticOptions(releaseCwd)).toEqual({
      rootPath: sharedUploadsRoot,
      serveRoot: '/uploads',
    });
  });

  it('falls back to the local server uploads directory when shared runtime is unset', () => {
    const sandboxRoot = mkdtempSync(join(tmpdir(), 'static-assets-local-'));
    sandboxRoots.push(sandboxRoot);
    delete process.env.SERVER_SHARED_UPLOADS_ROOT;
    delete process.env.SERVER_SHARED_ROOT;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const staticAssets = require('./static-assets');

    expect(staticAssets.resolveUploadsRootPath(sandboxRoot)).toBe(
      join(sandboxRoot, 'server', 'uploads'),
    );
  });
});
