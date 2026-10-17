import { ChevronDown, Eye, Lightbulb, RotateCw, Tag, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { HelpfulnessVote } from '@/src/features/feedback/types';
import type { ProblemDifficulty, ProblemScenarioData } from '@/src/features/scenario/types';

export type PanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProblemScenarioData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

const DIFFICULTY_LABEL: Record<ProblemDifficulty, string> = {
  easy: 'Easy',
  medium: 'Med.',
  hard: 'Hard',
};

const DIFFICULTY_CLASS: Record<ProblemDifficulty, string> = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
};

// LeetCode's chip: the pill used for difficulty, Topics, Companies and Hint.
const CHIP_CLASS =
  'inline-flex h-6 items-center gap-1 rounded-full bg-fill-2 px-2 text-xs leading-4 text-label-1';

const ICON_BUTTON_CLASS =
  'inline-flex size-7 items-center justify-center rounded-md text-label-2 transition-colors hover:bg-fill-2 hover:text-label-1 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none';

type AccordionId = 'approach' | 'topics';

function splitSystemExample(example: string): { system: string; detail: string } {
  const [system, ...rest] = example.split(' — ');
  return { system, detail: rest.join(' — ') };
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="algobridge-skeleton h-8 w-[62%]" />
      <div className="flex gap-2">
        <div className="algobridge-skeleton h-6 w-12 rounded-full" />
        <div className="algobridge-skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <div className="algobridge-skeleton h-4 w-full" />
        <div className="algobridge-skeleton h-4 w-[92%]" />
        <div className="algobridge-skeleton h-4 w-[70%]" />
      </div>
    </div>
  );
}

function Accordion({
  id,
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  id: AccordionId;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const contentId = `algobridge-accordion-${id}`;
  return (
    <div className="border-t border-divider" data-ui="leetcode-accordion">
      <button
        type="button"
        id={`${contentId}-trigger`}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-3 text-left text-sm text-label-1 transition-colors hover:text-label-2 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none"
      >
        <span className="text-label-3">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn('size-4 text-label-3 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={`${contentId}-trigger`}
          className="pb-4 text-sm leading-[21px] text-label-1"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Insight({ data }: { data: ProblemScenarioData }) {
  const { title, difficulty, tags } = data.problem;
  const { useCase, systemExamples, explanation } = data.insight;
  const [openSection, setOpenSection] = React.useState<AccordionId | null>(null);
  const sectionsRef = React.useRef<HTMLDivElement>(null);

  const toggle = (id: AccordionId) => setOpenSection((current) => (current === id ? null : id));

  // The chips above jump to their accordion, the way LeetCode's Topics chip does.
  const jumpTo = (id: AccordionId) => {
    setOpenSection(id);
    requestAnimationFrame(() =>
      sectionsRef.current?.querySelector(`#algobridge-accordion-${id}-trigger`)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 id="algobridge-title" className="text-2xl leading-8 font-semibold text-title">
        {title}
      </h2>

      <div className="flex flex-wrap gap-1">
        {difficulty && (
          <span className={cn(CHIP_CLASS, DIFFICULTY_CLASS[difficulty])}>
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        )}
        {explanation && (
          <button
            type="button"
            onClick={() => jumpTo('approach')}
            className={cn(CHIP_CLASS, 'transition-colors hover:bg-fill-3')}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Approach
          </button>
        )}
        {tags.length > 0 && (
          <button
            type="button"
            onClick={() => jumpTo('topics')}
            className={cn(CHIP_CLASS, 'transition-colors hover:bg-fill-3')}
          >
            <Tag className="size-3.5" aria-hidden="true" />
            Topics
          </button>
        )}
      </div>

      {useCase && <p className="text-sm leading-[21px] text-label-1">{useCase}</p>}

      {systemExamples.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-[21px] font-semibold text-label-1">Where it shows up</p>
          {systemExamples.map((example) => {
            const { system, detail } = splitSystemExample(example);
            return (
              // LeetCode sets its examples off with a grey bar on the left.
              <div
                key={example}
                data-ui="leetcode-example"
                className="border-l-2 border-fill-3 pl-4 text-sm leading-[21px]"
              >
                {detail ? (
                  <p className="text-label-1">
                    <strong className="font-semibold">{system}</strong>
                    <span className="text-label-2">: {detail}</span>
                  </p>
                ) : (
                  <p className="text-label-1">{example}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(explanation || tags.length > 0) && (
        <div ref={sectionsRef} className="mt-6 flex flex-col">
          {explanation && (
            <Accordion
              id="approach"
              icon={<Eye className="size-4" aria-hidden="true" />}
              label="Approach"
              open={openSection === 'approach'}
              onToggle={() => toggle('approach')}
            >
              <p className="text-xs leading-4 text-label-3">Names the technique, so it may spoil the solution.</p>
              <p className="mt-2">{explanation}</p>
            </Accordion>
          )}
          {tags.length > 0 && (
            <Accordion
              id="topics"
              icon={<Tag className="size-4" aria-hidden="true" />}
              label="Topics"
              open={openSection === 'topics'}
              onToggle={() => toggle('topics')}
            >
              <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
                {tags.map((tag) => (
                  <li key={tag} className={cn(CHIP_CLASS, 'text-label-2')}>
                    {tag}
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          <div className="border-t border-divider" data-ui="leetcode-accordion" />
        </div>
      )}
    </div>
  );
}

function PanelContent({ state, onRetry }: { state: PanelState; onRetry: () => void }) {
  if (state.status === 'idle' || state.status === 'loading') {
    return <LoadingState />;
  }

  if (state.status === 'empty') {
    return (
      <p className="text-sm leading-[21px] text-label-2">
        Open a LeetCode problem to see where it shows up in real systems.
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-sm leading-[21px] text-label-1">{state.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fill-2 px-3 text-sm font-medium text-label-1 transition-colors hover:bg-fill-3 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none"
        >
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  return <Insight key={state.data.problem.slug} data={state.data} />;
}

function FeedbackBar({
  vote,
  onVote,
}: {
  vote: HelpfulnessVote | null;
  onVote: (vote: HelpfulnessVote) => void;
}) {
  const options: { value: HelpfulnessVote; label: string; Icon: typeof ThumbsUp }[] = [
    { value: 'yes', label: 'Helpful', Icon: ThumbsUp },
    { value: 'no', label: 'Not helpful', Icon: ThumbsDown },
  ];

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-divider px-4" data-ui="leetcode-footer">
      <p className="text-xs text-label-3">{vote ? 'Thanks for the feedback.' : 'Was this useful?'}</p>
      <div
        className="flex items-center overflow-hidden rounded-full bg-fill-2"
        role="group"
        aria-label="Rate this insight"
      >
        {options.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={vote === value}
            onClick={() => onVote(value)}
            className={cn(
              'inline-flex h-6 w-8 items-center justify-center text-label-2 transition-colors hover:bg-fill-2 hover:text-label-1 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:outline-none focus-visible:ring-inset',
              vote === value && 'text-brand hover:text-brand',
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" fill={vote === value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Panel({
  state,
  vote,
  onVote,
  onRetry,
  onClose,
  closeButtonRef,
  className,
}: {
  state: PanelState;
  vote: HelpfulnessVote | null;
  onVote: (vote: HelpfulnessVote) => void;
  onRetry: () => void;
  onClose?: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg bg-layer-1 text-label-1', className)}>
      {/* Same 36px tab strip LeetCode puts on top of Description / Editorial. */}
      <div className="flex h-9 shrink-0 items-center justify-between bg-layer-2 pr-1.5 pl-2">
        <div className="flex h-full items-center">
          <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm leading-5 font-medium text-label-1">
            <Lightbulb className="size-4 text-brand" aria-hidden="true" />
            Real-world
          </span>
        </div>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close AlgoBridge"
            onClick={onClose}
            className={ICON_BUTTON_CLASS}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5" aria-live="polite">
        <PanelContent state={state} onRetry={onRetry} />
      </div>

      {state.status === 'success' && <FeedbackBar vote={vote} onVote={onVote} />}
    </div>
  );
}
