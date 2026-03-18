export type EncodingRuleId =
  | 'replacement_character'
  | 'invalid_json'
  | 'mojibake_fragment'
  | 'control_character';

export const KNOWN_MOJIBAKE_FRAGMENTS = [
  'Ã',
  'Â',
  'â€™',
  'â€œ',
  'â€\u009d',
  'â€“',
  'â€”',
  'â€¦',
] as const;

const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export function hasReplacementCharacter(value: string): boolean {
  return value.includes('\uFFFD');
}

export function findControlCharacters(value: string): string[] {
  return value.match(CONTROL_CHAR_PATTERN) ?? [];
}

export function findMojibakeFragments(value: string): string[] {
  return KNOWN_MOJIBAKE_FRAGMENTS.filter((fragment) => value.includes(fragment));
}

export function looksLikeJsonField(field: string): boolean {
  return field === 'meanings' || field === 'examples';
}

export function tryParseJsonValue(raw: string): {
  valid: boolean;
  parsed?: unknown;
  error?: string;
} {
  try {
    return {
      valid: true,
      parsed: JSON.parse(raw),
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

export function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStringValues(entry));
  }

  return [];
}

export function countEncodingHints(value: string): number {
  return Number(hasReplacementCharacter(value)) +
    findMojibakeFragments(value).length +
    findControlCharacters(value).length;
}
