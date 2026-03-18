import { readFileSync } from 'fs';
import { join } from 'path';

describe('deployment database defaults', () => {
  const serverRoot = join(__dirname, '..');
  const repoRoot = join(serverRoot, '..');
  const deployScriptPath = join(repoRoot, 'scripts', 'deploy-aliyun.sh');
  const releaseGuidePath = join(
    repoRoot,
    'docs',
    'release',
    '2026-03-13-web-deploy-commands.md',
  );
  const releaseChecklistPath = join(
    repoRoot,
    'docs',
    'release',
    '2026-03-13-web-release-checklist.md',
  );

  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
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

  it('preserves an explicit DATABASE_URL override in PM2', () => {
    process.env.DATABASE_URL = 'file:/tmp/custom.db';
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ecosystem = require('../ecosystem.config.cjs');

    expect(ecosystem.apps[0].env.DATABASE_URL).toBe('file:/tmp/custom.db');
  });

  it('keeps deploy docs aligned with the aliyun deploy script default database', () => {
    const expectedDbUrl = 'file:/var/www/vocab-master/server/prisma/dev.db';
    const deployScript = readFileSync(deployScriptPath, 'utf8');
    const releaseGuide = readFileSync(releaseGuidePath, 'utf8');
    const releaseChecklist = readFileSync(releaseChecklistPath, 'utf8');

    expect(deployScript).toContain(`DATABASE_URL="${expectedDbUrl}"`);
    expect(releaseGuide).toContain(`DATABASE_URL="${expectedDbUrl}"`);
    expect(releaseChecklist).toContain(expectedDbUrl);
  });
});
