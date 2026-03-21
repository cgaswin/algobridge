import { BriefcaseBusiness, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  getHelpfulnessVote,
  saveHelpfulnessVote,
} from '@/src/features/feedback/storage';
import type { HelpfulnessVote } from '@/src/features/feedback/types';
import {
  getScenarioByPageUrl,
} from '@/src/features/scenario/scenario-service';
import type { ProblemScenarioData } from '@/src/features/scenario/types';
import { logDebug, logError } from '@/src/shared/logger';
import { LOCATION_CHANGED_EVENT } from '@/src/shared/location-events';
import { OVERLAY_OPEN_REQUESTED_EVENT } from '@/src/shared/messaging';

type OverlayState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProblemScenarioData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

const DIFFICULTY_LABEL: Record<ProblemScenarioData['problem']['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function getSystemExamples(data: ProblemScenarioData): string[] {
  const rawExamples = data.insights?.system_examples;
  if (!Array.isArray(rawExamples)) {
    return [];
  }

  return rawExamples.filter((value): value is string => typeof value === 'string');
}

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
      scenarioCount: data.scenarios.length,
    });
    return { status: 'success', data };
  } catch (error) {
    const fallbackMessage = 'Could not load real-world scenario. Please try again.';
    logError('scenario load failed', {
      error,
      url: window.location.href,
    });

    return {
      status: 'error',
      message: error instanceof Error && error.message ? error.message : fallbackMessage,
    };
  }
}

export function OverlayApp() {
  const [open, setOpen] = React.useState(false);
  const [overlayState, setOverlayState] = React.useState<OverlayState>({ status: 'idle' });
  const [selectedVote, setSelectedVote] = React.useState<HelpfulnessVote | null>(null);

  const scenarioData = overlayState.status === 'success' ? overlayState.data : null;
  const primaryScenario = scenarioData?.scenarios[0];
  const systemExamples = scenarioData ? getSystemExamples(scenarioData) : [];

  const refreshScenarioFromCurrentUrl = React.useCallback(async () => {
    logDebug('refreshing scenario from current URL');
    setOverlayState({ status: 'loading' });
    setSelectedVote(null);

    const nextState = await loadScenario();
    setOverlayState(nextState);

    if (nextState.status === 'success') {
      const existingVote = await getHelpfulnessVote(nextState.data.problem.slug);
      setSelectedVote(existingVote);
    }
  }, []);

  React.useEffect(() => {
    const onOpenRequested = () => {
      logDebug('overlay open requested event received');
      setOpen(true);
      void refreshScenarioFromCurrentUrl();
    };

    window.addEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);

    return () => {
      window.removeEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);
    };
  }, [refreshScenarioFromCurrentUrl]);

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

  const handleVote = React.useCallback(
    async (vote: HelpfulnessVote) => {
      if (overlayState.status !== 'success') {
        return;
      }

      logDebug('helpfulness vote submitted', {
        slug: overlayState.data.problem.slug,
        vote,
      });
      setSelectedVote(vote);
      await saveHelpfulnessVote(overlayState.data.problem.slug, vote);
    },
    [overlayState],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[84vh] max-w-[560px] overflow-hidden rounded-[12px] border border-slate-200 bg-white p-0 text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="max-h-[84vh] overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-1.5 text-slate-600">
                    <BriefcaseBusiness aria-hidden="true" />
                  </div>
                  <p className="text-xs font-medium tracking-[0.08em] text-[#94A3B8] uppercase">
                    AlgoBridge
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-[#475569]">
                    {scenarioData
                      ? DIFFICULTY_LABEL[scenarioData.problem.difficulty]
                      : 'Preparing'}
                  </span>
                  {scenarioData && <span>{scenarioData.problem.slug}</span>}
                </div>

                <h2 className="text-2xl font-semibold leading-tight text-[#0F172A]">
                  {scenarioData ? scenarioData.problem.title : 'Loading problem'}
                </h2>

                <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                  {scenarioData
                    ? 'Real-world framing for the algorithmic pattern behind this problem.'
                    : 'Preparing real-world context from backend insights.'}
                </p>
              </div>

              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close overlay"
                >
                  <X aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          </header>

          <main className="flex flex-col gap-6 px-6 py-6">
            <section
              className={cn(
                'rounded-lg border-l-2 px-4 py-4',
                overlayState.status === 'error'
                  ? 'border-red-300 bg-red-50/70'
                  : 'border-slate-300 bg-slate-50',
              )}
            >
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                Primary Insight
              </p>

              {overlayState.status === 'loading' && (
                <p className="mt-3 max-w-[65ch] text-sm leading-6 text-[#475569]">
                  Fetching practical application context for this problem.
                </p>
              )}

              {overlayState.status === 'empty' && (
                <p className="mt-3 max-w-[65ch] text-sm leading-6 text-[#475569]">
                  No scenario is available for this problem yet.
                </p>
              )}

              {overlayState.status === 'error' && (
                <p className="mt-3 max-w-[65ch] text-sm leading-6 text-red-700">
                  {overlayState.message}
                </p>
              )}

              {overlayState.status === 'success' && (
                <div className="mt-3 flex flex-col gap-3">
                  <h3 className="text-base font-semibold leading-tight text-[#0F172A]">
                    {primaryScenario?.title ?? 'Industry scenario'}
                  </h3>
                  <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                    {primaryScenario?.narrative}
                  </p>
                </div>
              )}
            </section>

            <Separator className="bg-slate-200" />

            <section className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-[#0F172A]">Supporting Context</h3>

              {overlayState.status !== 'success' && (
                <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                  Supporting context appears here once a scenario has been resolved.
                </p>
              )}

              {overlayState.status === 'success' && (
                <>
                  <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                    {primaryScenario?.impact}
                  </p>

                  {systemExamples.length > 0 && (
                    <ul className="flex flex-col gap-2 text-sm leading-6 text-[#475569]">
                      {systemExamples.slice(0, 3).map((example) => (
                        <li key={example} className="max-w-[65ch]">
                          {example}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="text-xs text-[#94A3B8]">Generated from backend insights.</p>
                </>
              )}
            </section>

            <Separator className="bg-slate-200" />

            <section className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-[#475569]">Was this scenario helpful?</p>
                <p className="text-xs text-[#94A3B8]">
                  Feedback improves future context quality.
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 gap-1.5 px-2.5 text-xs font-medium text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]',
                    selectedVote === 'yes' &&
                      'bg-slate-100 text-[#0F172A] hover:bg-slate-100 hover:text-[#0F172A]',
                  )}
                  disabled={overlayState.status !== 'success'}
                  onClick={() => handleVote('yes')}
                >
                  <ThumbsUp aria-hidden="true" />
                  Yes
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 gap-1.5 px-2.5 text-xs font-medium text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]',
                    selectedVote === 'no' &&
                      'bg-slate-100 text-[#0F172A] hover:bg-slate-100 hover:text-[#0F172A]',
                  )}
                  disabled={overlayState.status !== 'success'}
                  onClick={() => handleVote('no')}
                >
                  <ThumbsDown aria-hidden="true" />
                  No
                </Button>
              </div>
            </section>

          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
