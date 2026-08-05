## Findings

- **P1 — Cross-organization authorization bypass.** [src/access.js:2](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-control-code-review-evidence-ziNKo4/src/access.js:2) allows every `viewer` to access every document, regardless of organization. Verified: an `alpha` viewer receives `true` for a `beta` document. This breaks the existing organization-scoped access contract and risks cross-tenant data exposure.

- **P2 — Missing denial-boundary test.** [tests/access.test.js:4](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-control-code-review-evidence-ziNKo4/tests/access.test.js:4) tests only same-organization access. It lacks a cross-organization viewer case expected to return `false`, so the authorization regression passes the targeted test.

The quote-style change is harmless.

Validation: `node tests/access.test.js` passed. `npm test` failed earlier in the unrelated pagination test, so the aggregate runner never reached the access test. No files were modified.
