import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getScenarioByPageUrl,
  getScenarioProviderMode,
} from '@/src/features/scenario/scenario-service';
import {
  REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
  type RequestProblemInsightsMessage,
} from '@/src/shared/messaging';

const mockRuntimeSendMessage = vi.fn();
let sendMessageSpy: ReturnType<typeof vi.spyOn>;

describe('getScenarioByPageUrl', () => {
  beforeEach(() => {
    mockRuntimeSendMessage.mockReset();
    if (sendMessageSpy) {
      sendMessageSpy.mockRestore();
    }

    sendMessageSpy = vi
      .spyOn(browser.runtime, 'sendMessage')
      .mockImplementation(mockRuntimeSendMessage as typeof browser.runtime.sendMessage);
  });

  afterEach(() => {
    sendMessageSpy.mockRestore();
  });

  it('uses remote provider mode by default', () => {
    expect(getScenarioProviderMode()).toBe('remote');
  });

  it('calls backend with URL payload and expected endpoint', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          use_case: 'Inventory Pairing',
          explanation: 'Find matching pairs quickly.',
          system_examples: [],
        },
        error: null,
      },
    });

    await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(mockRuntimeSendMessage).toHaveBeenCalledTimes(1);
    expect(mockRuntimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
        payload: {
          url: 'https://leetcode.com/problems/two-sum/',
        },
      } satisfies RequestProblemInsightsMessage),
    );
  });

  it('returns error when background relay response shape is invalid', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      invalid: true,
    });

    await expect(
      getScenarioByPageUrl('https://leetcode.com/problems/two-sum/'),
    ).rejects.toThrow('Background relay response shape is invalid.');
  });

  it('maps successful backend response envelope into scenario data', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          use_case: 'Inventory Pairing',
          explanation: 'Find item pairs that hit an exact budget threshold quickly.',
          system_examples: ['cart matcher', 'credit utilization'],
        },
        error: null,
      },
    });

    const data = await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(data).not.toBeNull();
    expect(data?.problem.slug).toBe('two-sum');
    expect(data?.problem.difficulty).toBeNull();
    expect(data?.insight).toEqual({
      useCase: 'Inventory Pairing',
      systemExamples: ['cart matcher', 'credit utilization'],
      explanation: 'Find item pairs that hit an exact budget threshold quickly.',
    });
    expect(data?.insights).toEqual(
      expect.objectContaining({
        use_case: 'Inventory Pairing',
      }),
    );
  });

  it('uses problem metadata from the backend response', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          problem: {
            slug: 'two-sum',
            title: 'Two Sum',
            difficulty: 'Easy',
            tags: ['Array', 'Hash Table'],
          },
          use_case: 'Inventory Pairing',
          explanation: 'Hash lookups make it linear.',
          system_examples: ['Checkout — pairing items to a credit balance'],
        },
        error: null,
      },
    });

    const data = await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(data?.problem).toEqual({
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      tags: ['Array', 'Hash Table'],
    });
  });

  it('accepts system_examples cached as a single string', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        success: true,
        data: {
          use_case: 'Inventory Pairing',
          explanation: 'Hash lookups make it linear.',
          system_examples: 'Redis',
        },
        error: null,
      },
    });

    const data = await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(data?.insight.systemExamples).toEqual(['Redis']);
  });

  it('returns null when backend reports unsupported platform', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 400,
      body: {
        success: false,
        data: null,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: 'Only LeetCode problems are supported',
          details: {},
        },
      },
    });

    const data = await getScenarioByPageUrl('https://leetcode.com/problems/two-sum/');

    expect(data).toBeNull();
  });

  it('throws API message for handled backend errors', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: true,
      status: 500,
      body: {
        success: false,
        data: null,
        error: {
          code: 'LLM_FAILURE',
          message: 'Model inference failed',
          details: {},
        },
      },
    });

    await expect(
      getScenarioByPageUrl('https://leetcode.com/problems/two-sum/'),
    ).rejects.toThrow('Model inference failed');
  });

  it('throws network error when backend is unreachable', async () => {
    mockRuntimeSendMessage.mockResolvedValue({
      ok: false,
      error: 'NetworkError when attempting to fetch resource.',
    });

    await expect(
      getScenarioByPageUrl('https://leetcode.com/problems/two-sum/'),
    ).rejects.toThrow('NetworkError when attempting to fetch resource.');
  });

  it('returns null for non-leetcode URLs before calling backend', async () => {
    const data = await getScenarioByPageUrl('https://example.com/path');

    expect(data).toBeNull();
    expect(mockRuntimeSendMessage).not.toHaveBeenCalled();
  });
});
