# Worddata Repair Runbook

## Goal

Use the repository repair toolkit to fix conservative, known-safe encoding issues in the `Word` table after an audit report has been reviewed.

## Guardrails

- Always back up the SQLite database before any write.
- Run `audit-worddata.ts` first and review the findings.
- Run `repair-worddata.ts` in dry-run mode before `--apply`.
- Treat blocked patches as manual follow-up items.

## Step 1: Back Up The Database

```bash
sqlite3 "./prisma/dev.db" ".backup './artifacts/worddata-encoding/worddata-pre-repair.sqlite'"
```

## Step 2: Generate The Audit Report

```bash
cd server
npx ts-node scripts/audit-worddata.ts \
  --database ./prisma/dev.db \
  --json-output ./artifacts/worddata-encoding/audit-report.json \
  --markdown-output ./artifacts/worddata-encoding/WORDDATA_ENCODING_AUDIT.md
```

## Step 3: Preview Repair Patches

```bash
cd server
npx ts-node scripts/repair-worddata.ts \
  --database ./prisma/dev.db \
  --report-output ./artifacts/worddata-encoding/repair-report.json \
  --dry-run
```

Review:

- `applicable`: patches that can be applied automatically
- `blocked`: repairs skipped because they could collide with existing data

## Step 4: Apply Approved Repairs

```bash
cd server
npx ts-node scripts/repair-worddata.ts \
  --database ./prisma/dev.db \
  --report-output ./artifacts/worddata-encoding/repair-report.json \
  --apply
```

## Step 5: Re-run The Audit

```bash
cd server
npx ts-node scripts/audit-worddata.ts \
  --database ./prisma/dev.db \
  --json-output ./artifacts/worddata-encoding/audit-report.after.json \
  --markdown-output ./artifacts/worddata-encoding/WORDDATA_ENCODING_AUDIT.after.md
```

## Manual Follow-up

- Review any remaining `replacement_character` findings by hand.
- Review any `invalid_json` findings by hand.
- Review any `blocked` repair entries before editing them manually.
