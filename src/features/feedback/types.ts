export type HelpfulnessVote = 'yes' | 'no';

export type ProblemFeedbackRecord = {
  slug: string;
  vote: HelpfulnessVote;
  updatedAt: number;
};
