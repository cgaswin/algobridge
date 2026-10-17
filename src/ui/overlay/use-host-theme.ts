import * as React from 'react';

export type HostTheme = 'light' | 'dark';

// LeetCode toggles a `dark` / `light` class on <html>; fall back to the OS
// preference on pages that set neither.
export function readHostTheme(root: Element = document.documentElement): HostTheme {
  if (root.classList.contains('dark')) {
    return 'dark';
  }

  if (root.classList.contains('light')) {
    return 'light';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useHostTheme(): HostTheme {
  const [theme, setTheme] = React.useState<HostTheme>(() => readHostTheme());

  React.useEffect(() => {
    const update = () => setTheme(readHostTheme());

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener('change', update);

    return () => {
      observer.disconnect();
      media?.removeEventListener('change', update);
    };
  }, []);

  return theme;
}
