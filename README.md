# algobridge

AI-powered browser extension that connects DSA problems to practical real-world applications.

## Stack

- WXT (MV3)
- React + TypeScript
- Tailwind CSS v4
- shadcn-style UI components
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

## Current Architecture

- `entrypoints/background.ts` handles extension action click and sends open-overlay messages.
- `entrypoints/content.tsx` mounts in-page React UI in a shadow root and listens for background messages.
- `src/ui/overlay/OverlayApp.tsx` renders the modal shell and state (loading/success/empty/error).
- `src/features/scenario` contains URL-based scenario provider/service (dummy data for now).
- `src/features/leetcode/problem-url.ts` parses LeetCode problem slug from the active page URL.

## Manual QA Checklist (MVP)

1. Open `https://leetcode.com/problems/two-sum/`.
2. Click extension icon: overlay opens in-page.
3. Verify close interactions:
   - close button
   - backdrop click
   - Escape key
4. Verify data states:
   - known slug (`two-sum`) shows scenario
   - unknown slug (`/problems/some-new-problem/`) shows fallback scenario
   - non-problem pages do not mount content script UI

## Next Milestones

- Replace dummy provider with backend provider using URL-only request contract.
- Persist feedback actions in extension storage.
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
