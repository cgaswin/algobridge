// Window events shared by the two content-script UIs (the inline chip and the
// panel), which live in separate shadow roots and React trees.
// Tag name of the inline chip's shadow host (the `name` given to createShadowRootUi).
export const INLINE_CHIP_TAG = 'algobridge-chip' as const;

export const PANEL_STATE_CHANGED_EVENT = 'algobridge:panel-state-changed' as const;
export const CHIP_PRESENCE_CHANGED_EVENT = 'algobridge:chip-presence-changed' as const;

export function dispatchPanelStateChanged(open: boolean): void {
  window.dispatchEvent(new CustomEvent(PANEL_STATE_CHANGED_EVENT, { detail: { open } }));
}

export function dispatchChipPresenceChanged(mounted: boolean): void {
  window.dispatchEvent(new CustomEvent(CHIP_PRESENCE_CHANGED_EVENT, { detail: { mounted } }));
}

export function readOpenDetail(event: Event): boolean {
  return Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
}

export function readMountedDetail(event: Event): boolean {
  return Boolean((event as CustomEvent<{ mounted?: boolean }>).detail?.mounted);
}
