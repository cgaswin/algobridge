export type ScenarioProviderMode = 'dummy' | 'remote';

const defaultMode: ScenarioProviderMode = 'dummy';

export const SCENARIO_PROVIDER_MODE: ScenarioProviderMode =
  (import.meta.env.WXT_SCENARIO_PROVIDER_MODE as ScenarioProviderMode | undefined) ?? defaultMode;
