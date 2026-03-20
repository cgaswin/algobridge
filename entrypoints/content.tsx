import ReactDOM from 'react-dom/client';

import { createShadowRootUi } from '#imports';

import '@/assets/tailwind.css';
import {
  isOpenOverlayMessage,
  OVERLAY_OPEN_REQUESTED_EVENT,
} from '../src/shared/messaging';
import { OverlayApp } from '../src/ui/overlay/OverlayApp';

export default defineContentScript({
  matches: ['*://leetcode.com/problems/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
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

    const handleRuntimeMessage = (message: unknown) => {
      if (!isOpenOverlayMessage(message)) {
        return;
      }

      window.dispatchEvent(new CustomEvent(OVERLAY_OPEN_REQUESTED_EVENT));
    };

    browser.runtime.onMessage.addListener(handleRuntimeMessage);
    ctx.onInvalidated(() => {
      browser.runtime.onMessage.removeListener(handleRuntimeMessage);
    });
  },
});
