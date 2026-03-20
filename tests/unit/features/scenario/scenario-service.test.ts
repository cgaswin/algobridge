import { describe, expect, it } from 'vitest';

import {
  getScenarioByPageUrl,
  getScenarioProviderMode,
} from '@/src/features/scenario/scenario-service';

describe('getScenarioByPageUrl', () => {
  it('uses dummy provider mode by default', () => {
    expect(getScenarioProviderMode()).toBe('dummy');
  });

  it('returns known dummy scenario for two-sum', async () => {
    const data = await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(data).not.toBeNull();
    expect(data?.problem.slug).toBe('two-sum');
    expect(data?.scenarios.length).toBeGreaterThan(0);
  });

  it('returns generated fallback scenario for unknown slug', async () => {
    const data = await getScenarioByPageUrl('https://leetcode.com/problems/made-up-problem/');

    expect(data).not.toBeNull();
    expect(data?.problem.slug).toBe('made-up-problem');
    expect(data?.scenarios[0]?.id).toBe('made-up-problem-generic-scenario');
  });

  it('returns null for unsupported website URL', async () => {
    const data = await getScenarioByPageUrl('https://example.com/some-path');

    expect(data).toBeNull();
  });
});
