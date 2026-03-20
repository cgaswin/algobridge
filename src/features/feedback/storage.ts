import { browser } from 'wxt/browser';

import type { HelpfulnessVote, ProblemFeedbackRecord } from './types';

export const FEEDBACK_STORAGE_KEY = 'algobridge.helpfulnessBySlug';

type FeedbackMap = Record<string, ProblemFeedbackRecord>;

async function readFeedbackMap(): Promise<FeedbackMap> {
  const result = await browser.storage.local.get(FEEDBACK_STORAGE_KEY);
  const rawValue = result[FEEDBACK_STORAGE_KEY];

  if (typeof rawValue !== 'object' || rawValue == null) {
    return {};
  }

  return rawValue as FeedbackMap;
}

export async function saveHelpfulnessVote(slug: string, vote: HelpfulnessVote): Promise<void> {
  const current = await readFeedbackMap();

  const next: FeedbackMap = {
    ...current,
    [slug]: {
      slug,
      vote,
      updatedAt: Date.now(),
    },
  };

  await browser.storage.local.set({ [FEEDBACK_STORAGE_KEY]: next });
}

export async function getHelpfulnessVote(slug: string): Promise<HelpfulnessVote | null> {
  const current = await readFeedbackMap();
  return current[slug]?.vote ?? null;
}
