# Repo Onboarding Audit Workflow

## Metadata

- `workflow_id`: `dev-repo-onboarding-audit`
- `name`: `Repo Onboarding Audit`
- `category`: `ecosystem-adoption`
- `status`: `active`
- `owner`: `ai-native`
- `tools`: `repo search`, `file read`, `edit`, `tests`, `build`, `browser or simulator if UI exists`
- `human_gates`: `goal confirmation`, `standards adoption decision`, `shared-asset promotion`

## Purpose

Use this workflow when an existing repo is being pulled into the AI Native
ecosystem for the first time.

This is a distinct workflow from normal feature delivery because the goal is to
understand the repo, install shared standards safely, and document the gaps
between current practice and the desired operating model.

## Goal

The onboarding goal must be explicit before work begins.

Examples:

- install the current shared operating standards
- audit the repo against the standards baseline
- identify the first high-value local feedback loops

Because onboarding usually affects process, structure, and future delivery
behavior, it should normally begin in explicit planning mode.

## Trigger

- an existing repo is joining the AI Native ecosystem
- a repo wants the initial standards audit
- a repo needs the first shared asset installation and local adaptation plan

## Inputs

- required:
  target repo, onboarding goal, current branch strategy, available validation
  commands
- optional:
  product context, screenshots, architecture notes, known pain points, release
  constraints

## Default Sequence

1. Confirm the onboarding goal and whether the repo is ready for a planning
   pass first.
2. Inspect the repo structure, current workflows, tests, and UI surfaces if
   present.
3. Install or sync the current shared baseline assets into the repo.
4. Create an initial audit markdown file that records alignment, gaps, and
   immediate recommendations.
5. Generate repo-local feedback markdown for any toil or ambiguity discovered
   during onboarding.
6. Run the strongest practical validation for touched areas, including browser
   or simulator checks for UI repos.
7. Propose the next adoption slice, such as a standards fix, workflow upgrade,
   or UI quality pass.

## Human Gates

- pause if the onboarding goal is unclear or the repo owner has not confirmed
  the level of change allowed
- pause before enforcing standards that would materially change release or
  branch protection behavior
- pause before promoting repo findings into shared cross-repo AI Native assets

## Output

- installed or updated shared assets
- initial onboarding audit markdown
- initial repo-local feedback backlog
- recommended next adoption slice

## Local Variation Points

- where repo-local feedback markdown should live
- whether audits happen on the default branch or a feature branch
- what validation depth is feasible for the repo today

## Done Criteria

- shared baseline assets are present
- the first audit is documented in markdown
- initial feedback capture is set up
- next adoption work is concrete enough to execute
