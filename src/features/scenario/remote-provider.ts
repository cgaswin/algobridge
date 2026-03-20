import {
  extractLeetCodeProblemSlug,
  formatProblemTitleFromSlug,
} from '@/src/features/leetcode/problem-url';

import type { ProblemScenarioData, ScenarioProvider, ScenarioQuery } from './types';

function buildPlaceholderResponse(url: string, slug: string): ProblemScenarioData {
  return {
    problem: {
      slug,
      title: formatProblemTitleFromSlug(slug),
      difficulty: 'medium',
    },
    scenarios: [
      {
        id: `${slug}-remote-placeholder`,
        title: 'Remote Provider Placeholder',
        narrative:
          `Backend integration placeholder: this request would send only the current URL (${url}) and render backend-generated scenarios.`,
        impact: 'Backend provider contract is wired and ready',
      },
    ],
  };
}

export class RemoteScenarioProvider implements ScenarioProvider {
  async getByUrl(query: ScenarioQuery): Promise<ProblemScenarioData | null> {
    const slug = extractLeetCodeProblemSlug(query.url);
    if (!slug) {
      return null;
    }

    return buildPlaceholderResponse(query.url, slug);
  }
}
