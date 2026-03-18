import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  auditWordRows,
  renderEncodingAuditMarkdown,
  type WordEncodingRow,
} from '../src/worddata/encoding-audit';

interface AuditCliOptions {
  databasePath: string;
  jsonOutputPath: string;
  markdownOutputPath: string;
  limit?: number;
}

function printHelp() {
  console.log(`Usage: npx ts-node scripts/audit-worddata.ts [options]

Options:
  --database <path>         SQLite database path. Falls back to DATABASE_URL when omitted.
  --json-output <path>      JSON report output path.
  --markdown-output <path>  Markdown report output path.
  --limit <number>          Optional max Word rows to scan.
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

function parseCliOptions(argv: string[]): AuditCliOptions | null {
  if (argv.includes('--help')) {
    printHelp();
    return null;
  }

  const jsonOutputPath = resolve(
    parseArgValue(argv, '--json-output') ?? 'artifacts/worddata-encoding/audit-report.json',
  );
  const markdownOutputPath = resolve(
    parseArgValue(argv, '--markdown-output') ??
      'artifacts/worddata-encoding/WORDDATA_ENCODING_AUDIT.md',
  );
  const limitValue = parseArgValue(argv, '--limit');
  const limit = limitValue ? Number(limitValue) : undefined;
  if (limitValue && (!Number.isInteger(limit) || (limit ?? 0) <= 0)) {
    throw new Error('--limit must be a positive integer');
  }

  return {
    databasePath: resolveDatabasePath(parseArgValue(argv, '--database')),
    jsonOutputPath,
    markdownOutputPath,
    limit,
  };
}

async function loadWordRows(databasePath: string, limit?: number): Promise<WordEncodingRow[]> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: toSqliteUrl(databasePath),
      },
    },
  });

  try {
    return await prisma.word.findMany({
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
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (!options) {
    return;
  }

  const rows = await loadWordRows(options.databasePath, options.limit);
  const report = auditWordRows(rows);
  const markdown = renderEncodingAuditMarkdown(report, options.databasePath);

  mkdirSync(dirname(options.jsonOutputPath), { recursive: true });
  mkdirSync(dirname(options.markdownOutputPath), { recursive: true });
  writeFileSync(options.jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(options.markdownOutputPath, `${markdown}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        databasePath: options.databasePath,
        totalRows: report.totalRows,
        affectedWordCount: report.affectedWordCount,
        issueCount: report.issueCount,
        jsonOutputPath: options.jsonOutputPath,
        markdownOutputPath: options.markdownOutputPath,
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
