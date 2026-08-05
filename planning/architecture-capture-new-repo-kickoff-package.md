# Architecture Capture New Repo Kickoff Package

This package defines the minimum useful setup for the dedicated app repo that should follow the planning work in AI Native.

It is intentionally small. The goal is to start the product in the right repo with the right constraints, not to pre-build a full engineering handbook.

Related planning artifacts:

- [architecture-capture-app-intake.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-app-intake.md:1)
- [architecture-capture-processing-research-plan.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-research-plan.md:1)
- [architecture-capture-processing-decision-memo.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-decision-memo.md:1)

## Repo Goal

Create a dedicated product repo for an iOS-first architecture-capture app that scans interior spaces on iPhone 17 Pro-class devices, excludes furniture from the delivered model, and exports room-envelope-first 3D files usable in SketchUp and Blender.

The first implementation milestone in the new repo is not full product delivery. It is the feasibility slice that proves the v1 capture, cleanup, calibration, and export path is viable.

## Why A Separate Repo

- the app has its own runtime, dependencies, device test matrix, and delivery pipeline
- mobile, processing, and export concerns should not live inside the AI Native governance repo
- product-specific iteration will be faster and cleaner in an app repo with repo-local instructions
- AI Native should remain the source of standards, workflows, and shared planning patterns

## Recommended Repo Identity

Working repo purpose:

- iOS-first spatial capture product
- architecture/interior-design workflow focus
- feasibility-first delivery sequence

Suggested temporary repo naming shape:

- `architecture-capture-app`
- or a product codename if branding work is expected soon

## Minimum Day-One Repo Contents

The repo should start with:

- `agents.md`
- `README.md`
- `planning/`
- `.ai-native/`
- app source directory for the iOS client
- backend or services directory only if the feasibility slice actually needs one

Do not seed speculative modules, monorepo tooling, or infra folders before the feasibility slice justifies them.

## What `agents.md` Should Do

The new repo should use a small always-on contract that:

- states the product goal
- points to repo-local planning artifacts
- references AI Native canonical standards instead of copying them
- requires plan mode for hardware-heavy, cross-boundary, or architecture-changing work
- makes the feasibility slice and its validation gates explicit

The new repo should not paste large chunks of AI Native guidance into `agents.md`.

## What To Pull From AI Native

Reference these assets from the new repo:

- core operating rules
- goal and plan-mode workflow
- engineering quality standard
- feedback ingestion standard

Use AI Native as the canonical source. The new repo should add only product-local constraints such as:

- supported iPhone baseline
- target import tools
- capture-specific validation expectations
- privacy/data-handling expectations for room scans

## Required Repo-Local Planning Files

Create these in the new repo before coding expands:

- `planning/project-goal.md`
- `planning/v1-scope.md`
- `planning/nfr-profile.md`
- `planning/initial-architecture-decision.md`
- `planning/processing-feasibility-plan.md`

Seed them from the existing AI Native planning artifacts rather than rewriting from scratch.

## Recommended Initial Repo Structure

Use the smallest structure that keeps boundaries clear:

```text
/
  agents.md
  README.md
  planning/
  .ai-native/
    feedback/
  app/
  docs/
```

Notes:

- `app/` is the default home for the iOS client
- `docs/` can hold capture examples, import-validation notes, and architecture diagrams if needed
- do not add `services/` until hybrid processing is confirmed by feasibility work

## First Repo-Local Deliverable

The first meaningful deliverable in the new repo should be a feasibility-slice brief that includes:

- supported devices: iPhone 17 Pro / Pro Max and newer validated Pro-class devices
- target outputs: `GLB`, `USDZ`, `OBJ`
- hard import targets: SketchUp and Blender
- soft early validation target: Shapr3D
- output promise: room envelope first, furniture excluded
- accuracy promise: minimum design-grade with optional user-confirmed calibration
- processing baseline: provisional hybrid, pending spike validation

## First Backlog In The New Repo

The initial backlog should remain planning-and-spike oriented:

- set up repo-local instructions and planning docs
- define the sample room set and measurement rubric
- define the import-validation rubric for SketchUp and Blender
- define the capture-coaching rules for corners, openings, and occlusion handling
- define the calibration interaction
- decide whether the first spike can stay entirely local to the iOS app or needs a placeholder service boundary

Do not start broader product features such as accounts, collaboration, or marketplace flows.

## Human Gates Before Coding Expands

- confirm the repo exists and AI Native remains reference-only
- confirm the feasibility slice is the first milestone, not a production MVP
- confirm the provisional processing baseline remains hybrid unless spike evidence overrides it
- confirm privacy expectations for captured room data before any remote-processing path is introduced

## Exit Condition For This Kickoff Package

This package has done its job when:

- the dedicated app repo is created
- the repo has a minimal `agents.md` and planning directory
- the feasibility slice is the first explicit milestone
- canonical standards remain referenced from AI Native
- implementation planning can continue in the new repo without reopening basic repo-model questions
