import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Actions, GameState } from './state.js';

describe('Actions overlay queue', () => {
  beforeEach(() => {
    GameState.overlay.current = null;
    GameState.overlay.queue = [];
    vi.useFakeTimers();
  });

  it('handles closeOverlay when passed as an unbound callback', () => {
    const { closeOverlay } = Actions;

    Actions.showOverlay('levelUp', { level: 2 });
    expect(GameState.overlay.current).not.toBeNull();

    expect(() => {
      closeOverlay();
      vi.runOnlyPendingTimers();
    }).not.toThrow();
  });
});
