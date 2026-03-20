export const LOCATION_CHANGED_EVENT = 'algobridge:location-changed' as const;

export function dispatchLocationChanged(pathname: string): void {
  window.dispatchEvent(
    new CustomEvent(LOCATION_CHANGED_EVENT, {
      detail: {
        pathname,
      },
    }),
  );
}
