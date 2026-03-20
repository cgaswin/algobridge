export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export type ScenarioInsights = Record<string, unknown>;

export type ScenarioItem = {
  id: string;
  title: string;
  narrative: string;
  impact: string;
};

export type ProblemScenarioData = {
  problem: {
    slug: string;
    title: string;
    difficulty: ProblemDifficulty;
  };
  scenarios: ScenarioItem[];
  insights?: ScenarioInsights;
};

export type ScenarioQuery = {
  url: string;
};

export type ScenarioProvider = {
  getByUrl: (query: ScenarioQuery) => Promise<ProblemScenarioData | null>;
};

export type BackendErrorPayload = {
  code: string;
  message: string;
  details: Record<string, unknown> | unknown[];
};

export type ProblemInsightsSuccessEnvelope = {
  success: true;
  data: ScenarioInsights;
  error: null;
};

export type ProblemInsightsErrorEnvelope = {
  success: false;
  data: null;
  error: BackendErrorPayload;
};

export type ProblemInsightsEnvelope =
  | ProblemInsightsSuccessEnvelope
  | ProblemInsightsErrorEnvelope;
