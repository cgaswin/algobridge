import { describe, expect, it } from 'vitest';

import { readHostTheme } from '@/src/ui/overlay/use-host-theme';

function rootWith(...classes: string[]): Element {
  return { classList: { contains: (name: string) => classes.includes(name) } } as Element;
}

describe('readHostTheme', () => {
  it('follows the dark class LeetCode sets on <html>', () => {
    expect(readHostTheme(rootWith('dark'))).toBe('dark');
  });

  it('follows the light class', () => {
    expect(readHostTheme(rootWith('light'))).toBe('light');
  });
});
