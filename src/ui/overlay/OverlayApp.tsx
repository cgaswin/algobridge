import { Eye, Lightbulb, RotateCw, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getHelpfulnessVote, saveHelpfulnessVote } from '@/src/features/feedback/storage';
import type { HelpfulnessVote } from '@/src/features/feedback/types';
import { extractLeetCodeProblemSlug } from '@/src/features/leetcode/problem-url';
import { getScenarioByPageUrl } from '@/src/features/scenario/scenario-service';
import type { ProblemScenarioData } from '@/src/features/scenario/types';
import { logDebug, logError, logWarn } from '@/src/shared/logger';
import { LOCATION_CHANGED_EVENT } from '@/src/shared/location-events';
import { OVERLAY_OPEN_REQUESTED_EVENT } from '@/src/shared/messaging';

import { toFriendlyErrorMessage } from './error-message';
import { useHostTheme } from './use-host-theme';

type OverlayState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProblemScenarioData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

const DIFFICULTY_LABEL: Record<NonNullable<ProblemScenarioData['problem']['difficulty']>, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// Matches LeetCode's own difficulty colours so the badge reads at a glance.
const DIFFICULTY_CLASS: Record<NonNullable<ProblemScenarioData['problem']['difficulty']>, string> = {
  easy: 'text-[#1CB8B8] bg-[#1CB8B8]/10',
  medium: 'text-[#D9A400] bg-[#FFB800]/12',
  hard: 'text-[#F63636] bg-[#F63636]/10',
};

async function loadScenario(): Promise<OverlayState> {
  try {
    logDebug('loading scenario for current URL', {
      url: window.location.href,
    });

    const data = await getScenarioByPageUrl(window.location.href);
    if (!data) {
      logDebug('no scenario data returned for current URL');
      return { status: 'empty' };
    }

    logDebug('scenario data loaded successfully', {
      slug: data.problem.slug,
      systemExampleCount: data.insight.systemExamples.length,
    });
    return { status: 'success', data };
  } catch (error) {
    logError('scenario load failed', {
      error,
      url: window.location.href,
    });

    return { status: 'error', message: toFriendlyErrorMessage(error) };
  }
}

function useCurrentProblemSlug(): string | null {
  const [slug, setSlug] = React.useState(() =>
    extractLeetCodeProblemSlug(window.location.href),
  );

  React.useEffect(() => {
    const update = () => setSlug(extractLeetCodeProblemSlug(window.location.href));
    window.addEventListener(LOCATION_CHANGED_EVENT, update);
    return () => window.removeEventListener(LOCATION_CHANGED_EVENT, update);
  }, []);

  return slug;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h3>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="algobridge-skeleton h-5 w-[70%]" />
      <div className="algobridge-skeleton h-4 w-full" />
      <div className="algobridge-skeleton h-4 w-[88%]" />
      <div className="algobridge-skeleton h-4 w-[76%]" />
    </div>
  );
}

function ApproachSection({ data }: { data: ProblemScenarioData }) {
  const [revealed, setRevealed] = React.useState(false);
  const { explanation } = data.insight;
  const { tags } = data.problem;

  if (!explanation && tags.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="algobridge-approach">
      <SectionLabel>
        <span id="algobridge-approach">Approach & why it matters</span>
      </SectionLabel>

      {revealed ? (
        <div className="flex flex-col gap-3">
          {explanation && <p className="text-sm leading-6 text-foreground/85">{explanation}</p>}
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
        >
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">Reveal approach</span>
            <span className="block text-xs">Names the technique and topics, so it may spoil the solution.</span>
          </span>
        </button>
      )}
    </section>
  );
}

function FeedbackRow({ slug }: { slug: string }) {
  const [vote, setVote] = React.useState<HelpfulnessVote | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setVote(null);
    getHelpfulnessVote(slug)
      .then((saved) => {
        if (!cancelled) {
          setVote(saved);
        }
      })
      .catch((error: unknown) => logWarn('failed to read feedback vote', { slug, error }));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const choose = (next: HelpfulnessVote) => {
    setVote(next);
    saveHelpfulnessVote(slug, next).catch((error: unknown) =>
      logWarn('failed to save feedback vote', { slug, error }),
    );
  };

  const options: { value: HelpfulnessVote; label: string; Icon: typeof ThumbsUp }[] = [
    { value: 'yes', label: 'Helpful', Icon: ThumbsUp },
    { value: 'no', label: 'Not helpful', Icon: ThumbsDown },
  ];

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        {vote ? 'Thanks for the feedback.' : 'Was this useful?'}
      </p>
      <div className="flex gap-1" role="group" aria-label="Rate this insight">
        {options.map(({ value, label, Icon }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            aria-label={label}
            aria-pressed={vote === value}
            onClick={() => choose(value)}
            className={cn(
              'text-muted-foreground',
              vote === value && 'bg-accent text-accent-foreground',
            )}
          >
            <Icon aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  );
}

function PanelBody({
  state,
  onRetry,
}: {
  state: OverlayState;
  onRetry: () => void;
}) {
  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <section className="flex flex-col gap-3">
        <SectionLabel>Real-world use case</SectionLabel>
        <LoadingState />
      </section>
    );
  }

  if (state.status === 'empty') {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Open a LeetCode problem to see where it shows up in real systems.
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-sm leading-6 text-foreground">{state.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  const { data } = state;
  const { useCase, systemExamples } = data.insight;

  return (
    <>
      {useCase && (
        <section className="flex flex-col gap-3">
          <SectionLabel>Real-world use case</SectionLabel>
          <p className="text-[15px] leading-7 text-foreground">{useCase}</p>
        </section>
      )}

      {systemExamples.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>Where it shows up</SectionLabel>
          <ul className="flex flex-col gap-2">
            {systemExamples.map((example) => {
              const [system, ...rest] = example.split(' — ');
              const detail = rest.join(' — ');
              return (
                <li
                  key={example}
                  className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm leading-6"
                >
                  {detail ? (
                    <>
                      <span className="font-medium text-foreground">{system}</span>
                      <span className="text-muted-foreground"> — {detail}</span>
                    </>
                  ) : (
                    <span className="text-foreground">{example}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ApproachSection key={data.problem.slug} data={data} />
      <FeedbackRow slug={data.problem.slug} />
    </>
  );
}

export function OverlayApp() {
  const [open, setOpen] = React.useState(false);
  const [overlayState, setOverlayState] = React.useState<OverlayState>({ status: 'idle' });
  const theme = useHostTheme();
  const currentSlug = useCurrentProblemSlug();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const requestIdRef = React.useRef(0);

  const scenarioData = overlayState.status === 'success' ? overlayState.data : null;
  const difficulty = scenarioData?.problem.difficulty;

  const refreshScenarioFromCurrentUrl = React.useCallback(async () => {
    logDebug('refreshing scenario from current URL');
    const requestId = ++requestIdRef.current;
    setOverlayState({ status: 'loading' });

    const nextState = await loadScenario();
    // Ignore responses for a problem the user has already navigated away from.
    if (requestId === requestIdRef.current) {
      setOverlayState(nextState);
    }
  }, []);

  const openPanel = React.useCallback(() => {
    setOpen(true);
    void refreshScenarioFromCurrentUrl();
  }, [refreshScenarioFromCurrentUrl]);

  React.useEffect(() => {
    const onOpenRequested = () => {
      logDebug('overlay open requested event received');
      if (open) {
        setOpen(false);
        return;
      }
      openPanel();
    };

    window.addEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);

    return () => {
      window.removeEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);
    };
  }, [open, openPanel]);

  React.useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  React.useEffect(() => {
    const onLocationChanged = () => {
      if (!open) {
        return;
      }

      logDebug('location changed while overlay open, refreshing scenario');
      void refreshScenarioFromCurrentUrl();
    };

    window.addEventListener(LOCATION_CHANGED_EVENT, onLocationChanged);

    return () => {
      window.removeEventListener(LOCATION_CHANGED_EVENT, onLocationChanged);
    };
  }, [open, refreshScenarioFromCurrentUrl]);

  return (
    <div className={cn('font-sans text-foreground antialiased', theme === 'dark' && 'dark')}>
      {!open && currentSlug && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open AlgoBridge: real-world use of this problem"
          title="AlgoBridge: real-world use"
          className="group fixed top-1/2 right-0 z-[2147483000] flex -translate-y-1/2 items-center gap-2 rounded-l-lg border border-r-0 border-border bg-card py-2.5 pr-2 pl-2.5 text-xs font-medium text-muted-foreground shadow-md transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
        >
          <Lightbulb className="size-4" aria-hidden="true" />
          <span className="sr-only group-hover:not-sr-only group-focus-visible:not-sr-only">
            Real-world use
          </span>
        </button>
      )}

      {open && (
        <aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="algobridge-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
            }
          }}
          className="fixed top-0 right-0 z-[2147483000] flex h-screen w-[min(420px,100vw)] flex-col border-l border-border bg-card text-card-foreground shadow-[-12px_0_32px_rgba(15,23,42,0.12)] animate-in slide-in-from-right-8 fade-in-0 duration-200 motion-reduce:animate-none"
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 pt-5 pb-4">
            <div className="flex min-w-0 flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.08em] text-primary uppercase">
                <Lightbulb className="size-3.5" aria-hidden="true" />
                AlgoBridge
              </p>
              <h2
                id="algobridge-title"
                className="text-xl leading-tight font-semibold text-foreground"
              >
                {scenarioData?.problem.title ?? 'Real-world use'}
              </h2>
              {difficulty && (
                <span
                  className={cn(
                    'w-fit rounded-md px-2 py-0.5 text-xs font-medium',
                    DIFFICULTY_CLASS[difficulty],
                  )}
                >
                  {DIFFICULTY_LABEL[difficulty]}
                </span>
              )}
            </div>

            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              className="-mr-2 size-8 shrink-0 text-muted-foreground"
              aria-label="Close AlgoBridge"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </header>

          <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6" aria-live="polite">
            <PanelBody state={overlayState} onRetry={() => void refreshScenarioFromCurrentUrl()} />
          </main>
        </aside>
      )}
    </div>
  );
}
