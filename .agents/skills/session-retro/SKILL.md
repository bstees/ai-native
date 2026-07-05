---
name: session-retro
description: Capture avoidable friction, ambiguity, repeated correction, validation pain, and other improvement opportunities at the end of meaningful work. Use when a task was harder, more expensive, or more iterative than it should have been and the system should learn from it.
---

# Session Retro

## Use This Skill When

- the task required too many turns
- guidance was missing, duplicated, or ambiguous
- validation was harder than it should have been
- repeated human correction revealed a predictable weakness
- a new skill, stronger workflow, or topology change may be justified

## Goal

Turn avoidable task difficulty into structured feedback that can improve the
system.

## Read First

- [`planning/instruction-system-architecture.md`](../../../planning/instruction-system-architecture.md)
- [`../../../assets/feedback/feedback-ingestion-standard.md`](../../../assets/feedback/feedback-ingestion-standard.md)
- [`../../../assets/feedback/feedback-entry-template.md`](../../../assets/feedback/feedback-entry-template.md)

Read this too if the work involved UI:

- [`../../../assets/quality/usability-validation-standard.md`](../../../assets/quality/usability-validation-standard.md)

## Workflow

1. Describe what made the task harder than it should have been.
2. Decide whether the pain was:
   - one-off
   - repo-local and repeatable
   - likely cross-repo
3. Classify the likely improvement target:
   - topology
   - missing skill
   - weak skill
   - workflow gap
   - standard gap
   - validation gap
4. If improvement is warranted, emit concise markdown feedback using the repo's
   local feedback convention.
5. Recommend whether the result should stay local, be reviewed later, or be
   considered for shared promotion.

## Output

- a short retro summary
- the likely source of the avoidable difficulty
- the recommended next system improvement
- a feedback markdown entry when the issue is repeatable enough to matter

## Guardrails

- do not create feedback for trivial inconvenience
- do not confuse inherent complexity with a broken system
- keep retros concise and action-oriented
- shared-system changes still require human review before promotion
