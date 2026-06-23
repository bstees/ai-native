# Debugging Workflow

## Metadata

- `workflow_id`: `dev-debugging`
- `name`: `Debugging`
- `category`: `investigation`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `logs`, `tests`, `local run`, `browser`, `instrumentation`
- `human_gates`: `environment risk`, `production access`, `speculative fixes`

## Purpose

Use this workflow when the primary need is investigation and narrowing, not yet
feature delivery or a finalized fix.

## Goal

The debugging goal must define what symptom is being explained or narrowed.

## Trigger

- unclear failure mode
- intermittent issue
- mismatch between expected and actual behavior with unknown cause

## Inputs

- required:
  failing symptom or anomaly
- optional:
  logs, traces, reproduction steps, timing patterns

## Default Sequence

1. State the symptom and debugging goal precisely.
2. Form a short list of plausible hypotheses.
3. Choose the cheapest discriminating check for each hypothesis.
4. Gather evidence until one explanation becomes significantly more likely.
5. If ambiguity remains high and next actions become consequential, move into
   planning before attempting a fix.
6. Only then move into fix design or escalation.

## Human Gates

- pause before probing production-only systems or sensitive data paths
- pause if the next action would require broad instrumentation or invasive edits
- pause if no hypothesis is surviving and the work needs replanning

## Output

- narrowed cause or ranked hypotheses
- supporting evidence
- recommended next step

## Local Variation Points

- whether temporary logging is acceptable
- whether debugging in production-like environments needs explicit approval
- whether investigation artifacts should be preserved in tickets or docs

## Done Criteria

- the failure is materially narrowed
- next action is justified by evidence, not guesswork
- debugging findings are captured clearly enough for follow-on work
- unresolved ambiguity is explicit if the investigation stops before a fix
