import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock('wxt/browser', () => {
  return {
    browser: {
      storage: {
        local: {
          get: mockGet,
          set: mockSet,
        },
      },
    },
  };
});

describe('feedback storage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockSet.mockReset();
  });

  it('returns null when no vote exists for slug', async () => {
    const { getHelpfulnessVote, FEEDBACK_STORAGE_KEY } = await import(
      '@/src/features/feedback/storage'
    );

    mockGet.mockResolvedValue({ [FEEDBACK_STORAGE_KEY]: {} });

    const vote = await getHelpfulnessVote('two-sum');

    expect(vote).toBeNull();
  });

  it('saves vote record in local storage', async () => {
    const { saveHelpfulnessVote, FEEDBACK_STORAGE_KEY } = await import(
      '@/src/features/feedback/storage'
    );

    mockGet.mockResolvedValue({ [FEEDBACK_STORAGE_KEY]: {} });
    mockSet.mockResolvedValue(undefined);

    await saveHelpfulnessVote('two-sum', 'yes');

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        [FEEDBACK_STORAGE_KEY]: expect.objectContaining({
          'two-sum': expect.objectContaining({
            slug: 'two-sum',
            vote: 'yes',
          }),
        }),
      }),
    );
  });

  it('returns existing stored vote for slug', async () => {
    const { getHelpfulnessVote, FEEDBACK_STORAGE_KEY } = await import(
      '@/src/features/feedback/storage'
    );

    mockGet.mockResolvedValue({
      [FEEDBACK_STORAGE_KEY]: {
        'two-sum': {
          slug: 'two-sum',
          vote: 'no',
          updatedAt: 123,
        },
      },
    });

    const vote = await getHelpfulnessVote('two-sum');

    expect(vote).toBe('no');
  });
});
