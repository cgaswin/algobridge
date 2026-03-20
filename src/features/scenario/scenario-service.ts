import { SCENARIO_PROVIDER_MODE, type ScenarioProviderMode } from './config';
import { DummyScenarioProvider } from './dummy-provider';
import { RemoteScenarioProvider } from './remote-provider';
import type { ProblemScenarioData, ScenarioProvider } from './types';

function createProvider(mode: ScenarioProviderMode): ScenarioProvider {
  if (mode === 'dummy') {
    return new DummyScenarioProvider();
  }

  return new RemoteScenarioProvider();
}

const provider = createProvider(SCENARIO_PROVIDER_MODE);

export async function getScenarioByPageUrl(url: string): Promise<ProblemScenarioData | null> {
  return provider.getByUrl({ url });
}

export function getScenarioProviderMode(): ScenarioProviderMode {
  return SCENARIO_PROVIDER_MODE;
}
