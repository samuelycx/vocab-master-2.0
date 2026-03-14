import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const mockGetLearnedWords = vi.fn();

vi.mock('../api.js', () => ({
  API: {
    getLearnedWords: mockGetLearnedWords,
  },
}));

vi.mock('../state.js', () => ({
  GameState: {
    user: { id: 'user-1' },
  },
}));

describe('VocabularyList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLearnedWords.mockResolvedValue({
      data: [
        {
          id: 'record-1',
          status: 'MASTERED',
          repetition: 4,
          nextReview: '2026-03-13T00:00:00.000Z',
          word: { word: 'alpha', partOfSpeech: 'n.', meanings: '["含义1"]' },
        },
      ],
      total: 1,
      page: 1,
      lastPage: 1,
    });
  });

  it('loads learned words through authenticated api without user id', async () => {
    const { default: VocabularyList } = await import('./VocabularyList.vue');
    mount(VocabularyList, { props: { onBack: vi.fn() } });
    await Promise.resolve();
    await nextTick();

    expect(mockGetLearnedWords).toHaveBeenCalledWith(1, 20, '');
  });
});
