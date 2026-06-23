# Code Review Workflow

## Metadata

- `workflow_id`: `dev-code-review`
- `name`: `Code Review`
- `category`: `review`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `diff`, `tests`, `lint/build output`, `targeted file reads`
- `human_gates`: `security findings`, `behavioral uncertainty`, `approval decisions`

## Purpose

Use this workflow when evaluating an existing change set for correctness, risk,
and readiness.

## Goal

The review objective must be clear: identify whether the change is safe,
correct, sufficiently validated, and ready for the next stage.

## Trigger

- pull request review
- pre-merge review
- AI-generated change review

## Inputs

- required:
  diff or change set, affected files
- optional:
  ticket context, screenshots, test output, release context

## Default Sequence

1. Understand the change intent before judging the implementation.
2. Review for correctness, regressions, missing tests, modularity, reuse, and
   contract adherence.
3. Review validation depth, especially for refactors, logic-heavy areas, and UI
   components.
4. Prioritize findings by severity and user or system impact.
5. Verify claims with nearby code, tests, or outputs when needed.
6. Report findings first, then open questions or residual risk.

## Human Gates

- pause before approving security-sensitive or financially consequential changes
- pause if the intent of the change is still unclear after inspection
- pause if release timing changes the acceptable level of risk

## Output

- prioritized findings
- open questions or assumptions
- explicit statement if no findings were found

## Local Variation Points

- whether style and architecture feedback should be included alongside bugs
- whether reviewers are expected to propose fixes or only identify issues
- whether approval authority differs by repo area

## Done Criteria

- the most material risks have been surfaced
- findings are evidence-based
- confidence and residual uncertainty are explicit
- approval is not recommended while lint, tests, or build health are failing
