export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

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
};

export type ScenarioQuery = {
  url: string;
};

export type ScenarioProvider = {
  getByUrl: (query: ScenarioQuery) => Promise<ProblemScenarioData | null>;
};
