import {
  createOpenOverlayMessage,
  OPEN_OVERLAY_MESSAGE_TYPE,
} from '../src/shared/messaging';

export default defineBackground(() => {
  const toolbarAction = browser.action ?? browser.browserAction;
  if (toolbarAction?.onClicked == null) {
    console.warn('AlgoBridge: toolbar action API unavailable in this browser context.');
    return;
  }

  toolbarAction.onClicked.addListener(async (tab) => {
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
