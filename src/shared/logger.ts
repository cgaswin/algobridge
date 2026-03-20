const DEBUG_ENABLED =
  import.meta.env.DEV || import.meta.env.WXT_ENABLE_DEBUG_LOGS === 'true';

const PREFIX = '[AlgoBridge]';

function normalizePayload(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizePayload(item));
  }

  if (typeof value === 'object' && value != null) {
    const entries = Object.entries(value as Record<string, unknown>);
    return Object.fromEntries(entries.map(([key, item]) => [key, normalizePayload(item)]));
  }

  return value;
}

export function logDebug(message: string, payload?: unknown): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  if (payload === undefined) {
    console.debug(PREFIX, message);
    return;
  }

  console.debug(PREFIX, message, normalizePayload(payload));
}

export function logWarn(message: string, payload?: unknown): void {
  if (payload === undefined) {
    console.warn(PREFIX, message);
    return;
  }

  console.warn(PREFIX, message, normalizePayload(payload));
}

export function logError(message: string, payload?: unknown): void {
  if (payload === undefined) {
    console.error(PREFIX, message);
    return;
  }

  console.error(PREFIX, message, normalizePayload(payload));
}
