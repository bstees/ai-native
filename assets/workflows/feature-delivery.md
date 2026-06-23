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

## Goal

The feature objective must be concrete before coding starts.

If the goal is large, high-risk, ambiguous, or cross-cutting, the work should
move through an explicit planning stage before implementation.

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

1. State the goal clearly enough that success and scope can be checked.
2. If the goal is large or risky, produce a plan before editing.
3. Understand the existing code path, adjacent conventions, and any relevant
   instructions or rules.
4. Identify the minimum viable implementation slice and note assumptions.
5. Make the smallest useful code changes that satisfy the requested behavior.
6. Refactor adjacent code only when validation strength is sufficient to
   protect the change.
7. Add or update tests for changed behavior.
8. Run verification appropriate to the change, including stronger validation
   where structural refactors or UI behavior are involved.
9. Summarize what changed, what was verified, and any residual risk.

## Human Gates

- pause when the request has multiple plausible implementations with
  non-obvious tradeoffs and planning has not resolved them
- pause before changes with broad architectural or release impact
- pause before destructive migrations or irreversible data changes

## Output

- implemented code
- updated tests
- clear verification summary

## Local Variation Points

- what threshold triggers mandatory plan mode
- whether architectural review is mandatory above a certain file-count or
  module-count threshold
- whether feature flags are required by default

## Done Criteria

- feature behavior is implemented
- relevant tests are present or updated
- modularity and contract boundaries remain sound
- verification was run and reported
- assumptions and risks are explicit
