# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog and this project follows semantic versioning.

## [0.1.0] - 2026-03-20

### Added

- Bootstrapped WXT + React + TypeScript extension foundation.
- Wired extension action click to content script open-overlay messaging.
- Implemented in-page modal overlay UI with shadcn-style components.
- Added URL-based dummy scenario service and provider abstraction.
- Added helpfulness vote persistence in extension storage.
- Added provider mode switch (`dummy` / `remote`) with remote scaffold.
- Added LeetCode SPA route-change handling to refresh overlay data.
- Added unit tests for messaging, URL parsing, scenario service, and feedback storage.

### Fixed

- Firefox toolbar action compatibility (`browserAction`) and host matching.
