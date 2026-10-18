# Chrome Web Store release assets

## Ready-to-upload artwork

| File | Size | Purpose |
| --- | --- | --- |
| `../../public/icon/128.png` | 128 × 128 | Store icon; 96px artwork with transparent padding |
| `two-sum-light.png` | 1280 × 800 | Screenshot 1: real-world context in light mode |
| `lru-cache-dark.png` | 1280 × 800 | Screenshot 2: examples in dark mode |
| `islands-approach.png` | 1280 × 800 | Screenshot 3: optional approach explanation |
| `promo-small.png` | 440 × 280 | Small promotional tile |

Screenshots were captured from the built extension on LeetCode with API responses, not mocked UI. The dark screenshot uses LeetCode's dark theme classes. They show generated examples, not independently verified claims about named products. Review the examples for accuracy before submission and recapture if the UI changes. Keep assets here, outside `public/`, so they do not inflate the extension package.

The icon's editable sources are `public/icon/icon.svg` and the simplified `public/icon/icon-16.svg`. Chrome uses the accompanying 16, 32, 48, and 128px PNGs.

## Suggested listing copy

**Name:** AlgoBridge

**Short description:** Connects DSA problems on LeetCode to practical real-world industry scenarios.

**Detailed description:**

AlgoBridge helps you understand why the algorithms you practice matter. Open a LeetCode problem and click the Real-world chip to see practical applications alongside the problem.

• Explore real-world use cases and examples of systems using related ideas.
• Reveal the approach and algorithm topics when you're ready; they stay collapsed by default.
• Use a panel that follows LeetCode's light and dark themes.
• Toggle the panel with the Real-world chip, toolbar icon, or Alt+Shift+A.
• Save helpfulness votes locally in your browser.

Explanations require an internet connection and are AI-generated, so they may contain mistakes. Approach explanations can reveal solution techniques. AlgoBridge is an independent project and is not affiliated with or endorsed by LeetCode.

## Submission checklist

1. Register at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole), pay the registration fee shown there, and complete the account and security requirements.
2. Complete the [privacy verification checklist](#privacy-verification-before-submission) below and review the [policy draft](../../PRIVACY.md). After owner confirmation, update its draft status/date, merge it to `main`, and verify https://github.com/cgaswin/algobridge/blob/main/PRIVACY.md is readable without signing in. Use that GitHub-rendered URL in the dashboard's privacy-policy field; no new hosting is required. The README and welcome footer already target this policy, but the main-branch link will not contain it until merge. Do not submit the draft as a verified, store-ready policy.
3. Run `npm ci`, `npm run test`, `npm run compile`, and `npm run zip` from the repository root. The upload is `.output/algobridge-1.0.0-chrome.zip` for the current version; use the newly generated versioned ZIP for later releases.
4. Load `.output/chrome-mv3` unpacked and complete the manual checks in the root README against the production API. Inspect the generated manifest: no localhost API permission, development tooling, or unnecessary permissions.
5. Create a new dashboard item and upload the ZIP (not the repository or source archive).
6. Fill in the description, category, language, support URL, and privacy-policy URL. Upload the icon, three screenshots, and small promo tile listed above. Review the dashboard's current asset requirements.
7. Complete Privacy practices and permission justifications. Single purpose: explain practical applications of LeetCode problems. `storage`: save helpfulness votes locally. API host access: request explanations. LeetCode site access: the content script runs across LeetCode pages to handle navigation, displaying the chip and panel on problem pages. Disclose full URL transmission/retention, network/request metadata and possible IP logging, AI processing by Google, and the receiving parties in the policy. Review the dashboard's current definitions (including web history/URL data and any personal identifiers in URLs/logs). Do not claim that all data stays on-device, that nothing is stored, that there is guaranteed timed deletion, or that Gemini never uses data for improvement/training without verifying the applicable service terms and tier.
8. Supply reviewer instructions: open `https://leetcode.com/problems/two-sum/description/`, click **Real-world**, and allow time for a cold API start. No AlgoBridge login or user-provided API key is required. Check service availability before submitting.
9. Choose distribution/visibility, submit for review, and address any feedback. Review timing varies. After approval, verify the installed store build and add the real store link to the README—do not use a placeholder install badge.

For updates, increment `package.json` and the lockfile version, rerun checks, generate a fresh ZIP, and upload it to the existing dashboard item.

## Privacy verification before submission

The [privacy policy](../../PRIVACY.md) is deliberately labeled **draft**, not a store-readiness claim. No policy hosting, submission, or deployment has been performed by adding these files.

### Source facts checked on October 18, 2026

Read-only trace: extension `origin/main` at `cef0166d4706504e1a0d69e70cd0a7b279be324c`; backend `origin/main` at `adebdf547e81d839d563429104e53d14f37fd6cd`. No environment files, secrets, or provider dashboards were inspected.

- `OverlayApp.tsx` requests on panel open/retry and navigation while open; `remote-provider.ts` and `entrypoints/background.ts` relay `window.location.href` as JSON `url`. Code/editor contents and LeetCode login cookies are not forwarded. The backend receives the full URL, including any query/fragment.
- Backend `app/services/problem_service.py` uses a canonical slug and model/prompt version for cache lookup. On a miss, `app/platforms/leetcode.py` requests public GraphQL content by slug without the user's cookies. `app/llm/prompts.py` sends title, difficulty, tags, and description to Gemini, not the full submitted URL or user code.
- Backend `app/db/models.py` and `app/db/repository.py` persist `problems.raw_url_first_seen`, canonical identity, insight JSON, version, and timestamps. There is no automatic TTL, deletion endpoint, or deletion job in this baseline. Cache hits do not record each visitor in the database. Do not confuse this with absence of access logs.
- `scripts/start.sh` runs Uvicorn with access logs enabled by default and proxy headers enabled. Client IPs/request metadata can appear in logs; actual forwarding and logging settings need live verification.
- `render.yaml` describes Render hosting and a Neon database; the backend README describes Render + Neon. These are documented providers, not proof of the active deployment or its plans, regions, backups, retention, or log exports.
- `src/features/feedback/storage.ts` stores slug, vote, and timestamp in `browser.storage.local`; welcome votes use React state only. `src/shared/logger.ts` writes browser-console diagnostics (including URLs in some paths), not an analytics endpoint.
- Unmerged rate-limiter or generation-budget work is not part of this trace and is not claimed to be deployed.

### Official provider references checked on October 18, 2026

These pages were fetched directly over HTTPS. Checking a public page verifies its documentation, **not** this project's service configuration. Recheck at release; provider terms can change.

| Reference | Observation / limit |
| --- | --- |
| [Chrome Web Store privacy policy requirements](https://developer.chrome.com/docs/webstore/program-policies/privacy) | Requires a policy for products handling user data, covering collection/use/sharing and all receiving parties, linked in the dashboard. A repository draft is not completion of store disclosures. |
| [Gemini API additional terms](https://ai.google.dev/gemini-api/terms) | Unpaid vs paid services have different input/output improvement and human-review terms; paid access depends on active billing, not just model name. Regional rules differ. Terms also restrict age/audience, supported regions, and require paid services for API clients offered in the EEA, Switzerland, or UK. Owner must review product eligibility/distribution, not just privacy wording. |
| [Gemini abuse monitoring](https://ai.google.dev/gemini-api/docs/usage-policies) | Describes prompt/context/output retention for abuse monitoring (55 days at this review) and authorized human review. This is not a promise that all Google data is deleted after that period, nor proof of the active tier. The public policy intentionally makes no fixed-day guarantee. |
| [Render privacy](https://render.com/privacy), [logging](https://render.com/docs/logging) | Logs and log availability depend on workspace plan; exports can have separate retention. General provider privacy text does not establish this app's log configuration. |
| [Neon privacy](https://neon.com/privacy-policy), [backups](https://neon.com/docs/manage/backups) | Privacy URL redirected to `https://www.databricks.com/legal/privacynotice`; backup URL redirected to `https://neon.com/docs/postgres/backup-restore/backups`. Restore history/backups depend on plan and settings. Neither verifies this database's actual retention. |
| [GitHub privacy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) | Covers policy/docs visits and support issues; public issue content must not contain private information. |
| [LeetCode privacy](https://leetcode.com/privacy/) | Automated retrieval returned HTTP 403. Manually verify in a browser before submission; its content was not verified in this review. |

### Owner confirmations / publication gate

- [ ] Confirm the live API is actually hosted by Render with Neon Postgres and Google Gemini. Identify any other recipients, proxies, monitoring services, log drains, or subprocessors relevant to this service; update the policy accordingly.
- [ ] Confirm live logging fields/access, Render plan/retention and exports, database backup/restore history, processing regions, and who can access records. Do not substitute provider marketing claims for deployed settings.
- [ ] Verify the Gemini API project's active billing/data-use tier and applicable regional terms; confirm age/audience and distribution eligibility under the current terms. Do not promise no training or review based on a free-tier README or a model name.
- [ ] Confirm who operates AlgoBridge and provide a working **private** privacy-request contact/process if needed. GitHub Issues is the existing public support route, not a private deletion channel. Do not invent an email address or invite sensitive public issue reports. Establish how manual requests can be handled, including logs/backups, without promising a tool or deadline that does not exist.
- [ ] Decide whether indefinite server retention remains appropriate. If changing it, implement and verify deletion before changing the policy; no TTL is implemented by this documentation change.
- [ ] Manually open LeetCode's privacy page, review all provider references, finalize the policy/date and remove the draft label only when its owner-specific facts are confirmed. Reconcile the README's draft wording too.
- [ ] Merge the policy and links to `main`; verify the intended public URL without signing in, README relative links, and the welcome footer link in the built extension. The main-branch URL may return 404 until merge; a branch preview is not publication at the intended URL.
- [ ] Use the final public URL in the store dashboard, match privacy-practices answers and in-product disclosures to the real deployed data flow, and complete production/manual release checks. Do not claim approval or publication from passing local tests.

## Not done by preparing these files

- Developer account registration and payment.
- Owner verification, finalizing/publishing the privacy policy, and completing data disclosures (the checked-in draft alone does not complete these).
- Final production smoke test and editorial fact-check of generated examples.
- Store submission or approval.
