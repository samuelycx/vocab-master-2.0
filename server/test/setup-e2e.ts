import { copyFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const dbPath = join(__dirname, 'e2e.db');
const seedDbPath = join(__dirname, '..', 'prisma', 'dev.db');

process.env.DATABASE_URL ||= `file:${dbPath}`;

if (existsSync(dbPath)) {
  rmSync(dbPath, { force: true });
}
if (existsSync(`${dbPath}-journal`)) {
  rmSync(`${dbPath}-journal`, { force: true });
}

// Seed a dedicated e2e copy so auth flows do not touch the development database.
copyFileSync(seedDbPath, dbPath);
