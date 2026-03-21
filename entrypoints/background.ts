import {
  createOpenOverlayMessage,
  isRequestProblemInsightsMessage,
  OPEN_OVERLAY_MESSAGE_TYPE,
} from '../src/shared/messaging';
import { logDebug, logWarn } from '../src/shared/logger';
import {
  PROBLEM_INSIGHTS_API_BASE_URL,
  PROBLEM_INSIGHTS_API_PATH,
} from '../src/features/scenario/config';

function getInsightsApiUrl(): string {
  return new URL(PROBLEM_INSIGHTS_API_PATH, PROBLEM_INSIGHTS_API_BASE_URL).toString();
}

export default defineBackground(() => {
  logDebug('background initialized', { extensionId: browser.runtime.id });

  browser.runtime.onMessage.addListener((message) => {
    if (!isRequestProblemInsightsMessage(message)) {
      return;
    }

    const endpoint = getInsightsApiUrl();
    const body = {
      url: message.payload.url,
    };

    logDebug('background received backend request relay message', {
      endpoint,
      body,
      bodyTransport: 'json-content-type',
    });

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        let parsedBody: unknown;
        try {
          parsedBody = await response.json();
        } catch {
          logWarn('background fetch returned non-JSON response', {
            endpoint,
            status: response.status,
          });
          return {
            ok: false,
            status: response.status,
            error: 'Backend returned non-JSON response.',
          };
        }

        return {
          ok: true,
          status: response.status,
          body: parsedBody,
        };
      })
      .catch((error: unknown) => {
        logWarn('background fetch failed', {
          endpoint,
          error,
        });

        return {
          ok: false,
          error:
            error instanceof Error && error.message
              ? error.message
              : 'Network request failed.',
        };
      });
  });

  const toolbarAction = browser.action ?? browser.browserAction;
  if (toolbarAction?.onClicked == null) {
    logWarn('toolbar action API unavailable in this browser context');
    return;
  }

  toolbarAction.onClicked.addListener(async (tab) => {
    logDebug('toolbar icon clicked', {
      tabId: tab.id,
      tabUrl: tab.url,
    });

    if (tab.id == null) {
      logWarn('ignoring toolbar click because tab ID is missing');
      return;
    }

    try {
      await browser.tabs.sendMessage(tab.id, createOpenOverlayMessage());
      logDebug('sent open-overlay message to tab', {
        tabId: tab.id,
        type: OPEN_OVERLAY_MESSAGE_TYPE,
      });
    } catch (error) {
      logWarn('failed to send message to content script', {
        tabId: tab.id,
        type: OPEN_OVERLAY_MESSAGE_TYPE,
        error,
      });
    }
  });
});
