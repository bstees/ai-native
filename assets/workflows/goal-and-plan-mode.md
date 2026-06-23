# Goal and Plan-Mode Workflow

## Metadata

- `workflow_id`: `dev-goal-plan-mode`
- `name`: `Goal and Plan Mode`
- `category`: `planning`
- `status`: `plan-mode-default`
- `owner`: `ai-native`
- `tools`: `goal clarification`, `repo context`, `risk framing`, `task decomposition`
- `human_gates`: `scope ambiguity`, `high-risk tradeoffs`, `cross-cutting impact`

## Purpose

Use this workflow to establish a clear objective and determine whether the work
must proceed in plan mode before implementation.

## Goal

Every unit of work must begin with a clear goal. This workflow exists to make
that requirement explicit and reusable.

## Trigger

- a new task starts
- the request is ambiguous
- the work touches multiple modules, repos, or systems
- the likely blast radius is non-trivial

## Inputs

- required:
  desired outcome, target repo, known constraints
- optional:
  acceptance criteria, issue context, screenshots, linked artifacts

## Default Sequence

1. State the goal in concrete terms.
2. Identify what would make the work larger, riskier, or more ambiguous.
3. Decide whether the work can proceed directly or must enter plan mode.
4. If plan mode is required, define scope, assumptions, validation strategy,
   and human gate points before implementation starts.
5. Exit planning only when the next execution slice is clear enough to verify.

## Human Gates

- pause if the work still has multiple plausible paths with meaningful
  tradeoffs
- pause if the plan implies protected-branch, production, or cross-repo impact
- pause if validation strategy is not strong enough to justify execution

## Output

- a clear goal
- a decision on whether plan mode is required
- an execution-ready slice when planning completes

## Local Variation Points

- what threshold makes plan mode mandatory
- who approves plan-mode exit for high-risk work
- whether explicit plan artifacts are required in the repo

## Done Criteria

- the goal is concrete
- the execution mode is explicit
- larger or riskier work does not proceed without an adequate plan
