import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('local prisma schema alignment', () => {
  const serverRoot = process.cwd();
  const schemaPath = join(serverRoot, 'prisma', 'schema.prisma');
  const dbPath = join(serverRoot, 'prisma', 'dev.db');
  const nicknameMigrationDir = join(
    serverRoot,
    'prisma',
    'migrations',
    '20260316050000_add_user_nickname',
  );
  const nicknameMigrationPath = join(nicknameMigrationDir, 'migration.sql');

  it('keeps the user nickname field aligned across schema, migration, and local sqlite db', () => {
    const schema = readFileSync(schemaPath, 'utf8');
    expect(schema).toMatch(/model User\s*\{[\s\S]*nickname\s+String\?/);

    expect(existsSync(nicknameMigrationPath)).toBe(true);

    const userSchema = execFileSync('sqlite3', [dbPath, '.schema User'], {
      encoding: 'utf8',
    });
    expect(userSchema).toContain('"nickname" TEXT');
  });
});
