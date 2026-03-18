import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { buildWordRepairPatch } from '../src/worddata/encoding-repair';
import { type WordEncodingRow } from '../src/worddata/encoding-audit';

interface RepairCliOptions {
  databasePath: string;
  reportOutputPath: string;
  apply: boolean;
  limit?: number;
}

interface RepairPlanEntry {
  wordId: string;
  text: string;
  updates: Record<string, string>;
}

function printHelp() {
  console.log(`Usage: npx ts-node scripts/repair-worddata.ts [options]

Options:
  --database <path>      SQLite database path. Falls back to DATABASE_URL when omitted.
  --report-output <path> Repair report JSON output path.
  --limit <number>       Optional max Word rows to scan.
  --dry-run              Print and write the repair plan only. This is the default mode.
  --apply                Execute the repair plan against the target database.
  --help                 Show this help message.
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

function parseCliOptions(argv: string[]): RepairCliOptions | null {
  if (argv.includes('--help')) {
    printHelp();
    return null;
  }

  const reportOutputPath = resolve(
    parseArgValue(argv, '--report-output') ?? 'artifacts/worddata-encoding/repair-report.json',
  );
  const limitValue = parseArgValue(argv, '--limit');
  const limit = limitValue ? Number(limitValue) : undefined;
  if (limitValue && (!Number.isInteger(limit) || (limit ?? 0) <= 0)) {
    throw new Error('--limit must be a positive integer');
  }

  return {
    databasePath: resolveDatabasePath(parseArgValue(argv, '--database')),
    reportOutputPath,
    apply: argv.includes('--apply'),
    limit,
  };
}

async function loadWordRows(prisma: PrismaClient, limit?: number): Promise<WordEncodingRow[]> {
  return prisma.word.findMany({
    take: limit,
    orderBy: { text: 'asc' },
    select: {
      id: true,
      text: true,
      phonetic: true,
      partOfSpeech: true,
      meanings: true,
      examples: true,
      mnemonic: true,
    },
  });
}

function buildRepairPlan(rows: WordEncodingRow[]) {
  const textOwner = new Map(rows.map((row) => [row.text, row.id]));
  const applicable: RepairPlanEntry[] = [];
  const blocked: Array<RepairPlanEntry & { reason: string }> = [];

  rows.forEach((row) => {
    const patch = buildWordRepairPatch(row);
    if (!patch) {
      return;
    }

    const entry: RepairPlanEntry = {
      wordId: row.id,
      text: row.text,
      updates: patch.updates,
    };

    const repairedText = patch.updates.text;
    if (repairedText) {
      const owner = textOwner.get(repairedText);
      if (owner && owner !== row.id) {
        blocked.push({
          ...entry,
          reason: `Repaired text would collide with existing word ${owner}`,
        });
        return;
      }
    }

    applicable.push(entry);
  });

  return {
    applicable,
    blocked,
  };
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (!options) {
    return;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: toSqliteUrl(options.databasePath),
      },
    },
  });

  try {
    const rows = await loadWordRows(prisma, options.limit);
    const plan = buildRepairPlan(rows);
    const report = {
      generatedAt: new Date().toISOString(),
      mode: options.apply ? 'apply' : 'dry-run',
      databasePath: options.databasePath,
      totalRows: rows.length,
      applicablePatchCount: plan.applicable.length,
      blockedPatchCount: plan.blocked.length,
      applicable: plan.applicable,
      blocked: plan.blocked,
    };

    mkdirSync(dirname(options.reportOutputPath), { recursive: true });
    writeFileSync(options.reportOutputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (!options.apply) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const entry of plan.applicable) {
        await tx.word.update({
          where: { id: entry.wordId },
          data: entry.updates as any,
        });
      }
    });

    console.log(
      JSON.stringify(
        {
          ...report,
          appliedPatchCount: plan.applicable.length,
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
