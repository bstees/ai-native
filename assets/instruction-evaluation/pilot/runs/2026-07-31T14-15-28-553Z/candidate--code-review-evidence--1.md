## Findings

- **P1 — Cross-organization authorization bypass** — [src/access.js:2](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-code-review-evidence-nZOioq/src/access.js:2)
  `user.role === "viewer"` independently grants access, so a viewer from organization `alpha` can access a document owned by `beta`. Direct execution confirmed this returns `true`. The viewer permission must remain constrained by the organization boundary.

- **P2 — Missing negative boundary coverage** — [tests/access.test.js:4](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-code-review-evidence-nZOioq/tests/access.test.js:4)
  Tests cover only a same-organization editor. There is no assertion that a viewer with a mismatched `organizationId` is denied, which would expose this regression.

Validation: the isolated access test passes, but `npm test` fails before reaching it due to an unrelated existing pagination assertion (`[1]` returned instead of `[1, 2]`). `git diff --check` passes. No files were modified.
