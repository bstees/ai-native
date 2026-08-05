# Decision Record: Instruction Evaluation Framework

## Metadata

- `decision_id`: `DR-2026-08-05-001`
- `title`: Evaluate AI-facing instructions as behavioral configuration
- `status`: `approved`
- `decided_on`: `2026-08-05`
- `owner`: `ai-native`
- `linked_concepts`:
  - `quality/instruction-evaluation`
  - `quality/token-efficiency`
  - `control/behavioral-validation`

## Decision

AI Native will maintain a reusable instruction-evaluation framework that
compares control and candidate guidance using stable cases, matching model
settings, task-level success, normalized quality, forbidden behaviors, human
corrections, and provider-reported token usage.

Instruction-size reduction is acceptable only when safety, quality, and success
do not regress. Small pilot samples are directional evidence rather than proof
of statistical significance.

## Context

AI-facing Markdown changes agent behavior but previously lacked a repeatable
way to measure whether a smaller or reorganized instruction set preserved the
outcomes that matter. Character count alone ignores retries, exploration,
failures, and human correction, while subjective review alone is difficult to
compare over time.

## Outcome

- maintain schema-validated evaluation cases and run records
- compare variants under the same model identifier and settings
- use deterministic assertions where outcomes are machine-observable
- retain rubric scoring for judgment-heavy behavior
- preserve pilot evidence and its limitations
- reject candidates with safety, quality, or success regressions

## Human Gates

- approve consequential rubric or acceptance-rule changes
- review and score judgment-heavy attempts
- decide whether directional evidence is strong enough for adoption
- review raw run artifacts before publication when they may contain sensitive
  repository or provider information

## Review Trigger

Revisit after repeated scoring disagreement, evidence that the acceptance rule
selects worse instructions, material provider telemetry changes, or enough runs
to justify confidence intervals and stronger statistical treatment.
