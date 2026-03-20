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
    },
    scenarios: [
      {
        id: 'two-sum-inventory-credit',
        title: 'E-commerce Inventory Matching',
        narrative:
          'When a customer applies store credit, the checkout engine can quickly find a pair of cart items whose prices exactly match the credit amount.',
        impact: 'Reduces search from O(n^2) to O(n)',
      },
      {
        id: 'two-sum-banking-alerts',
        title: 'Fraud Alert Pairing in Banking',
        narrative:
          'A fraud pipeline can pair incoming transactions that sum to a suspicious transfer threshold and flag the account for manual review.',
        impact: 'Enables near real-time suspicious pair detection',
      },
    ],
  },
  'best-time-to-buy-and-sell-stock': {
    problem: {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'easy',
    },
    scenarios: [
      {
        id: 'stock-dynamic-pricing',
        title: 'Dynamic Pricing Optimization',
        narrative:
          'Pricing teams can compute the best margin window from historical supplier costs and retail prices before launching promotions.',
        impact: 'Finds best margin window in a single pass',
      },
    ],
  },
};

function buildFallbackScenario(slug: string): ProblemScenarioData {
  return {
    problem: {
      slug,
      title: formatProblemTitleFromSlug(slug),
      difficulty: 'medium',
    },
    scenarios: [
      {
        id: `${slug}-generic-scenario`,
        title: 'System Optimization Use Case',
        narrative:
          'This algorithm can be applied in a backend service to improve response latency when matching constraints over large datasets.',
        impact: 'Improves throughput and keeps latency predictable',
      },
    ],
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
