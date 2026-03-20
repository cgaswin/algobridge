import { describe, expect, it } from 'vitest';

import {
  createRequestProblemInsightsMessage,
  createOpenOverlayMessage,
  isProblemInsightsResponseMessage,
  isRequestProblemInsightsMessage,
  isOpenOverlayMessage,
  OPEN_OVERLAY_MESSAGE_TYPE,
  OVERLAY_OPEN_REQUESTED_EVENT,
  REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
} from '../../../src/shared/messaging';

describe('messaging contract', () => {
  it('creates open overlay message with expected type', () => {
    expect(createOpenOverlayMessage()).toEqual({
      type: OPEN_OVERLAY_MESSAGE_TYPE,
    });
  });

  it('accepts only valid overlay message objects', () => {
    expect(isOpenOverlayMessage({ type: OPEN_OVERLAY_MESSAGE_TYPE })).toBe(true);
    expect(isOpenOverlayMessage({ type: 'another-type' })).toBe(false);
    expect(isOpenOverlayMessage({})).toBe(false);
    expect(isOpenOverlayMessage(null)).toBe(false);
    expect(isOpenOverlayMessage('algobridge/open-overlay')).toBe(false);
  });

  it('uses stable window event name for opening overlays', () => {
    expect(OVERLAY_OPEN_REQUESTED_EVENT).toBe('algobridge:overlay-open-requested');
  });

  it('creates backend request relay message with URL payload', () => {
    expect(createRequestProblemInsightsMessage('https://leetcode.com/problems/two-sum/')).toEqual(
      {
        type: REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
        payload: {
          url: 'https://leetcode.com/problems/two-sum/',
        },
      },
    );
  });

  it('validates backend request relay message shape', () => {
    expect(
      isRequestProblemInsightsMessage({
        type: REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
        payload: { url: 'https://leetcode.com/problems/two-sum/' },
      }),
    ).toBe(true);
    expect(
      isRequestProblemInsightsMessage({
        type: REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
        payload: { url: 123 },
      }),
    ).toBe(false);
  });

  it('validates backend relay response message shape', () => {
    expect(
      isProblemInsightsResponseMessage({
        ok: true,
        status: 200,
        body: { success: true, data: {}, error: null },
      }),
    ).toBe(true);

    expect(
      isProblemInsightsResponseMessage({
        ok: false,
        error: 'NetworkError when attempting to fetch resource.',
      }),
    ).toBe(true);

    expect(
      isProblemInsightsResponseMessage({
        ok: true,
        body: {},
      }),
    ).toBe(false);
  });
});
