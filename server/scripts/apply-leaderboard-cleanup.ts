import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  buildLeaderboardCleanupTransactionPlan,
  summarizeLeaderboardCleanupDryRun,
  validateLeaderboardCleanupManifest,
  type LeaderboardCleanupManifest,
  type LeaderboardCleanupUserRow,
} from '../src/progress/leaderboard-cleanup';

interface ApplyCliOptions {
  databasePath: string;
  manifestPath: string;
  dryRun: boolean;
}

function printHelp() {
  console.log(`Usage: npx ts-node scripts/apply-leaderboard-cleanup.ts --manifest <path> [options]

Options:
  --manifest <path>   Approved manifest JSON file.
  --database <path>   SQLite database path. Falls back to DATABASE_URL when omitted.
  --dry-run           Print the cleanup plan only. This is the default mode.
  --apply             Execute the cleanup transaction after validation.
  --help              Show this help message.
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

function parseCliOptions(argv: string[]): ApplyCliOptions | null {
  if (argv.includes('--help')) {
    printHelp();
    return null;
  }

  const manifestPath = parseArgValue(argv, '--manifest');
  if (!manifestPath) {
    throw new Error('--manifest is required');
  }

  return {
    databasePath: resolveDatabasePath(parseArgValue(argv, '--database')),
    manifestPath: resolve(manifestPath),
    dryRun: !argv.includes('--apply'),
  };
}

function loadManifest(manifestPath: string): LeaderboardCleanupManifest {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as LeaderboardCleanupManifest;
  return validateLeaderboardCleanupManifest(manifest, {
    requireApprovedDeletes: true,
  });
}

async function loadTargetRows(
  prisma: PrismaClient,
  userIds: string[],
): Promise<LeaderboardCleanupUserRow[]> {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
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
}

async function loadExactDeleteTotals(prisma: PrismaClient, userIds: string[]) {
  const [studyRecords, userAchievements, follows, matchParticipants, users] = await Promise.all([
    prisma.studyRecord.count({
      where: { userId: { in: userIds } },
    }),
    prisma.userAchievement.count({
      where: { userId: { in: userIds } },
    }),
    prisma.follow.count({
      where: {
        OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }],
      },
    }),
    prisma.matchParticipant.count({
      where: { userId: { in: userIds } },
    }),
    prisma.user.count({
      where: { id: { in: userIds } },
    }),
  ]);

  return {
    users,
    studyRecords,
    userAchievements,
    follows,
    matchParticipants,
  };
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (!options) {
    return;
  }

  const manifest = loadManifest(options.manifestPath);
  const deleteUserIds = manifest.entries
    .filter((entry) => entry.reviewDecision === 'DELETE')
    .map((entry) => entry.userId);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: toSqliteUrl(options.databasePath),
      },
    },
  });

  try {
    const rows = await loadTargetRows(prisma, deleteUserIds);
    const summary = summarizeLeaderboardCleanupDryRun(rows, manifest);
    const exactTotals = await loadExactDeleteTotals(prisma, deleteUserIds);
    const exactSummary = {
      ...summary,
      totals: exactTotals,
    };
    const plan = buildLeaderboardCleanupTransactionPlan(exactSummary);

    if (options.dryRun) {
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run',
            manifestPath: options.manifestPath,
            summary: exactSummary,
            plan,
          },
          null,
          2,
        ),
      );
      return;
    }

    if (!existsSync(manifest.backupReference.path)) {
      throw new Error(
        `Backup file not found: ${manifest.backupReference.path}. Create and verify the backup before applying cleanup.`,
      );
    }

    const results = await prisma.$transaction(async (tx) => {
      const userIds = plan.userIds;
      const userAchievements = await tx.userAchievement.deleteMany({
        where: { userId: { in: userIds } },
      });
      const studyRecords = await tx.studyRecord.deleteMany({
        where: { userId: { in: userIds } },
      });
      const follows = await tx.follow.deleteMany({
        where: {
          OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }],
        },
      });
      const matchParticipants = await tx.matchParticipant.deleteMany({
        where: { userId: { in: userIds } },
      });
      const users = await tx.user.deleteMany({
        where: { id: { in: userIds } },
      });

      return {
        userAchievements: userAchievements.count,
        studyRecords: studyRecords.count,
        follows: follows.count,
        matchParticipants: matchParticipants.count,
        users: users.count,
      };
    });

    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          manifestPath: options.manifestPath,
          summary: exactSummary,
          plan,
          results,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
