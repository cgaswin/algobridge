import {
  extractLeetCodeProblemSlug,
  formatProblemTitleFromSlug,
} from '@/src/features/leetcode/problem-url';
import { logDebug, logError } from '@/src/shared/logger';
import {
  createRequestProblemInsightsMessage,
  isProblemInsightsResponseMessage,
} from '@/src/shared/messaging';

import {
  PROBLEM_INSIGHTS_API_BASE_URL,
  PROBLEM_INSIGHTS_API_PATH,
} from './config';
import type {
  ProblemInsightsEnvelope,
  ProblemScenarioData,
  ScenarioProvider,
  ScenarioQuery,
} from './types';

function getInsightsApiUrl(): string {
  return new URL(PROBLEM_INSIGHTS_API_PATH, PROBLEM_INSIGHTS_API_BASE_URL).toString();
}

function isProblemInsightsEnvelope(value: unknown): value is ProblemInsightsEnvelope {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const envelope = value as {
    success?: unknown;
    data?: unknown;
    error?: unknown;
  };

  if (typeof envelope.success !== 'boolean') {
    return false;
  }

  if (envelope.success === true) {
    return envelope.data != null && envelope.error == null;
  }

  if (typeof envelope.error !== 'object' || envelope.error == null) {
    return false;
  }

  const errorPayload = envelope.error as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };

  return (
    typeof errorPayload.code === 'string' &&
    typeof errorPayload.message === 'string' &&
    'details' in errorPayload
  );
}

function mapInsightsToScenarioData(
  url: string,
  slug: string,
  insights: Record<string, unknown>,
): ProblemScenarioData {
  const useCaseRaw = insights.use_case;
  const explanationRaw = insights.explanation;
  const systemExamplesRaw = insights.system_examples;

  const systemExamples = Array.isArray(systemExamplesRaw)
    ? systemExamplesRaw.filter((item): item is string => typeof item === 'string')
    : [];

  const fallbackNarrative =
    systemExamples.length > 0
      ? systemExamples.join(' ')
      : `Insights fetched from backend for ${url}.`;

  return {
    problem: {
      slug,
      title: formatProblemTitleFromSlug(slug),
      difficulty: 'medium',
    },
    scenarios: [
      {
        id: `${slug}-remote-insight`,
        title: typeof useCaseRaw === 'string' && useCaseRaw.trim().length > 0 ? useCaseRaw : 'Real-world Application',
        narrative:
          typeof explanationRaw === 'string' && explanationRaw.trim().length > 0
            ? explanationRaw
            : fallbackNarrative,
        impact:
          systemExamples.length > 0
            ? `Examples: ${systemExamples.slice(0, 2).join(' | ')}`
            : '',
      },
    ],
    insights,
  };
}

export class RemoteScenarioProvider implements ScenarioProvider {
  async getByUrl(query: ScenarioQuery): Promise<ProblemScenarioData | null> {
    const slug = extractLeetCodeProblemSlug(query.url);
    logDebug('remote provider invoked', {
      inputUrl: query.url,
      parsedSlug: slug,
    });

    if (!slug) {
      logDebug('remote provider skipping request because URL is not leetcode problem URL');
      return null;
    }

    let parsedBody: unknown;
    let httpStatus: number | undefined;
    try {
      const endpoint = getInsightsApiUrl();
      const requestMessage = createRequestProblemInsightsMessage(query.url);

      logDebug('sending backend request', {
        endpoint,
        relay: 'background-message',
        payload: requestMessage.payload,
      });

      const responseMessage = await browser.runtime.sendMessage(requestMessage);
      if (!isProblemInsightsResponseMessage(responseMessage)) {
        throw new Error('Background relay response shape is invalid.');
      }

      if (responseMessage.ok === false) {
        httpStatus = responseMessage.status;
        throw new Error(responseMessage.error);
      }

      httpStatus = responseMessage.status;
      parsedBody = responseMessage.body;
      logDebug('received backend HTTP response via relay', {
        status: httpStatus,
        endpoint,
        body: parsedBody,
      });

      if (!isProblemInsightsEnvelope(parsedBody)) {
        throw new Error('Backend response shape is invalid.');
      }
    } catch (error) {
      logError('backend request failed', {
        endpoint: getInsightsApiUrl(),
        mode: 'remote',
        status: httpStatus,
        error,
      });

      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }

      throw new Error('Unable to connect to insights service.');
    }

    if (parsedBody.success === false) {
      logDebug('backend responded with handled error envelope', parsedBody.error);

      if (parsedBody.error.code === 'UNSUPPORTED_PLATFORM') {
        return null;
      }

      throw new Error(parsedBody.error.message);
    }

    logDebug('mapped backend insights to UI scenario data', {
      slug,
      insightKeys: Object.keys(parsedBody.data),
    });
    return mapInsightsToScenarioData(query.url, slug, parsedBody.data);
  }
}
