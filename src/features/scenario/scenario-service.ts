import { DummyScenarioProvider } from './dummy-provider';
import type { ProblemScenarioData, ScenarioProvider } from './types';

type ProviderMode = 'dummy';

const PROVIDER_MODE: ProviderMode = 'dummy';

function createProvider(mode: ProviderMode): ScenarioProvider {
  if (mode === 'dummy') {
    return new DummyScenarioProvider();
  }

  return new DummyScenarioProvider();
}

const provider = createProvider(PROVIDER_MODE);

export async function getScenarioByPageUrl(url: string): Promise<ProblemScenarioData | null> {
  return provider.getByUrl({ url });
}
