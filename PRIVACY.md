# AlgoBridge privacy policy

**Draft — last reviewed October 18, 2026.** This describes the current extension and backend source code and the hosting setup documented in the project. The owner still needs to confirm the live service providers, their settings, and a way to handle private privacy requests before treating this policy as store-ready. See the [maintainer verification checklist](docs/store/README.md#privacy-verification-before-submission).

AlgoBridge is an independent Chrome extension maintained through the [cgaswin/algobridge project](https://github.com/cgaswin/algobridge). It adds AI-generated real-world context to LeetCode problems. This policy covers the extension and its AlgoBridge API, not LeetCode, Chrome, or websites you visit through links.

## What is processed and why

- **Problem URL:** When you open or retry an explanation, the extension sends the current LeetCode problem page's full URL to the AlgoBridge API to request an explanation. If you navigate to another problem while the panel is open, it requests that problem too. The URL can include a query string or fragment; avoid using URLs containing private information. AlgoBridge does not send your solution code, editor contents, LeetCode account details, or cookies in this request.
- **Public problem content and AI explanations:** The API identifies the problem by its canonical slug (for example, `two-sum`). When a matching cached explanation is unavailable, it requests public problem information from LeetCode's GraphQL service. It sends the problem's title, difficulty, topic tags, and description to Google's Gemini API to generate an explanation. The Gemini prompt does **not** contain your submitted full URL, your code, or your local helpfulness vote. Generated explanations are cached and may be returned to other users requesting the same problem.
- **Server records:** The database stores the first full URL used to create a problem record, its platform and canonical slug, generated insight data, model/prompt version, and creation/update timestamps. Caching is by canonical problem and model/prompt version, not by user account. A later cache hit does not create a new per-user database record, but requests can still appear in logs.
- **Connection and diagnostic information:** Your browser connects to the API, so the hosting infrastructure receives network information such as your IP address and request metadata. Server access logs can contain client IP addresses, request paths, times, and status codes; application/provider diagnostics may contain additional technical details. This is separate from the full problem URL submitted in the JSON request body and stored as described above. The deployed logging settings and retention have not yet been verified. Browser console diagnostics can also include URLs and errors; debug builds log more details. Do not share logs without checking for private information.
- **Local feedback:** On LeetCode, helpful/unhelpful votes are saved in Chrome's extension-local storage with the problem slug and vote timestamp. They are not sent to the AlgoBridge API. The welcome page's example votes are only held in page memory and are lost when that page reloads or closes.

The current extension has no AlgoBridge account requirement, advertising integration, or analytics integration. That does not mean no data leaves your browser: the requests and storage above are part of providing explanations.

## Who receives data

The documented service setup uses these parties; the owner must confirm that this matches the live deployment:

| Recipient | Data and role |
| --- | --- |
| AlgoBridge maintainer and **Render** (API hosting) | The API receives the full problem URL and network/request metadata to serve explanations. The maintainer can access server records and logs; Render operates the hosting infrastructure. See [Render's privacy policy](https://render.com/privacy) and [logging documentation](https://render.com/docs/logging). |
| **Neon** (PostgreSQL hosting) | Hosts the database containing first-seen full URLs, canonical problem records, cached explanations, versions, and timestamps. See [Neon's privacy policy](https://neon.com/privacy-policy) (currently redirects to Databricks) and [backup documentation](https://neon.com/docs/manage/backups). |
| **LeetCode** | Receives the problem slug in a backend GraphQL request and the backend's connection metadata when problem content is fetched. AlgoBridge does not forward your LeetCode login cookies. Your own browsing on LeetCode is separately covered by [LeetCode's privacy policy](https://leetcode.com/privacy/). |
| **Google Gemini API** | Receives the public problem content and generation instructions, and produces the explanation. Google also receives the backend/API account's technical usage information, not a direct request from your browser. See [Gemini API terms](https://ai.google.dev/gemini-api/terms) and [abuse-monitoring information](https://ai.google.dev/gemini-api/docs/usage-policies). |
| **GitHub** | Hosts this policy, project documentation, and public support issues. GitHub receives your connection information when you visit, and anything you choose to post there, under [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). The extension does not send explanation requests or votes to GitHub. |

**Google's data use depends on the service and tier.** Google's Gemini terms distinguish unpaid and paid services: unpaid-service inputs and outputs may be used to improve Google's products and machine-learning technologies and may be reviewed by people; paid-service terms have different data-use protections. Abuse monitoring can involve retention and review even when content is not used for product improvement. Regional terms can also differ. AlgoBridge's active billing/data-use tier has not been verified, so this policy does not promise that Google will never use submitted public problem content or generated output for improvement or training. Do not submit private information through problem URLs or support messages.

Provider policies and contracts also govern their own processing, subprocessors, and retention. This policy does not promise a particular processing country or provider-wide deletion period.

## Retention and your choices

- **On your device:** Local votes remain until the extension's local storage is cleared or the extension is uninstalled. There is currently no in-product clear-votes button. Removing AlgoBridge from Chrome removes its extension-local data; clearing ordinary website browsing data is not the same as clearing extension storage.
- **On the server:** Problem records, first-seen full URLs, and cached insights have **no automatic expiry or deletion schedule** in the current backend. They can remain indefinitely until manually deleted by the maintainer. A changed model or prompt can replace cached insight content; it does not delete the first-seen URL. Uninstalling the extension does not delete server records.
- **With providers:** Log retention, database backup/history retention, and Gemini retention depend on provider terms and the deployed plan/settings. Those active settings have not been confirmed. Manual deletion from the application database would not necessarily remove provider logs or backup copies immediately. No fixed deletion deadline is promised here.
- **Stop future requests:** Do not open/retry the explanation panel, or disable/uninstall the extension. Closing a panel does not undo requests already sent. The welcome example uses bundled example data rather than requesting an AI explanation.

There is currently no self-service server-data lookup or deletion tool, and no verified private request channel. Server cache records are not linked to AlgoBridge user accounts. Do not post a sensitive URL or identifying information publicly to seek deletion.

## Questions, accuracy, and updates

Use [GitHub Issues](https://github.com/cgaswin/algobridge/issues) for non-sensitive questions, privacy concerns, or to ask the maintainer how to arrange private contact. **Issues are public: do not include private URLs, code, account details, IP addresses, or logs.** A private contact route and the process for privacy requests still require owner confirmation; this draft does not imply that opening an issue guarantees deletion or a response deadline.

AI explanations can be wrong, including claims about named products. Check important details independently. AlgoBridge is not affiliated with or endorsed by LeetCode. Third-party sites and services have their own policies; opening their links is outside this extension's data handling.

Changes to this policy will be recorded in this repository with an updated review date. The intended public policy address is [this file on the main branch](https://github.com/cgaswin/algobridge/blob/main/PRIVACY.md); it will only contain this policy after merge.
