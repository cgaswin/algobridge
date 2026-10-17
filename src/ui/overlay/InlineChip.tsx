import { Lightbulb } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { OVERLAY_OPEN_REQUESTED_EVENT } from '@/src/shared/messaging';
import { PANEL_STATE_CHANGED_EVENT, readOpenDetail } from '@/src/shared/panel-events';

import { useHostTheme } from './use-host-theme';

// Sits in LeetCode's own chip row, after Easy / Topics / Companies / Hint.
export function InlineChip() {
  const theme = useHostTheme();
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    const update = (event: Event) => setPanelOpen(readOpenDetail(event));
    window.addEventListener(PANEL_STATE_CHANGED_EVENT, update);
    return () => window.removeEventListener(PANEL_STATE_CHANGED_EVENT, update);
  }, []);

  return (
    <span className={cn('font-sans antialiased', theme === 'dark' && 'dark')}>
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-label="Real-world use of this problem (AlgoBridge)"
        onClick={() => window.dispatchEvent(new CustomEvent(OVERLAY_OPEN_REQUESTED_EVENT))}
        className={cn(
          'inline-flex h-6 cursor-pointer items-center gap-1 rounded-full px-2 text-xs leading-4 transition-colors focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none',
          panelOpen
            ? 'bg-brand/15 text-label-1'
            : 'bg-fill-2 text-label-1 hover:bg-fill-3',
        )}
      >
        <Lightbulb className="size-3.5 text-brand" aria-hidden="true" />
        Real-world
      </button>
    </span>
  );
}
