import { BookOpen } from 'lucide-react';
import * as React from 'react';

import type { HelpfulnessVote } from '@/src/features/feedback/types';
import { SAMPLE_SCENARIO } from '@/src/features/scenario/dummy-provider';
import { Panel } from '@/src/ui/overlay/Panel';

const SAMPLE_PROBLEM_URL = 'https://leetcode.com/problems/two-sum/';
const DEFAULT_SHORTCUT = 'Alt+Shift+A';

function useToggleShortcut(): string | null {
  const [shortcut, setShortcut] = React.useState<string | null>(DEFAULT_SHORTCUT);

  React.useEffect(() => {
    browser?.commands
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

// LeetCode's inline code style, used for keys and URLs.
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[5px] border border-divider bg-fill-2/50 px-1 py-px font-mono text-xs text-label-2">
      {children}
    </code>
  );
}

export function WelcomePage() {
  const shortcut = useToggleShortcut();
  const [vote, setVote] = React.useState<HelpfulnessVote | null>(null);
  const unsupportedPage =
    new URLSearchParams(window.location.search).get('reason') === 'unsupported-page';

  return (
    // Laid out like a LeetCode problem workspace: two panes on the grey page.
    <main className="flex min-h-screen flex-col gap-2.5 bg-page p-2.5 font-sans text-label-1 antialiased lg:flex-row lg:items-start lg:justify-center lg:pt-[14vh]">
      <section
        aria-labelledby="welcome-title"
        className="flex flex-col overflow-hidden rounded-lg bg-layer-1 lg:max-w-[720px] lg:min-w-0 lg:flex-1"
      >
        <div className="flex h-9 shrink-0 items-center bg-layer-2 px-2">
          <span className="flex items-center gap-1.5 px-2 text-sm leading-5 font-medium">
            <BookOpen className="size-4 text-[#007bff] dark:text-[#4aa3ff]" aria-hidden="true" />
            Getting started
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 lg:px-8 lg:py-8">
          <h1 id="welcome-title" className="text-2xl leading-8 font-semibold text-title">
            Real-world use for every problem
          </h1>

          <p className="max-w-[60ch] text-sm leading-[21px]">
            AlgoBridge adds a <strong className="font-semibold">Real-world</strong> chip to LeetCode
            problem pages, next to Topics and Hint. It opens a pane with a use case and the named
            systems that rely on the same idea. The approach stays folded until you ask for it.
          </p>

          {unsupportedPage && (
            <p role="status" className="max-w-[60ch] rounded-lg bg-fill-2 px-3 py-2 text-sm leading-[21px]">
              AlgoBridge only runs on LeetCode problem pages. If you already have one open, refresh
              that tab and try again.
            </p>
          )}

          <div className="flex max-w-[60ch] flex-col gap-3 pt-2">
            {[
              {
                label: 'Step 1',
                body: (
                  <>
                    Open any problem on <Code>leetcode.com/problems/…</Code>
                  </>
                ),
              },
              {
                label: 'Step 2',
                body: (
                  <>
                    Click <strong className="font-semibold">Real-world</strong> in the chip row under
                    the title, or the AlgoBridge toolbar icon.
                  </>
                ),
              },
              {
                label: 'Step 3',
                body: shortcut ? (
                  <>
                    Or press <Code>{shortcut}</Code>. Change it from your browser’s extension
                    shortcuts page.
                  </>
                ) : (
                  <>Or assign a keyboard shortcut from your browser’s extension shortcuts page.</>
                ),
              },
            ].map(({ label, body }) => (
              <div key={label} className="flex flex-col gap-1">
                <p className="text-sm leading-[21px] font-semibold">{label}:</p>
                <p
                  data-ui="leetcode-example"
                  className="border-l-2 border-fill-3 pl-4 text-sm leading-[21px] text-label-2"
                >
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <a
              href={SAMPLE_PROBLEM_URL}
              className="inline-flex h-8 items-center rounded-lg bg-brand px-4 text-sm font-medium text-[#1a1a1a] transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-1 focus-visible:outline-none active:brightness-95"
            >
              Try it on Two Sum
            </a>
          </div>
        </div>
      </section>

      <section aria-label="Panel preview" data-ui="panel-preview" className="flex lg:w-[440px] lg:shrink-0">
        <Panel
          state={{ status: 'success', data: SAMPLE_SCENARIO }}
          vote={vote}
          onVote={setVote}
          onRetry={() => {}}
          className="w-full"
        />
      </section>
    </main>
  );
}
