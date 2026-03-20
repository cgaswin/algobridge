export const OPEN_OVERLAY_MESSAGE_TYPE = 'algobridge/open-overlay' as const;
export const OVERLAY_OPEN_REQUESTED_EVENT =
  'algobridge:overlay-open-requested' as const;
export const REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE =
  'algobridge/request-problem-insights' as const;

export type OpenOverlayMessage = {
  type: typeof OPEN_OVERLAY_MESSAGE_TYPE;
};

export type RequestProblemInsightsMessage = {
  type: typeof REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE;
  payload: {
    url: string;
  };
};

export type ProblemInsightsResponseMessage =
  | {
      ok: true;
      status: number;
      body: unknown;
    }
  | {
      ok: false;
      status?: number;
      error: string;
    };

export function createOpenOverlayMessage(): OpenOverlayMessage {
  return {
    type: OPEN_OVERLAY_MESSAGE_TYPE,
  };
}

export function createRequestProblemInsightsMessage(
  url: string,
): RequestProblemInsightsMessage {
  return {
    type: REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE,
    payload: {
      url,
    },
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

export function isRequestProblemInsightsMessage(
  value: unknown,
): value is RequestProblemInsightsMessage {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    payload?: unknown;
  };

  return (
    candidate.type === REQUEST_PROBLEM_INSIGHTS_MESSAGE_TYPE &&
    typeof candidate.payload === 'object' &&
    candidate.payload != null &&
    typeof (candidate.payload as { url?: unknown }).url === 'string'
  );
}

export function isProblemInsightsResponseMessage(
  value: unknown,
): value is ProblemInsightsResponseMessage {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const candidate = value as {
    ok?: unknown;
    status?: unknown;
    body?: unknown;
    error?: unknown;
  };

  if (candidate.ok === true) {
    return typeof candidate.status === 'number' && 'body' in candidate;
  }

  if (candidate.ok === false) {
    return (
      typeof candidate.error === 'string' &&
      (candidate.status === undefined || typeof candidate.status === 'number')
    );
  }

  return false;
}
