import {
  collectStringValues,
  countEncodingHints,
  findControlCharacters,
  findMojibakeFragments,
  hasReplacementCharacter,
  tryParseJsonValue,
} from './encoding-rules';
import type { WordEncodingField, WordEncodingRow } from './encoding-audit';

export interface EncodingRepairResult {
  changed: boolean;
  value: string;
  reason?: string;
}

export interface WordEncodingRepairPatch {
  wordId: string;
  updates: Partial<Record<WordEncodingField, string>>;
}

const CP1252_EXTRA_BYTES: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f,
};

function decodeCp1252AsUtf8(value: string): string | null {
  const bytes: number[] = [];
  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint == null) {
      return null;
    }

    if (codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }

    const extraByte = CP1252_EXTRA_BYTES[char];
    if (extraByte == null) {
      return null;
    }
    bytes.push(extraByte);
  }

  return Buffer.from(bytes).toString('utf8');
}

function isSafeReplacement(original: string, repaired: string): boolean {
  if (!repaired || repaired === original) {
    return false;
  }

  if (hasReplacementCharacter(original)) {
    return false;
  }

  if (hasReplacementCharacter(repaired)) {
    return false;
  }

  if (findControlCharacters(repaired).length > 0) {
    return false;
  }

  return countEncodingHints(repaired) < countEncodingHints(original);
}

export function repairFieldValue(rawValue?: string | null): EncodingRepairResult {
  const value = String(rawValue ?? '');
  if (!value || hasReplacementCharacter(value) || findMojibakeFragments(value).length === 0) {
    return {
      changed: false,
      value,
    };
  }

  const repaired = decodeCp1252AsUtf8(value);
  if (!repaired) {
    return {
      changed: false,
      value,
    };
  }
  if (!isSafeReplacement(value, repaired)) {
    return {
      changed: false,
      value,
    };
  }

  return {
    changed: true,
    value: repaired,
    reason: 'latin1_to_utf8',
  };
}

export function repairJsonEncodedField(rawValue?: string | null): EncodingRepairResult {
  const value = String(rawValue ?? '');
  if (!value) {
    return {
      changed: false,
      value,
    };
  }

  const parsed = tryParseJsonValue(value);
  if (!parsed.valid) {
    return {
      changed: false,
      value,
    };
  }

  let changed = false;

  const rewrite = (input: unknown): unknown => {
    if (typeof input === 'string') {
      const repaired = repairFieldValue(input);
      changed ||= repaired.changed;
      return repaired.value;
    }

    if (Array.isArray(input)) {
      return input.map((entry) => rewrite(entry));
    }

    return input;
  };

  const nextValue = rewrite(parsed.parsed);
  if (!changed) {
    return {
      changed: false,
      value,
    };
  }

  return {
    changed: true,
    value: JSON.stringify(nextValue),
    reason: 'json_string_repair',
  };
}

export function buildWordRepairPatch(row: WordEncodingRow): WordEncodingRepairPatch | null {
  const updates: Partial<Record<WordEncodingField, string>> = {};

  const scalarFields: WordEncodingField[] = ['text', 'phonetic', 'partOfSpeech', 'mnemonic'];
  scalarFields.forEach((field) => {
    const repaired = repairFieldValue(row[field]);
    if (repaired.changed) {
      updates[field] = repaired.value;
    }
  });

  const jsonFields: WordEncodingField[] = ['meanings', 'examples'];
  jsonFields.forEach((field) => {
    const repaired = repairJsonEncodedField(row[field]);
    if (repaired.changed) {
      updates[field] = repaired.value;
    }
  });

  if (Object.keys(updates).length === 0) {
    return null;
  }

  return {
    wordId: row.id,
    updates,
  };
}

export function summarizeRepairableStrings(values: string[]): number {
  return collectStringValues(values).filter((value) => repairFieldValue(value).changed).length;
}
