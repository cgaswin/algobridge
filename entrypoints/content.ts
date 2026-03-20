import {
  isOpenOverlayMessage,
  OVERLAY_OPEN_REQUESTED_EVENT,
} from '../src/shared/messaging';

export default defineContentScript({
  matches: ['*://leetcode.com/problems/*'],
  main(ctx) {
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
