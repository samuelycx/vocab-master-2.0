import {
  auditWordRow,
  auditWordRows,
  type WordEncodingRow,
} from './encoding-audit';
import {
  repairFieldValue,
  repairJsonEncodedField,
} from './encoding-repair';

describe('worddata encoding audit toolkit', () => {
  const baseRow: WordEncodingRow = {
    id: 'word-1',
    text: 'cafe',
    phonetic: null,
    partOfSpeech: 'n.',
    meanings: '["coffee shop"]',
    examples: '["A small cafe."]',
    mnemonic: null,
  };

  it('detects replacement characters in plain text fields', () => {
    const issues = auditWordRow({
      ...baseRow,
      text: 'caf�',
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'text',
          ruleId: 'replacement_character',
        }),
      ]),
    );
  });

  it('detects invalid JSON in meanings and examples', () => {
    const issues = auditWordRow({
      ...baseRow,
      meanings: '["coffee shop"',
      examples: '{"oops":',
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'meanings',
          ruleId: 'invalid_json',
        }),
        expect.objectContaining({
          field: 'examples',
          ruleId: 'invalid_json',
        }),
      ]),
    );
  });

  it('detects mojibake fragments in scalar and JSON fields', () => {
    const issues = auditWordRow({
      ...baseRow,
      text: 'cafÃ©',
      meanings: '["Itâ€™s a cafe"]',
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'text',
          ruleId: 'mojibake_fragment',
          snippet: 'cafÃ©',
        }),
        expect.objectContaining({
          field: 'meanings',
          ruleId: 'mojibake_fragment',
          snippet: 'Itâ€™s a cafe',
        }),
      ]),
    );
  });

  it('summarizes counts across rows', () => {
    const report = auditWordRows([
      {
        ...baseRow,
        id: 'word-1',
        text: 'caf�',
      },
      {
        ...baseRow,
        id: 'word-2',
        text: 'cafÃ©',
      },
    ]);

    expect(report.totalRows).toBe(2);
    expect(report.affectedWordCount).toBe(2);
    expect(report.summaryByRule.replacement_character).toBe(1);
    expect(report.summaryByRule.mojibake_fragment).toBe(1);
  });
});

describe('worddata encoding repair helpers', () => {
  it('repairs known mojibake fragments conservatively', () => {
    expect(repairFieldValue('cafÃ©')).toEqual(
      expect.objectContaining({
        changed: true,
        value: 'café',
      }),
    );

    expect(repairFieldValue('Itâ€™s ready')).toEqual(
      expect.objectContaining({
        changed: true,
        value: 'It’s ready',
      }),
    );
  });

  it('repairs mojibake inside JSON string arrays', () => {
    expect(repairJsonEncodedField('["Itâ€™s ready","cafÃ©"]')).toEqual(
      expect.objectContaining({
        changed: true,
        value: '["It’s ready","café"]',
      }),
    );
  });

  it('does not auto-repair replacement characters or invalid JSON payloads', () => {
    expect(repairFieldValue('caf�')).toEqual(
      expect.objectContaining({
        changed: false,
        value: 'caf�',
      }),
    );

    expect(repairJsonEncodedField('["broken"')).toEqual(
      expect.objectContaining({
        changed: false,
        value: '["broken"',
      }),
    );
  });
});
