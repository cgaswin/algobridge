import {
  extractLeetCodeProblemSlug,
  formatProblemTitleFromSlug,
} from '@/src/features/leetcode/problem-url';

import type { ProblemScenarioData, ScenarioProvider, ScenarioQuery } from './types';

const DUMMY_SCENARIO_BY_SLUG: Record<string, ProblemScenarioData> = {
  'two-sum': {
    problem: {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      tags: ['Array', 'Hash Table'],
    },
    insight: {
      useCase:
        'When a customer applies store credit, the checkout engine finds a pair of cart items whose prices exactly match the credit amount.',
      systemExamples: [
        'E-commerce checkout — matching item pairs to a gift card balance',
        'Banking fraud pipelines — pairing transactions that sum to a reporting threshold',
      ],
      explanation:
        'A hash map of seen values turns the O(n^2) pair search into a single O(n) pass, which keeps matching fast on large carts and transaction streams.',
    },
  },
  'best-time-to-buy-and-sell-stock': {
    problem: {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'easy',
      tags: ['Array', 'Dynamic Programming'],
    },
    insight: {
      useCase:
        'Pricing teams look for the widest margin window between historical supplier costs and later retail prices before launching promotions.',
      systemExamples: [
        'Retail pricing tools — finding the best buy/sell window in price history',
        'Trading dashboards — showing the maximum single-trade gain over a period',
      ],
      explanation:
        'Tracking the running minimum finds the best margin in one O(n) pass instead of comparing every pair of days.',
    },
  },
};

function buildFallbackScenario(slug: string): ProblemScenarioData {
  return {
    problem: {
      slug,
      title: formatProblemTitleFromSlug(slug),
      difficulty: null,
      tags: [],
    },
    insight: {
      useCase:
        'This algorithm can be applied in a backend service to improve response latency when matching constraints over large datasets.',
      systemExamples: ['Backend services — matching constraints over large datasets'],
      explanation: 'Choosing the right technique keeps throughput high and latency predictable.',
    },
  };
}

export class DummyScenarioProvider implements ScenarioProvider {
  async getByUrl(query: ScenarioQuery): Promise<ProblemScenarioData | null> {
    const slug = extractLeetCodeProblemSlug(query.url);
    if (!slug) {
      return null;
    }

    return DUMMY_SCENARIO_BY_SLUG[slug] ?? buildFallbackScenario(slug);
  }
}
