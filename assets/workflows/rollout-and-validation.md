# Rollout and Validation Workflow

## Metadata

- `workflow_id`: `dev-rollout-validation`
- `name`: `Rollout and Validation`
- `category`: `delivery`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `tests`, `build`, `deployment checks`, `browser checks`, `monitoring`
- `human_gates`: `production rollout`, `cross-repo rollout`, `rollback decisions`

## Purpose

Use this workflow when a validated change or shared asset is about to be rolled
out to a consumer repo, environment, or user-facing surface.

## Trigger

- deployment readiness check
- shared asset rollout
- pilot promotion
- post-change validation

## Inputs

- required:
  candidate change or asset, target repo or environment
- optional:
  rollout notes, monitoring plan, rollback plan

## Default Sequence

1. Confirm what is being rolled out and where.
2. Verify prerequisites, dependencies, and validation coverage.
3. Apply the rollout in the narrowest safe scope first when possible.
4. Run post-rollout checks against the intended behavior.
5. Record outcome, issues, and whether to promote, revise, or rollback.

## Human Gates

- pause before production rollout or cross-repo default adoption
- pause before rollout when rollback is unclear
- pause if validation results are mixed or incomplete

## Output

- rollout result
- validation evidence
- recommendation to promote, revise, or rollback

## Local Variation Points

- whether canary or staged rollout is required
- what monitoring depth is mandatory
- who can authorize promotion to broader adoption

## Done Criteria

- rollout target is updated intentionally
- validation confirms the expected result or clearly documents failure
- next rollout decision is explicit
