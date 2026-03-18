import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  buildLeaderboardCleanupCandidates,
  buildLeaderboardCleanupExportReport,
  createLeaderboardCleanupManifestTemplate,
  type LeaderboardCleanupUserRow,
} from '../src/progress/leaderboard-cleanup';

interface ExportCliOptions {
  databasePath: string;
  outputPath: string;
  manifestOutputPath: string;
  limit: number;
}

function printHelp() {
  console.log(`Usage: npx ts-node scripts/export-leaderboard-cleanup.ts [options]

Options:
  --database <path>         SQLite database path. Falls back to DATABASE_URL when omitted.
  --output <path>           Report JSON output path.
  --manifest-output <path>  Manifest template output path.
  --limit <number>          Max leaderboard rows to scan. Default: 200.
  --help                    Show this help message.
`);
}

function parseArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

function resolveDatabasePath(raw?: string): string {
  if (raw) {
    return resolve(raw);
  }

  const envUrl = String(process.env.DATABASE_URL ?? '').trim();
  if (envUrl.startsWith('file:')) {
    return resolve(envUrl.slice('file:'.length));
  }

  throw new Error('Missing database path. Pass --database or set DATABASE_URL=file:...');
}

function toSqliteUrl(databasePath: string): string {
  return `file:${databasePath}`;
}

function parseCliOptions(argv: string[]): ExportCliOptions | null {
  if (argv.includes('--help')) {
    printHelp();
    return null;
  }

  const outputPath = resolve(
    parseArgValue(argv, '--output') ?? 'artifacts/leaderboard-cleanup/report.json',
  );
  const manifestOutputPath = resolve(
    parseArgValue(argv, '--manifest-output') ??
      'artifacts/leaderboard-cleanup/manifest-template.json',
  );
  const limit = Number(parseArgValue(argv, '--limit') ?? '200');
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('--limit must be a positive integer');
  }

  return {
    databasePath: resolveDatabasePath(parseArgValue(argv, '--database')),
    outputPath,
    manifestOutputPath,
    limit,
  };
}

async function loadLeaderboardRows(databasePath: string, limit: number): Promise<LeaderboardCleanupUserRow[]> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: toSqliteUrl(databasePath),
      },
    },
  });

  try {
    const users = await prisma.user.findMany({
      orderBy: [{ xp: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        level: true,
        xp: true,
        coins: true,
        streak: true,
        totalCorrect: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            progress: true,
            achievements: true,
            followers: true,
            following: true,
            matches: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      totalCorrect: user.totalCorrect,
      studyRecordCount: user._count.progress,
      achievementCount: user._count.achievements,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      matchParticipantCount: user._count.matches,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (!options) {
    return;
  }

  const rows = await loadLeaderboardRows(options.databasePath, options.limit);
  const backupPath = resolve('artifacts/leaderboard-cleanup/leaderboard-cleanup-backup.sqlite');
  const report = buildLeaderboardCleanupExportReport({
    rows,
    databasePath: options.databasePath,
    backupPath,
  });
  const candidates = buildLeaderboardCleanupCandidates(rows).map((candidate) => ({
    leaderboardRank: rows.findIndex((row) => row.id === candidate.userId) + 1,
    ...candidate,
  }));

  const reportPayload = {
    ...report,
    candidates,
  };
  const manifestTemplate = createLeaderboardCleanupManifestTemplate(report);

  mkdirSync(dirname(options.outputPath), { recursive: true });
  mkdirSync(dirname(options.manifestOutputPath), { recursive: true });
  writeFileSync(options.outputPath, `${JSON.stringify(reportPayload, null, 2)}\n`, 'utf8');
  writeFileSync(
    options.manifestOutputPath,
    `${JSON.stringify(manifestTemplate, null, 2)}\n`,
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        reportPath: options.outputPath,
        manifestTemplatePath: options.manifestOutputPath,
        totalUsersScanned: report.totalUsersScanned,
        candidateCount: report.candidates.length,
        backupSuggestion: report.backupSuggestion,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
