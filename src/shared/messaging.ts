export const OPEN_OVERLAY_MESSAGE_TYPE = 'algobridge/open-overlay' as const;
export const OVERLAY_OPEN_REQUESTED_EVENT =
  'algobridge:overlay-open-requested' as const;

export type OpenOverlayMessage = {
  type: typeof OPEN_OVERLAY_MESSAGE_TYPE;
};

export function createOpenOverlayMessage(): OpenOverlayMessage {
  return {
    type: OPEN_OVERLAY_MESSAGE_TYPE,
  };
}

export function isOpenOverlayMessage(value: unknown): value is OpenOverlayMessage {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  return (
    'type' in value &&
    (value as { type?: unknown }).type === OPEN_OVERLAY_MESSAGE_TYPE
  );
}
