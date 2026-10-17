export const NETWORK_ERROR_MESSAGE =
  "Can't reach the AlgoBridge service right now. Check your connection and try again.";

export const GENERIC_ERROR_MESSAGE = 'Something went wrong loading this problem. Please try again.';

// Raw transport errors from fetch / the background relay that mean the
// service could not be reached at all.
const NETWORK_ERROR_PATTERNS = [
  /failed to fetch/i,
  /networkerror/i,
  /network request failed/i,
  /load failed/i,
  /could not establish connection/i,
  /receiving end does not exist/i,
];

const INTERNAL_ERROR_PATTERNS = [
  /response shape is invalid/i,
  /non-json response/i,
  /unable to connect to insights service/i,
];

export function toFriendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : '';
  if (!message) {
    return GENERIC_ERROR_MESSAGE;
  }

  if (NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return GENERIC_ERROR_MESSAGE;
  }

  // Remaining messages come from the API's error envelope and are user-facing.
  return message;
}
