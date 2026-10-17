import { ArrowRight, Keyboard, Lightbulb, MousePointerClick, PanelRight } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const SAMPLE_PROBLEM_URL = 'https://leetcode.com/problems/two-sum/';
const DEFAULT_SHORTCUT = 'Alt+Shift+A';

function useToggleShortcut(): string | null {
  const [shortcut, setShortcut] = React.useState<string | null>(DEFAULT_SHORTCUT);

  React.useEffect(() => {
    browser.commands
      ?.getAll()
      .then((commands) => {
        const toggle = commands.find(
          (command) =>
            command.name === '_execute_action' || command.name === '_execute_browser_action',
        );
        setShortcut(toggle?.shortcut || null);
      })
      .catch(() => {});
  }, []);

  return shortcut;
}

export function WelcomePage() {
  const shortcut = useToggleShortcut();
  const unsupportedPage =
    new URLSearchParams(window.location.search).get('reason') === 'unsupported-page';

  const steps = [
    {
      Icon: MousePointerClick,
      title: 'Open any LeetCode problem',
      body: 'AlgoBridge works on leetcode.com/problems/… pages.',
    },
    {
      Icon: PanelRight,
      title: 'Open the panel',
      body: 'Click the lightbulb tab on the right edge of the page, or the AlgoBridge toolbar icon.',
    },
    {
      Icon: Keyboard,
      title: shortcut ? `Or press ${shortcut}` : 'Or set a keyboard shortcut',
      body: shortcut
        ? 'The shortcut toggles the panel. Change it from your browser’s extension shortcuts page.'
        : 'Assign one from your browser’s extension shortcuts page.',
    },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-16 font-sans text-foreground antialiased">
      <div className="mx-auto flex max-w-xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm font-medium tracking-[0.08em] text-primary uppercase">
            <Lightbulb className="size-4" aria-hidden="true" />
            AlgoBridge
          </p>
          <h1 className="text-3xl leading-tight font-semibold">
            See where every LeetCode problem shows up in real systems.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            AlgoBridge adds a side panel to LeetCode problems with a real-world use case and named
            systems that rely on the same idea. The approach stays hidden until you ask for it.
          </p>
        </header>

        {unsupportedPage && (
          <div
            role="status"
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6"
          >
            AlgoBridge only runs on LeetCode problem pages. If you already have one open, refresh
            that tab and try again.
          </div>
        )}

        <ol className="flex flex-col gap-5">
          {steps.map(({ Icon, title, body }, index) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-4" aria-hidden="true" />
                <span className="sr-only">Step {index + 1}</span>
              </span>
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-base font-medium">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button asChild size="lg" className="w-fit">
          <a href={SAMPLE_PROBLEM_URL}>
            Try it on Two Sum
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </div>
    </main>
  );
}
