import ReactDOM from 'react-dom/client';

import { createShadowRootUi } from '#imports';

import '@/assets/tailwind.css';
import {
  isOpenOverlayMessage,
  OVERLAY_OPEN_REQUESTED_EVENT,
} from '../src/shared/messaging';
import { dispatchLocationChanged } from '../src/shared/location-events';
import { logDebug } from '../src/shared/logger';
import { OverlayApp } from '../src/ui/overlay/OverlayApp';

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
