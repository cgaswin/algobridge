# algobridge

AI-powered browser extension that connects DSA problems to practical real-world applications.

## Stack

- WXT (MV3)
- React + TypeScript
- Tailwind CSS v4
- UI styled with LeetCode's own colour, type and spacing tokens (`assets/tailwind.css`)
- Vitest for unit tests

## Development

```bash
npm install
npm run dev
```

WXT launches a browser instance with the extension loaded.

## Scripts

- `npm run test` - run unit tests
- `npm run compile` - TypeScript check
- `npm run build` - production build
- `npm run zip` - build zipped package

## Backend API Config

Remote provider defaults to backend mode and sends `POST /api/v1/problems` with `{ "url": "..." }`.

- Dev default base URL: `http://localhost:8000`
- Current default base URL: `http://localhost:8000`

Override with env vars (WXT env naming):

- `WXT_PROBLEM_INSIGHTS_API_BASE_URL_DEV`
- `WXT_PROBLEM_INSIGHTS_API_BASE_URL_PROD`
- `WXT_PROBLEM_INSIGHTS_API_BASE_URL` (shared fallback)

Provider mode env var:

- `WXT_SCENARIO_PROVIDER_MODE=remote|dummy`

## Current Architecture

- `entrypoints/background.ts` handles the toolbar click / `Alt+Shift+A` shortcut, relays API requests, and opens the welcome page on install or when clicked outside LeetCode.
- `entrypoints/content.tsx` mounts two shadow-root UIs: the "Real-world" chip in LeetCode's chip row (auto-mounted, since LeetCode re-renders it) and the panel. It also listens for background messages.
- `entrypoints/welcome/` is the onboarding page.
- `src/ui/overlay/Panel.tsx` is the panel itself, built like a LeetCode pane: tab strip, title, chips, example-style system list, Approach/Topics accordions, feedback bar. The welcome page reuses it as a preview.
- `src/ui/overlay/OverlayApp.tsx` loads data into the panel, floats it over the editor pane, and shows an edge tab only if the inline chip can't find its anchor. Both UIs follow LeetCode's light/dark theme.
- `src/features/scenario` contains URL-based scenario providers (remote API, or dummy data).
- `src/features/feedback` stores helpfulness votes in `storage.local`.
- `src/features/leetcode/problem-url.ts` parses LeetCode problem slug from the active page URL.

## Manual QA Checklist

1. Install the extension: the welcome page opens.
2. Open `https://leetcode.com/problems/two-sum/`: a "Real-world" chip appears after Easy / Topics / Companies / Hint.
3. Open the panel via the chip, the toolbar icon, and `Alt+Shift+A` (each also closes it).
4. The panel doesn't block the editor; Escape closes it when focus is inside it.
5. The Approach and Topics chips open their accordions; thumbs up/down persists after reload.
6. Toggle LeetCode's dark mode: the panel follows.
7. Stop the API: the panel shows a friendly error with "Try again".
8. Click the toolbar icon on a non-LeetCode tab: the welcome page opens with a notice.

## Next Milestones

- Send helpfulness votes to the backend.
- Add CI (test + compile + build) and versioned release flow.

## Release Baseline

This repo now has a baseline release process:

- Semantic versioning through `package.json` version.
- Human-readable release notes in `CHANGELOG.md`.
- Required checks before tagging a release:
  - `npm run test`
  - `npm run compile`
  - `npm run build`
  - `npm run build:firefox`
