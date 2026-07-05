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
- Design should favor SOLID principles across code styles, not only classical
  object-oriented code.
- Single Responsibility:
  modules, components, and helpers should each have one coherent reason to
  change.
- Open/Closed:
  prefer extension through composition, configuration, or new modules over
  brittle edits that force repeated changes to stable code.
- Liskov Substitution:
  variants and replacements should honor the expectations established by the
  original contract.
- Interface Segregation:
  prefer focused APIs over broad interfaces that force consumers to depend on
  unused behavior.
- Dependency Inversion:
  depend on stable contracts and seams rather than tightly coupling logic to
  volatile implementation details.
- Business logic should not be hidden in presentation layers or prompts.
- UI components should be self-contained, independently testable, and designed
  for reuse.
- Even one-off UI should be decomposed into tightly self-contained components
  with clear boundaries for style, copy/resources, tests, and visual review
  artifacts where appropriate.
- Avoid one-off components when a reusable pattern is more appropriate.
- Instances of a component should behave the same unless configuration is
  intentionally used to vary them.
- Existing components should be reused before new ones are introduced unless a
  coherent boundary analysis shows that a new component is justified.

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

Use [`ui-quality-standard.md`](./ui-quality-standard.md) as the core shared UI
bar and [`ui-review-checklist.md`](./ui-review-checklist.md) as the default
review pass before approval.

Use [`usability-validation-standard.md`](./usability-validation-standard.md) to
require direct browser or simulator verification of critical user flows.

Component-first UI thinking should also shape upstream design work whenever
possible:

- mockups should be decomposed into components rather than treated as flat
  screens
- design reuse should align with likely implementation reuse
- UX and engineering should converge on component boundaries early when the UI
  is substantial

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
