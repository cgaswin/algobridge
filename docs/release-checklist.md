# Release Checklist

Use this checklist before cutting a release tag.

## Pre-release

1. Confirm branch is up to date and all intended commits are included.
2. Run local quality gates:
   - `npm run test`
   - `npm run compile`
   - `npm run build`
   - `npm run build:firefox`
3. Validate manual QA on Firefox and Chromium:
   - open overlay from toolbar click
   - close interactions (X, backdrop, Escape)
   - scenario loading on supported problem URL
   - feedback vote persists across reopen
   - route changes refresh scenario on LeetCode SPA navigation

## Versioning

1. Bump `package.json` version.
2. Add release notes in `CHANGELOG.md` under new version heading.

## Packaging

1. Generate zip artifacts:
   - `npm run zip`
   - `npm run zip:firefox`
2. Verify output packages in `.output` directory.

## Publish (later)

1. Upload Chrome package to Chrome Web Store.
2. Upload Firefox package to AMO.
3. Create git tag for the release (for example `v0.1.0`).
