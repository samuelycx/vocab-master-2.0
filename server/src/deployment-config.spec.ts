import { readFileSync } from 'fs';
import { join } from 'path';

describe('deployment database defaults', () => {
  const serverRoot = join(__dirname, '..');
  const repoRoot = join(serverRoot, '..');
  const deployScriptPath = join(repoRoot, 'scripts', 'deploy-aliyun.sh');
  const releaseRunbookPath = join(
    repoRoot,
    'docs',
    'release',
    'SERVER_GIT_RELEASE_RUNBOOK.md',
  );
  const releaseChecklistPath = join(
    repoRoot,
    'docs',
    'release',
    'DEPLOY-CHECKLIST.md',
  );

  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSharedRoot = process.env.SERVER_SHARED_ROOT;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
    if (originalSharedRoot === undefined) {
      delete process.env.SERVER_SHARED_ROOT;
    } else {
      process.env.SERVER_SHARED_ROOT = originalSharedRoot;
    }
    jest.resetModules();
  });

  it('uses the server prisma dev.db fallback when DATABASE_URL is unset', () => {
    delete process.env.DATABASE_URL;
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ecosystem = require('../ecosystem.config.cjs');

    expect(ecosystem.apps[0].env.DATABASE_URL).toMatch(
      /^file:.*\/server\/prisma\/dev\.db$/,
    );
  });

  it('derives shared runtime paths in PM2 when SERVER_SHARED_ROOT is set', () => {
    delete process.env.DATABASE_URL;
    process.env.SERVER_SHARED_ROOT = '/var/www/vocab-master/shared';
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ecosystem = require('../ecosystem.config.cjs');

    expect(ecosystem.apps[0].env.DATABASE_URL).toBe(
      'file:/var/www/vocab-master/shared/prisma/dev.db',
    );
    expect(ecosystem.apps[0].env.SERVER_SHARED_UPLOADS_ROOT).toBe(
      '/var/www/vocab-master/shared/uploads',
    );
    expect(ecosystem.apps[0].env_file).toBe(
      '/var/www/vocab-master/shared/env/server.env',
    );
    expect(ecosystem.apps[0].out_file).toBe(
      '/var/www/vocab-master/shared/logs/vocab-master-web-out.log',
    );
    expect(ecosystem.apps[0].error_file).toBe(
      '/var/www/vocab-master/shared/logs/vocab-master-web-error.log',
    );
  });

  it('preserves an explicit DATABASE_URL override in PM2', () => {
    process.env.DATABASE_URL = 'file:/tmp/custom.db';
    process.env.SERVER_SHARED_ROOT = '/var/www/vocab-master/shared';
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ecosystem = require('../ecosystem.config.cjs');

    expect(ecosystem.apps[0].env.DATABASE_URL).toBe('file:/tmp/custom.db');
  });

  it('keeps deploy docs aligned with the shared runtime deploy defaults', () => {
    const expectedSharedRoot = '/var/www/vocab-master/shared';
    const expectedDbUrl = 'file:/var/www/vocab-master/shared/prisma/dev.db';
    const deployScript = readFileSync(deployScriptPath, 'utf8');
    const releaseRunbook = readFileSync(releaseRunbookPath, 'utf8');
    const releaseChecklist = readFileSync(releaseChecklistPath, 'utf8');

    expect(deployScript).toContain('/var/www/vocab-master');
    expect(deployScript).toContain('SERVER_SHARED_ROOT');
    expect(deployScript).toContain(
      'DATABASE_URL="${DATABASE_URL:-file:$SERVER_SHARED_ROOT/prisma/dev.db}"',
    );
    expect(releaseRunbook).toContain(expectedSharedRoot);
    expect(releaseRunbook).toContain('shared/uploads');
    expect(releaseChecklist).toContain(expectedDbUrl);
    expect(releaseChecklist).toContain('shared/logs');
  });
});
