import { BriefcaseBusiness, ThumbsDown, ThumbsUp, TrendingUp, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  getHelpfulnessVote,
  saveHelpfulnessVote,
} from '@/src/features/feedback/storage';
import type { HelpfulnessVote } from '@/src/features/feedback/types';
import {
  getScenarioByPageUrl,
  getScenarioProviderMode,
} from '@/src/features/scenario/scenario-service';
import type { ProblemScenarioData } from '@/src/features/scenario/types';
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

async function loadScenario(): Promise<OverlayState> {
  try {
    const data = await getScenarioByPageUrl(window.location.href);
    if (!data) {
      return { status: 'empty' };
    }

    return { status: 'success', data };
  } catch {
    return {
      status: 'error',
      message: 'Could not load real-world scenario. Please try again.',
    };
  }
}

export function OverlayApp() {
  const [open, setOpen] = React.useState(false);
  const [overlayState, setOverlayState] = React.useState<OverlayState>({ status: 'idle' });
  const [selectedVote, setSelectedVote] = React.useState<HelpfulnessVote | null>(null);

  const refreshScenarioFromCurrentUrl = React.useCallback(async () => {
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

      setSelectedVote(vote);
      await saveHelpfulnessVote(overlayState.data.problem.slug, vote);
    },
    [overlayState],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="gap-3 border-b bg-gradient-to-r from-secondary to-background pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/15 p-2 text-primary">
                <BriefcaseBusiness aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">AlgoBridge</p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close overlay">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit text-[11px] uppercase tracking-wide">
              {overlayState.status === 'success'
                ? DIFFICULTY_LABEL[overlayState.data.problem.difficulty]
                : 'Loading'}
            </Badge>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-4xl font-bold tracking-tight">
                {overlayState.status === 'success'
                  ? overlayState.data.problem.title
                  : 'Loading problem'}
              </DialogTitle>
              <DialogDescription className="max-w-xl text-base leading-relaxed">
                {overlayState.status === 'success'
                  ? 'This problem maps directly to practical engineering constraints in production systems.'
                  : 'Preparing real-world context for this problem.'}
              </DialogDescription>
              <p className="text-xs text-muted-foreground/80">
                Provider mode: {getScenarioProviderMode()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          {overlayState.status === 'loading' && (
            <Card className="border-primary/30 bg-background/70">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Loading scenario...</p>
              </CardContent>
            </Card>
          )}

          {overlayState.status === 'empty' && (
            <Card className="border-primary/30 bg-background/70">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  No scenario is available yet for this page.
                </p>
              </CardContent>
            </Card>
          )}

          {overlayState.status === 'error' && (
            <Card className="border-destructive/30 bg-background/70">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{overlayState.message}</p>
              </CardContent>
            </Card>
          )}

          {overlayState.status === 'success' && (
            <Card className="border-primary/30 bg-background/70">
              <CardHeader className="gap-3 pb-2">
                <Badge className="w-fit bg-primary/10 text-primary">Practical Application 1/1</Badge>
                <CardTitle className="text-2xl">
                  {overlayState.data.scenarios[0]?.title ?? 'Industry scenario'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {overlayState.data.scenarios[0]?.narrative}
                </p>
                <div className="flex items-center gap-2 rounded-md border bg-secondary/50 px-3 py-2 text-sm font-medium text-primary">
                  <TrendingUp aria-hidden="true" />
                  {overlayState.data.scenarios[0]?.impact}
                </div>
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Was this scenario helpful?</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedVote === 'yes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote('yes')}
                    >
                      <ThumbsUp aria-hidden="true" />
                      Yes
                    </Button>
                    <Button
                      variant={selectedVote === 'no' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote('no')}
                    >
                      <ThumbsDown aria-hidden="true" />
                      No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
