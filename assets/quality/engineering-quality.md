# Engineering Quality Standard

## Purpose

Define the baseline quality bar for AI-assisted software development across
consumer repositories.

## Goal Requirement

Every unit of work must begin with a clear goal.

- No coding should begin without a concrete objective.
- If the objective is large, ambiguous, high-risk, or cross-cutting, the work
  must move through an explicit planning stage before implementation.
- Larger or riskier goals should be treated as plan-mode work by default.

## Modularity and Contracts

- Code should be properly modularized.
- Module boundaries and contracts should be respected.
- Business logic should not be hidden in presentation layers or prompts.
- UI components should be self-contained, independently testable, and designed
  for reuse.
- Avoid one-off components when a reusable pattern is more appropriate.
- Instances of a component should behave the same unless configuration is
  intentionally used to vary them.

## Refactoring Rule

Refactors are allowed when they improve the design of adjacent code, but only
when validation is strong enough to justify the change.

- Refactoring should not be blocked by policy alone.
- Refactoring must not outrun test confidence.
- The stronger the structural change, the stronger the required verification.

## Testing Standard

Work is not ready for approval when linting errors, code smells, broken code, or
failing tests remain.

Expected validation includes:

- targeted unit tests
- integration or system-level verification where behavior crosses boundaries
- build verification
- UI checks where presentation or interaction is involved

Where logic branching is prevalent, vetting automated tests should begin with
mutation testing at the unit test level.

## UI Quality Standard

UI quality is not purely aesthetic, but it is not purely functional either.

Agents should use available resources to determine what "looks good" means for
the repo and problem context, including:

- design systems
- existing product patterns
- spacing and rhythm consistency
- typography hierarchy
- responsive behavior
- visual consistency across reusable components

UI components should be validated independently before being treated as broadly
reusable.

## Human Approval Rule

Human gates should not be conservative by default.

- Ambiguity should be resolved during planning rather than by pausing late.
- Approval should happen after strong validation, not instead of it.
- Approval is for consequential decisions, protected branches, rollouts, and
  unresolved tradeoffs, not for routine uncertainty that should have been
  handled earlier.

## Branch and Push Rule

- Pushes should go to a feature branch by default.
- Pushing to a protected branch requires either a policy exception or explicit
  human approval after all required validation passes.

## Done Rule

Nothing is done until it:

- works
- does not break nearby behavior
- passes the required validation
- is modular and contract-adherent
- is reusable where reuse is the better design choice
