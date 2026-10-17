import { Lightbulb } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { getHelpfulnessVote, saveHelpfulnessVote } from '@/src/features/feedback/storage';
import type { HelpfulnessVote } from '@/src/features/feedback/types';
import { extractLeetCodeProblemSlug } from '@/src/features/leetcode/problem-url';
import { getScenarioByPageUrl } from '@/src/features/scenario/scenario-service';
import { logDebug, logError, logWarn } from '@/src/shared/logger';
import { LOCATION_CHANGED_EVENT } from '@/src/shared/location-events';
import { OVERLAY_OPEN_REQUESTED_EVENT } from '@/src/shared/messaging';
import {
  CHIP_PRESENCE_CHANGED_EVENT,
  dispatchPanelStateChanged,
  INLINE_CHIP_TAG,
  readMountedDetail,
} from '@/src/shared/panel-events';

import { toFriendlyErrorMessage } from './error-message';
import { Panel, type PanelState } from './Panel';
import { useHostTheme } from './use-host-theme';

async function loadScenario(): Promise<PanelState> {
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

function useHelpfulnessVote(slug: string | null) {
  const [vote, setVote] = React.useState<HelpfulnessVote | null>(null);

  React.useEffect(() => {
    setVote(null);
    if (!slug) {
      return;
    }

    let cancelled = false;
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

  const choose = React.useCallback(
    (next: HelpfulnessVote) => {
      if (!slug) {
        return;
      }

      setVote(next);
      saveHelpfulnessVote(slug, next).catch((error: unknown) =>
        logWarn('failed to save feedback vote', { slug, error }),
      );
    },
    [slug],
  );

  return [vote, choose] as const;
}

// The inline chip is the main entry point; the edge tab only appears when
// LeetCode's layout changes and the chip can't find its anchor.
function useChipMounted(): boolean {
  const [mounted, setMounted] = React.useState(
    () => document.querySelector(INLINE_CHIP_TAG) != null,
  );

  React.useEffect(() => {
    const update = (event: Event) => setMounted(readMountedDetail(event));
    window.addEventListener(CHIP_PRESENCE_CHANGED_EVENT, update);
    return () => window.removeEventListener(CHIP_PRESENCE_CHANGED_EVENT, update);
  }, []);

  return mounted;
}

export function OverlayApp() {
  const [open, setOpen] = React.useState(false);
  const [overlayState, setPanelState] = React.useState<PanelState>({ status: 'idle' });
  const theme = useHostTheme();
  const currentSlug = useCurrentProblemSlug();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const requestIdRef = React.useRef(0);

  const chipMounted = useChipMounted();
  const [vote, setVote] = useHelpfulnessVote(
    overlayState.status === 'success' ? overlayState.data.problem.slug : null,
  );

  const refreshScenarioFromCurrentUrl = React.useCallback(async () => {
    logDebug('refreshing scenario from current URL');
    const requestId = ++requestIdRef.current;
    setPanelState({ status: 'loading' });

    const nextState = await loadScenario();
    // Ignore responses for a problem the user has already navigated away from.
    if (requestId === requestIdRef.current) {
      setPanelState(nextState);
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
    dispatchPanelStateChanged(open);
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
    <div className={cn('font-sans text-label-1 antialiased', theme === 'dark' && 'dark')}>
      {!open && currentSlug && !chipMounted && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open AlgoBridge: real-world use of this problem"
          title="Real-world use"
          className="fixed top-1/2 right-0 z-[2147483000] flex -translate-y-1/2 items-center rounded-l-lg bg-layer-1 py-2.5 pr-2 pl-2.5 text-brand shadow-layer transition-colors hover:bg-page focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none"
        >
          <Lightbulb className="size-4" aria-hidden="true" />
        </button>
      )}

      {open && (
        // Sits where LeetCode's own panes sit: under the 48px navbar, inside its 10px gutter.
        <aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="algobridge-title"
          aria-label="AlgoBridge"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
            }
          }}
          className="fixed top-12 right-2.5 z-[2147483000] flex max-h-[calc(100vh-58px)] w-[min(440px,calc(100vw-20px))] animate-in fade-in-0 slide-in-from-right-4 duration-150 motion-reduce:animate-none"
        >
          <Panel
            state={overlayState}
            vote={vote}
            onVote={setVote}
            onRetry={() => void refreshScenarioFromCurrentUrl()}
            onClose={() => setOpen(false)}
            closeButtonRef={closeButtonRef}
            className="w-full shadow-layer"
          />
        </aside>
      )}
    </div>
  );
}
