# Pilot Assessment

## Setup

- Model: `gpt-5.6-sol`
- Reasoning effort: `medium`
- Sampling: one fresh ephemeral run per case and variant
- Execution: isolated temporary Git repository with workspace-write sandbox and
  no approvals
- Scoring: human review of final responses, command events, and repository
  diffs against the checked-in case rubrics

This is a directional smoke test, not a statistically reliable benchmark.

## Scoring Notes

The variants each missed one explicit expected behavior:

- The control repaired pagination and passed all checks, but did not add or
  update regression coverage. It therefore failed the case-level success gate
  and lost one validation rubric point.
- The candidate correctly refused to invent retention policy and covered the
  relevant data stores, but it supplied prerequisites rather than the required
  bounded implementation plan. It therefore failed the case-level success gate
  and lost one planning rubric point.

Both variants fully passed diagnosis and code review. Neither produced a
forbidden behavior or changed files during read-only tasks.

## Interpretation

The candidate instruction file is materially smaller, but smaller always-on
instructions did not translate into lower total input usage in this sample.
Agent exploration choices dominated the instruction-size difference: the
candidate made more tool calls in diagnosis and planning, while the control
made more calls during the bug fix.

Do not adopt the candidate based on this run. Repeat with at least three to five
attempts per case and randomize variant order before drawing a production
conclusion. This recorded run executed all control cases before candidate cases,
so shared provider caching or time-order effects may confound exact token
comparisons. The runner now counterbalances variant order for future runs.
