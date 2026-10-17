import ReactDOM from 'react-dom/client';

import { createShadowRootUi } from '#imports';

import '@/assets/tailwind.css';
import {
  isOpenOverlayMessage,
  OVERLAY_OPEN_REQUESTED_EVENT,
} from '../src/shared/messaging';
import { dispatchLocationChanged } from '../src/shared/location-events';
import { logDebug } from '../src/shared/logger';
import { dispatchChipPresenceChanged, INLINE_CHIP_TAG } from '../src/shared/panel-events';
import { InlineChip } from '../src/ui/overlay/InlineChip';
import { OverlayApp } from '../src/ui/overlay/OverlayApp';

// LeetCode's chip row under the problem title (Easy, Topics, Companies, Hint).
const CHIP_ROW_SELECTOR = 'div:has(> [class*="text-difficulty-"])';

export default defineContentScript({
  matches: ['*://leetcode.com/*', '*://www.leetcode.com/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    logDebug('content script mounted', {
      url: window.location.href,
      pathname: window.location.pathname,
    });

    const ui = await createShadowRootUi(ctx, {
      name: 'algobridge-overlay',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      onMount: (container) => {
        const wrapper = document.createElement('div');
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<OverlayApp />);

        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
    logDebug('overlay UI mounted in shadow root');

    const chip = await createShadowRootUi(ctx, {
      name: INLINE_CHIP_TAG,
      position: 'inline',
      anchor: CHIP_ROW_SELECTOR,
      append: 'last',
      onMount: (container, _shadow, host) => {
        host.style.display = 'inline-flex';
        const root = ReactDOM.createRoot(container);
        root.render(<InlineChip />);
        dispatchChipPresenceChanged(true);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
        dispatchChipPresenceChanged(false);
      },
    });

    // LeetCode re-renders the description on navigation and tab switches.
    chip.autoMount();

    let lastPathname = window.location.pathname;

    const emitLocationChangeIfNeeded = () => {
      const nextPathname = window.location.pathname;
      if (nextPathname === lastPathname) {
        return;
      }

      lastPathname = nextPathname;
      logDebug('detected SPA route change', {
        pathname: nextPathname,
      });
      dispatchLocationChanged(nextPathname);
    };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function patchedPushState(...args) {
      originalPushState.apply(this, args);
      emitLocationChangeIfNeeded();
    };

    history.replaceState = function patchedReplaceState(...args) {
      originalReplaceState.apply(this, args);
      emitLocationChangeIfNeeded();
    };

    window.addEventListener('popstate', emitLocationChangeIfNeeded);

    const handleRuntimeMessage = (message: unknown) => {
      if (!isOpenOverlayMessage(message)) {
        return;
      }

      logDebug('received open-overlay runtime message');
      window.dispatchEvent(new CustomEvent(OVERLAY_OPEN_REQUESTED_EVENT));
    };

    browser.runtime.onMessage.addListener(handleRuntimeMessage);
    ctx.onInvalidated(() => {
      browser.runtime.onMessage.removeListener(handleRuntimeMessage);
      window.removeEventListener('popstate', emitLocationChangeIfNeeded);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    });
  },
});
