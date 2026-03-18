import {
  collectStringValues,
  findControlCharacters,
  findMojibakeFragments,
  hasReplacementCharacter,
  looksLikeJsonField,
  type EncodingRuleId,
  tryParseJsonValue,
} from './encoding-rules';

export interface WordEncodingRow {
  id: string;
  text: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  meanings?: string | null;
  examples?: string | null;
  mnemonic?: string | null;
}

export type WordEncodingField =
  | 'text'
  | 'phonetic'
  | 'partOfSpeech'
  | 'meanings'
  | 'examples'
  | 'mnemonic';

export interface WordEncodingIssue {
  wordId: string;
  wordText: string;
  field: WordEncodingField;
  ruleId: EncodingRuleId;
  snippet: string;
  detail: string;
}

export interface WordEncodingAuditReport {
  scannedAt: string;
  totalRows: number;
  issueCount: number;
  affectedWordCount: number;
  summaryByRule: Partial<Record<EncodingRuleId, number>>;
  issues: WordEncodingIssue[];
}

const AUDIT_FIELDS: WordEncodingField[] = [
  'text',
  'phonetic',
  'partOfSpeech',
  'meanings',
  'examples',
  'mnemonic',
];

function pushIssue(
  issues: WordEncodingIssue[],
  row: WordEncodingRow,
  field: WordEncodingField,
  ruleId: EncodingRuleId,
  snippet: string,
  detail: string,
) {
  issues.push({
    wordId: row.id,
    wordText: row.text,
    field,
    ruleId,
    snippet,
    detail,
  });
}

function auditStringValue(
  issues: WordEncodingIssue[],
  row: WordEncodingRow,
  field: WordEncodingField,
  value: string,
) {
  if (hasReplacementCharacter(value)) {
    pushIssue(
      issues,
      row,
      field,
      'replacement_character',
      value,
      'Contains Unicode replacement characters.',
    );
  }

  const mojibakeFragments = findMojibakeFragments(value);
  if (mojibakeFragments.length > 0) {
    pushIssue(
      issues,
      row,
      field,
      'mojibake_fragment',
      value,
      `Contains mojibake fragments: ${mojibakeFragments.join(', ')}`,
    );
  }

  const controlCharacters = findControlCharacters(value);
  if (controlCharacters.length > 0) {
    pushIssue(
      issues,
      row,
      field,
      'control_character',
      value,
      `Contains control characters: ${controlCharacters.join(', ')}`,
    );
  }
}

export function auditWordRow(row: WordEncodingRow): WordEncodingIssue[] {
  const issues: WordEncodingIssue[] = [];

  AUDIT_FIELDS.forEach((field) => {
    const rawValue = row[field];
    if (rawValue == null || rawValue === '') {
      return;
    }

    const value = String(rawValue);

    if (looksLikeJsonField(field)) {
      const parsed = tryParseJsonValue(value);
      if (!parsed.valid) {
        pushIssue(
          issues,
          row,
          field,
          'invalid_json',
          value,
          parsed.error ?? 'Invalid JSON payload',
        );
        return;
      }

      collectStringValues(parsed.parsed).forEach((entry) =>
        auditStringValue(issues, row, field, entry),
      );
      return;
    }

    auditStringValue(issues, row, field, value);
  });

  return issues;
}

export function auditWordRows(rows: WordEncodingRow[]): WordEncodingAuditReport {
  const issues = rows.flatMap((row) => auditWordRow(row));
  const summaryByRule = issues.reduce<Partial<Record<EncodingRuleId, number>>>(
    (summary, issue) => {
      summary[issue.ruleId] = (summary[issue.ruleId] ?? 0) + 1;
      return summary;
    },
    {},
  );

  return {
    scannedAt: new Date().toISOString(),
    totalRows: rows.length,
    issueCount: issues.length,
    affectedWordCount: new Set(issues.map((issue) => issue.wordId)).size,
    summaryByRule,
    issues,
  };
}

export function renderEncodingAuditMarkdown(
  report: WordEncodingAuditReport,
  sourceLabel: string,
): string {
  const summaryLines = Object.entries(report.summaryByRule)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([ruleId, count]) => `- ${ruleId}: ${count}`);

  const issueRows = report.issues.map(
    (issue) =>
      `| ${issue.wordId} | ${issue.wordText} | ${issue.field} | ${issue.ruleId} | ${issue.snippet.replace(/\|/g, '\\|')} |`,
  );

  return [
    '# Worddata Encoding Audit',
    '',
    `- Scanned at: ${report.scannedAt}`,
    `- Data source: ${sourceLabel}`,
    `- Total rows: ${report.totalRows}`,
    `- Affected words: ${report.affectedWordCount}`,
    `- Total issues: ${report.issueCount}`,
    '',
    '## Rule Summary',
    ...(summaryLines.length > 0 ? summaryLines : ['- none']),
    '',
    '## Issue List',
    '',
    '| wordId | text | field | rule | snippet |',
    '| --- | --- | --- | --- | --- |',
    ...(issueRows.length > 0 ? issueRows : ['| - | - | - | - | - |']),
    '',
  ].join('\n');
}
