import { describe, expect, it } from 'vitest';

import {
  createOpenOverlayMessage,
  isOpenOverlayMessage,
  OPEN_OVERLAY_MESSAGE_TYPE,
  OVERLAY_OPEN_REQUESTED_EVENT,
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
});
