# Usability Validation Workflow

## Metadata

- `workflow_id`: `dev-usability-validation`
- `name`: `Usability Validation`
- `category`: `validation`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `browser`, `simulator`, `screenshots`, `critical user flows`, `feedback capture`
- `human_gates`: `major usability failures`, `conflicting feedback`, `release-impacting UI regressions`

## Purpose

Use this workflow when validating the usability and aesthetics of UI work before
approval or rollout.

## Goal

The validation goal must define which user flows matter, what usable behavior
looks like, and what visual or interaction risks are under review.

## Trigger

- new UI work
- component redesign
- responsive changes
- usability issues reported by users or reviewers

## Inputs

- required:
  target screen or component, critical user flows
- optional:
  screenshots, reference designs, previous feedback, accessibility concerns

## Default Sequence

1. Identify the critical user flows affected by the change.
2. Validate the UI through browser or simulator rather than relying on code
   inspection alone.
3. Check reachability of controls, visual rhythm, state clarity, and responsive
   behavior.
4. Capture issues with enough specificity that they can be fixed and rechecked.
5. Incorporate human feedback into the next validation pass instead of treating
   it as one-off commentary.
6. Repeat until the critical flows feel coherent, usable, and visually
   consistent.

## Human Gates

- pause if core controls are unreachable or blocked in important view states
- pause if usability feedback conflicts with the current design assumptions
- pause before declaring the UI complete when critical flows have not been
  exercised directly

## Output

- validated critical user flows
- captured usability findings
- explicit recommendation to approve, revise, or continue iterating

## Local Variation Points

- whether simulator coverage is mandatory in addition to browser validation
- who defines the critical flows for a feature area
- what level of aesthetic consistency is required before approval

## Done Criteria

- critical user flows were exercised directly
- controls are reachable in supported view states
- human feedback was captured and reflected in the validation record
- unresolved usability issues are explicit
