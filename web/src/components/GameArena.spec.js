import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPlayAudio = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockQuitSession = vi.fn();

vi.mock('../state.js', () => ({
  GameState: {
    game: { combo: 0 },
  },
}));

vi.mock('../engine.js', () => ({
  GameEngine: {
    playAudio: mockPlayAudio,
    submitAnswer: mockSubmitAnswer,
    quitSession: mockQuitSession,
    session: {
      currentIndex: 0,
      queue: ['alpha'],
      currentWord: {
        word: 'alpha',
        partOfSpeech: 'n.',
        examples: ['Alpha is the first letter.'],
      },
      currentExample: {
        original: 'Alpha is the first letter.',
        masked: '______ is the first letter.',
      },
      options: ['阿尔法', '贝塔'],
      correctOption: '阿尔法',
      selectedOption: null,
      isAnswered: false,
      isCorrect: false,
      timeLeft: 15,
    },
  },
}));

describe('GameArena', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the core mobile learning sections and supports answer click', async () => {
    const { default: GameArena } = await import('./GameArena.vue');
    const wrapper = mount(GameArena);

    expect(wrapper.get('[data-test="arena-header"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="arena-card"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="arena-options"]').exists()).toBe(true);

    await wrapper.get('[data-test="arena-option-0"]').trigger('click');
    expect(mockSubmitAnswer).toHaveBeenCalledWith('阿尔法');
  });
});
