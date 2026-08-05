# New App Intake Outline

## Purpose

Use this outline when AI Native is asked to turn a high-level app idea into an
execution-ready starting plan.

The goal is not to start coding immediately. The goal is to define the minimum
project shape needed to begin safely and effectively.

## First-Step Output

Produce a short project intake package that covers:

- `project-goal.md`
- `v1-scope.md`
- `nfr-profile.md`
- `initial-architecture-decision.md`
- `delivery-plan.md`

These can be individual files later, but this is the minimum planning set to
define first.

## Intake Questions

The first planning pass should answer:

- what problem does the app solve
- who is it for
- what must the first usable version do
- what does not matter yet
- what are the biggest unknowns and risks
- which non-functional requirements matter from day one
- what should the repo and workflow setup look like

## Intake Workflow

1. Restate the goal in concrete terms.
2. Define the user and core problem.
3. Define the smallest useful v1 scope.
4. Identify explicit out-of-scope items.
5. Identify the highest-risk unknowns.
6. Define the initial NFR profile.
7. Propose the initial architecture direction.
8. Decide whether the project should start in its own repo immediately.
9. Define the first execution slice after planning.

## Expected Deliverables

### 1. Project Goal

- one-paragraph product purpose
- primary user
- success definition for the first milestone

### 2. V1 Scope

- core use cases
- must-have features
- out-of-scope features
- assumptions that shape the first build

### 3. NFR Profile

- critical NFRs from day one
- why each matters
- what minimum bar is acceptable
- how each will be validated initially

### 4. Initial Architecture Decision

- likely app shape
- likely frontend/backend/runtime split
- likely data or integration boundaries
- key tradeoffs and open questions

### 5. Delivery Plan

- recommended repo setup
- first backlog slice
- first validation plan
- first human gates

## Repo Model

Default recommendation:

- AI Native defines and guides
- the new app gets its own repo
- product work happens in that repo
- learnings flow back into AI Native

Do not default to building the app directly inside AI Native unless there is a
clear reason.

## Guardrails

- do not let a high-level prompt jump straight into implementation
- do not treat unstated NFRs as unimportant
- do not over-design the system before the first usable scope is clear
- do not expand v1 just because many plausible features exist
- do not confuse repo setup with product planning

## Done Criteria

The intake is ready to hand off to implementation planning when:

- the goal is clear
- v1 scope is explicit
- out-of-scope is explicit
- the initial NFR profile exists
- the initial architecture direction is good enough to evaluate
- the first execution slice is concrete
