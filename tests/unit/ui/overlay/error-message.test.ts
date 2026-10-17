import { describe, expect, it } from 'vitest';

import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  toFriendlyErrorMessage,
} from '@/src/ui/overlay/error-message';

describe('toFriendlyErrorMessage', () => {
  it.each([
    'Failed to fetch',
    'NetworkError when attempting to fetch resource.',
    'Could not establish connection. Receiving end does not exist.',
  ])('maps transport error "%s" to the network message', (raw) => {
    expect(toFriendlyErrorMessage(new Error(raw))).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('hides internal shape errors', () => {
    expect(toFriendlyErrorMessage(new Error('Backend response shape is invalid.'))).toBe(
      GENERIC_ERROR_MESSAGE,
    );
  });

  it('keeps API envelope messages', () => {
    expect(toFriendlyErrorMessage(new Error('Failed to generate insights'))).toBe(
      'Failed to generate insights',
    );
  });

  it('falls back for non-errors and empty messages', () => {
    expect(toFriendlyErrorMessage('boom')).toBe(GENERIC_ERROR_MESSAGE);
    expect(toFriendlyErrorMessage(new Error(''))).toBe(GENERIC_ERROR_MESSAGE);
  });
});
