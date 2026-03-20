import {
  createOpenOverlayMessage,
  OPEN_OVERLAY_MESSAGE_TYPE,
} from '../src/shared/messaging';

export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id == null) {
      return;
    }

    try {
      await browser.tabs.sendMessage(tab.id, createOpenOverlayMessage());
    } catch (error) {
      console.warn('AlgoBridge: failed to send message to content script', {
        tabId: tab.id,
        type: OPEN_OVERLAY_MESSAGE_TYPE,
        error,
      });
    }
  });
});
