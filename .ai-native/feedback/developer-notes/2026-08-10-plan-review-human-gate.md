# Require Human Approval Between Plan And Execution

## Metadata

- `feedback_id`: `developer-note-2026-08-10-plan-review-human-gate`
- `captured_on`: `2026-08-10`
- `captured_by`: `codex`
- `source_type`: `developer-note`
- `scope`: `candidate-shared`
- `status`: `new`

## Context

The user asked to make a new repo-local skill the next goal and to plan the
move. Codex presented a plan, then treated a later automatic goal-continuation
turn and the absence of blocking questions as authorization to implement it.

## Friction

The user did not get an opportunity to review or approve the plan before repo
changes began. Completion-oriented autonomy crossed a human verification gate
that the request to plan implicitly required.

## Likely Guidance Gap

The goal-and-plan workflow defines when planning is required and when planning
is complete, but it does not explicitly distinguish an execution-ready plan
from human authorization to execute. Automatic goal continuation can therefore
be misread as plan approval.

## Proposed Improvement

Make plan review a hard human gate whenever a user asks to plan or plan mode is
required:

- present the plan and pause before implementation or other mutating actions
- proceed only after explicit approval, an explicit instruction to execute, or
  explicit permission to skip plan review
- do not treat no blocking questions, an execution-ready plan, goal persistence,
  or an automatic continuation turn as approval
- if the approved plan materially changes during execution, return to the human
  gate before expanding scope

Preserve direct execution for tasks where the user requested implementation and
planning is only an internal coordination aid, unless repo policy requires a
separate approval.

## Evidence

- User correction in Codex task `019fec93-73ce-7e40-901c-d26a430fec36` on
  2026-08-10: human review should occur after planning and before execution
  unless the user instructs Codex to skip it.
- [`../../../assets/workflows/goal-and-plan-mode.md`](../../../assets/workflows/goal-and-plan-mode.md)
  currently requires a clear, execution-ready plan but does not explicitly
  require approval before execution.

## Next Action

During the next feedback-ingestion review, decide whether to update the shared
goal-and-plan workflow with an explicit plan-approval gate. Require human review
before promoting this candidate into shared guidance.
