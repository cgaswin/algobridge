import { X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog';
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

const DIFFICULTY_LABEL: Record<NonNullable<ProblemScenarioData['problem']['difficulty']>, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
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

  const scenarioData = overlayState.status === 'success' ? overlayState.data : null;
  const insight = scenarioData?.insight;

  const refreshScenarioFromCurrentUrl = React.useCallback(async () => {
    logDebug('refreshing scenario from current URL');
    setOverlayState({ status: 'loading' });

    const nextState = await loadScenario();
    setOverlayState(nextState);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[84vh] max-w-[560px] overflow-hidden rounded-[12px] border border-slate-200 bg-gradient-to-b from-[#FFFFFF] via-[#FCFDFF] to-[#F8FBFF] p-0 text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="max-h-[84vh] overflow-y-auto">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-xs font-medium tracking-[0.08em] text-[#94A3B8] uppercase">
                  AlgoBridge
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                  {(!scenarioData || scenarioData.problem.difficulty) && (
                    <span className="rounded-md bg-[#E8F0FF] px-2 py-1 font-medium text-[#2E4A7D]">
                      {scenarioData?.problem.difficulty
                        ? DIFFICULTY_LABEL[scenarioData.problem.difficulty]
                        : 'Preparing'}
                    </span>
                  )}
                  {scenarioData && <span>{scenarioData.problem.slug}</span>}
                </div>

                <h2 className="text-2xl font-semibold leading-tight text-[#0F172A]">
                  {scenarioData ? scenarioData.problem.title : 'Loading problem'}
                </h2>

              </div>

              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-500 hover:bg-[#EDF3FF] hover:text-[#2E4A7D]"
                  aria-label="Close overlay"
                >
                  <X aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          </header>

          <main className="flex flex-col gap-6 px-6 py-6">
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#6E87B3]">
                Use Case
              </p>

              {overlayState.status === 'loading' && (
                <div className="mt-3 flex flex-col gap-3" aria-hidden="true">
                  <div className="algobridge-skeleton h-5 w-[70%]" />
                  <div className="algobridge-skeleton h-4 w-full" />
                  <div className="algobridge-skeleton h-4 w-[88%]" />
                  <div className="algobridge-skeleton h-4 w-[76%]" />
                </div>
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

              {overlayState.status === 'success' && insight && (
                <div className="mt-3 flex flex-col gap-4">
                  <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                    {insight.useCase}
                  </p>

                  {insight.systemExamples.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-[#6E87B3]">
                        Where it shows up
                      </h3>
                      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-6 text-[#475569]">
                        {insight.systemExamples.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insight.explanation && (
                    <p className="max-w-[65ch] text-sm leading-6 text-[#475569]">
                      <span className="font-medium text-[#2E4A7D]">Why it matters:</span>{' '}
                      {insight.explanation}
                    </p>
                  )}
                </div>
              )}
            </section>

          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
