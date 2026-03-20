export type ScenarioProviderMode = 'dummy' | 'remote';

const defaultMode: ScenarioProviderMode = 'remote';
const defaultDevApiBaseUrl = 'http://localhost:8000';
const defaultProdApiBaseUrl = 'http://localhost:8000';

const sharedApiBaseUrl = import.meta.env.WXT_PROBLEM_INSIGHTS_API_BASE_URL;
const devApiBaseUrl =
  import.meta.env.WXT_PROBLEM_INSIGHTS_API_BASE_URL_DEV ??
  sharedApiBaseUrl ??
  defaultDevApiBaseUrl;
const prodApiBaseUrl =
  import.meta.env.WXT_PROBLEM_INSIGHTS_API_BASE_URL_PROD ??
  sharedApiBaseUrl ??
  defaultProdApiBaseUrl;

const configuredMode = import.meta.env.WXT_SCENARIO_PROVIDER_MODE;

function isScenarioProviderMode(value: string | undefined): value is ScenarioProviderMode {
  return value === 'dummy' || value === 'remote';
}

export const SCENARIO_PROVIDER_MODE: ScenarioProviderMode =
  isScenarioProviderMode(configuredMode) ? configuredMode : defaultMode;

export const PROBLEM_INSIGHTS_API_BASE_URL: string =
  import.meta.env.PROD ? prodApiBaseUrl : devApiBaseUrl;

export const PROBLEM_INSIGHTS_API_PATH = '/api/v1/problems';
