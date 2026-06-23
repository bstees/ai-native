# Feature Delivery Workflow

## Metadata

- `workflow_id`: `dev-feature-delivery`
- `name`: `Feature Delivery`
- `category`: `development`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `repo search`, `file read`, `edit`, `tests`, `build`, `browser if needed`
- `human_gates`: `scope ambiguity`, `high-blast-radius changes`, `release-impacting behavior`

## Purpose

Use this workflow when implementing a new feature or a meaningful enhancement to
existing behavior.

## Trigger

- a new feature request
- a scoped enhancement
- a backlog item that changes user or developer-facing behavior

## Inputs

- required:
  task goal, target repo, affected area if known
- optional:
  designs, acceptance criteria, screenshots, linked issues

## Default Sequence

1. Understand the existing code path, adjacent conventions, and any relevant
   instructions or rules.
2. Identify the minimum viable implementation slice and note assumptions.
3. Make the smallest useful code changes that satisfy the requested behavior.
4. Add or update tests for changed behavior.
5. Run verification appropriate to the change.
6. Summarize what changed, what was verified, and any residual risk.

## Human Gates

- pause when the request has multiple plausible implementations with
  non-obvious tradeoffs
- pause before changes with broad architectural or release impact
- pause before destructive migrations or irreversible data changes

## Output

- implemented code
- updated tests
- clear verification summary

## Local Variation Points

- whether a written plan is required before editing
- whether architectural review is mandatory above a certain file-count or
  module-count threshold
- whether feature flags are required by default

## Done Criteria

- feature behavior is implemented
- relevant tests are present or updated
- verification was run and reported
- assumptions and risks are explicit
