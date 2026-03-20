import { describe, expect, it } from 'vitest';

import {
  extractLeetCodeProblemSlug,
  formatProblemTitleFromSlug,
} from '@/src/features/leetcode/problem-url';

describe('extractLeetCodeProblemSlug', () => {
  it('extracts slug from leetcode problem URL', () => {
    expect(extractLeetCodeProblemSlug('https://leetcode.com/problems/two-sum/')).toBe(
      'two-sum',
    );
  });

  it('returns null for non-leetcode URL', () => {
    expect(extractLeetCodeProblemSlug('https://example.com/problems/two-sum/')).toBeNull();
  });

  it('returns null for invalid URL', () => {
    expect(extractLeetCodeProblemSlug('not-a-url')).toBeNull();
  });
});

describe('formatProblemTitleFromSlug', () => {
  it('formats slug into title case words', () => {
    expect(formatProblemTitleFromSlug('best-time-to-buy-and-sell-stock')).toBe(
      'Best Time To Buy And Sell Stock',
    );
  });
});
