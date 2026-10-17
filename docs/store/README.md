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
2. Publish a publicly accessible privacy policy describing the actual data flow: problem URLs sent to the API, AI processing, server/provider retention and logging, local votes, and a contact method. Confirm backend/provider practices before making retention claims. Link it from the listing and README.
3. Run `npm ci`, `npm run test`, `npm run compile`, and `npm run zip` from the repository root. The upload is `.output/algobridge-1.0.0-chrome.zip` for the current version; use the newly generated versioned ZIP for later releases.
4. Load `.output/chrome-mv3` unpacked and complete the manual checks in the root README against the production API. Inspect the generated manifest: no localhost API permission, development tooling, or unnecessary permissions.
5. Create a new dashboard item and upload the ZIP (not the repository or source archive).
6. Fill in the description, category, language, support URL, and privacy-policy URL. Upload the icon, three screenshots, and small promo tile listed above. Review the dashboard's current asset requirements.
7. Complete Privacy practices and permission justifications. Single purpose: explain practical applications of LeetCode problems. `storage`: save helpfulness votes locally. API host access: request explanations. LeetCode site access: the content script runs across LeetCode pages to handle navigation, displaying the chip and panel on problem pages. Disclose URL transmission and actual backend processing accurately; do not claim that all data stays on-device.
8. Supply reviewer instructions: open `https://leetcode.com/problems/two-sum/description/`, click **Real-world**, and allow time for a cold API start. No AlgoBridge login or user-provided API key is required. Check service availability before submitting.
9. Choose distribution/visibility, submit for review, and address any feedback. Review timing varies. After approval, verify the installed store build and add the real store link to the README—do not use a placeholder install badge.

For updates, increment `package.json` and the lockfile version, rerun checks, generate a fresh ZIP, and upload it to the existing dashboard item.

## Not done by preparing these files

- Developer account registration and payment.
- Publishing/verifying a privacy policy and completing data disclosures.
- Final production smoke test and editorial fact-check of generated examples.
- Store submission or approval.
