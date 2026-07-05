# AI Native Agents

## Purpose

This repo curates shared native-AI standards, workflows, and assets that can be
used across production repositories.

## Always-On Rules

- Start every task with a clear goal.
- Use plan mode for larger, riskier, ambiguous, or cross-cutting work.
- Keep changes modular, contract-adherent, and strongly validated.
- Reference canonical guidance instead of restating it.
- Capture avoidable friction when the system made the work harder than it
  should have been.

## Canonical Map

- Repo behavior:
  [`assets/repo-rules/ai-native-core-operating-rules.md`](./assets/repo-rules/ai-native-core-operating-rules.md)
- Plan mode:
  [`assets/workflows/goal-and-plan-mode.md`](./assets/workflows/goal-and-plan-mode.md)
- Engineering quality:
  [`assets/quality/engineering-quality.md`](./assets/quality/engineering-quality.md)
- Feedback ingestion:
  [`assets/feedback/feedback-ingestion-standard.md`](./assets/feedback/feedback-ingestion-standard.md)
- Instruction architecture:
  [`planning/instruction-system-architecture.md`](./planning/instruction-system-architecture.md)

## Workflow And Skill Rule

- Use the narrowest workflow and smallest useful skill set for the task.
- Keep sub-agents tightly scoped and give them only the context they need.
- Prefer repo-local skills for repeatable techniques over growing this file.

## DRY And Evolution Rule

- Canonical guidance should exist once; everything else should reference, scope,
  apply, or improve it.
- When meaningful work exposes avoidable duplication, ambiguity, or repeated
  correction, leave feedback that can improve topology, workflows, or skills.
