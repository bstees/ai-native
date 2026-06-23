# Bug Fix Workflow

## Metadata

- `workflow_id`: `dev-bug-fix`
- `name`: `Bug Fix`
- `category`: `development`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `repo search`, `logs`, `tests`, `edit`, `repro steps`
- `human_gates`: `unclear root cause`, `possible regression risk`, `production-sensitive changes`

## Purpose

Use this workflow when a defect needs to be reproduced, diagnosed, fixed, and
verified.

## Goal

The bug objective must be specific enough to distinguish the failing behavior,
the expected behavior, and the validation target.

## Trigger

- reported bug
- failed test with behavioral impact
- regression identified during review or QA

## Inputs

- required:
  bug description, expected behavior, observed behavior
- optional:
  logs, screenshots, failing test, environment details

## Default Sequence

1. State the bug goal in terms of failing behavior and desired correction.
2. Reproduce the issue or confirm the failing condition.
3. Narrow the likely cause using code inspection, logs, or targeted tests.
4. If the cause or likely fix remains ambiguous, step back into planning before
   editing.
5. Fix the root cause instead of masking the symptom when possible.
6. Add or update a test that would catch the bug again.
7. Re-run the failing path and the new or relevant regression checks.
8. Report the root cause, the fix, and confidence level.

## Human Gates

- pause if the issue cannot be reproduced and the next move would be guesswork
- pause if the likely fix risks changing unrelated behavior
- pause if a hotfix path or production mitigation decision is needed

## Output

- root-cause-oriented fix
- regression coverage
- explicit verification of the original failing path

## Local Variation Points

- how much repro evidence is required before coding
- whether temporary mitigations are allowed before root-cause resolution
- whether production bugs require a separate incident or postmortem artifact
- whether mutation testing is expected for logic-heavy fixes

## Done Criteria

- original bug path is addressed
- regression protection exists where practical
- verification covers both the original issue and nearby risk areas
- no new lint, build, or test failures remain
