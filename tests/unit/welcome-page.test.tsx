import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WelcomePage } from '@/src/ui/welcome/WelcomePage';

function renderWelcome(search = '', dark = false) {
  vi.stubGlobal('window', { location: { search } });
  vi.stubGlobal('document', { documentElement: { classList: { contains: () => dark } } });
  return renderToStaticMarkup(<WelcomePage />);
}

afterEach(() => vi.unstubAllGlobals());

describe('welcome page', () => {
  it('renders the real destination and labels the local interactive preview', () => {
    const html = renderWelcome();
    expect(html).toContain('href="https://leetcode.com/problems/two-sum/"');
    expect(html).toContain('aria-expanded="true" aria-controls="welcome-preview"');
    expect(html).toContain('Example data');
    expect(html).toContain('Preview votes aren&#x27;t saved.');
    expect(html).toContain('What leaves my browser?');
    expect(html).toContain('Switch to dark theme');
    expect(html).not.toContain('role="status"');
  });

  it('keeps the unsupported-page guidance and respects the initial dark theme', () => {
    const html = renderWelcome('?reason=unsupported-page', true);
    expect(html).toContain('role="status"');
    expect(html).toContain('refresh that tab and try again.');
    expect(html).toContain('Switch to light theme');
  });
});
