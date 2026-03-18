# Worddata Encoding Audit

## Purpose

This audit template documents how we scan the `Word` table for encoding issues before any repair is attempted.

## Rules Covered

- `replacement_character`: field contains `�` / `\uFFFD`
- `invalid_json`: `meanings` or `examples` cannot be parsed as JSON
- `mojibake_fragment`: field contains known bad fragments such as `Ã©` or `â€™`
- `control_character`: field contains unexpected control characters

## Recommended Command

```bash
cd server
npx ts-node scripts/audit-worddata.ts \
  --database ./prisma/dev.db \
  --json-output ./artifacts/worddata-encoding/audit-report.json \
  --markdown-output ./artifacts/worddata-encoding/WORDDATA_ENCODING_AUDIT.md
```

## Output Files

- `audit-report.json`: machine-readable full report
- `WORDDATA_ENCODING_AUDIT.md`: markdown summary for review and release notes

## Findings Template

- Scanned at:
- Data source:
- Total rows:
- Affected words:
- Total issues:

### Rule Summary

- replacement_character:
- invalid_json:
- mojibake_fragment:
- control_character:

### Notes

- Confirm whether the source DB is a fresh backup before acting on the report.
- Treat the audit as evidence for the repair plan, not as an auto-apply trigger.
