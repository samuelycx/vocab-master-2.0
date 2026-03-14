import { describe, expect, it } from 'vitest';
import { getAchievementIconById } from './achievement-icons.js';

describe('achievement icon helpers', () => {
  it('returns the shared mini-program svg path for a known achievement id', () => {
    expect(getAchievementIconById('growth_first_use')).toBe('/static/achievements/growth_first_use.svg');
  });

  it('falls back to default svg when the id is empty', () => {
    expect(getAchievementIconById('')).toBe('/static/achievements/default.svg');
  });
});
