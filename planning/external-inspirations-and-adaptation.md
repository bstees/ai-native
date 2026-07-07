# External Inspirations And Adaptation

## Purpose

Capture useful ideas from adjacent open-source agentic-development projects and
translate them into AI Native planning directions.

The goal is not to adopt these projects wholesale. The goal is to identify
patterns that are compatible with AI Native's priorities around shared assets,
token efficiency, governed evolution, and human-centered validation.

## Sources Reviewed

- AXI:
  [README](https://raw.githubusercontent.com/kunchenguid/axi/main/README.md),
  [site](https://axi.md/)
- no-mistakes:
  [GitHub repo](https://github.com/kunchenguid/no-mistakes)
- lavish:
  [README](https://raw.githubusercontent.com/kunchenguid/lavish/main/README.md)
- firstmate:
  [README](https://raw.githubusercontent.com/kunchenguid/firstmate/main/README.md)
- treehouse:
  [README](https://raw.githubusercontent.com/kunchenguid/treehouse/main/README.md)
- gnhf:
  [README](https://raw.githubusercontent.com/kunchenguid/gnhf/main/README.md)

## Evaluation Lens

Projects were evaluated for value to AI Native in these areas:

- token efficiency
- agent ergonomics
- human feedback loops
- UI validation and review
- governed delivery automation
- multi-agent scaling
- fit with AI Native's standards-and-assets model

## High-Value Inspirations

### 1. AXI

Why it matters:

- treats token budget as a first-class engineering constraint
- favors minimal default surfaces and contextual disclosure
- centers agent ergonomics rather than just tool availability
- reinforces the idea that MCP versus CLI should remain an evolving decision,
  not a permanent ideology

What AI Native should borrow:

- token-efficient outputs as a design requirement
- minimal always-on instruction surfaces
- progressive disclosure for detailed guidance
- explicit reevaluation of tool paths as offerings change

What AI Native should not copy blindly:

- benchmark claims as a universal truth outside the contexts they were tested in
- any assumption that one tool shape stays best over time

Best translation into this repo:

- strengthen `token-efficiency`
- strengthen future `mcp-cli-audit`
- keep `agents.md` small and reference-based

### 2. lavish

Why it matters:

- improves the human-agent loop for UI and artifact review
- uses local browser review and structured annotations
- surfaces layout issues like overflow, overlap, and clipping
- turns visual feedback into a more usable machine-readable form

What AI Native should borrow:

- interactive HTML review artifacts
- local-first browser review
- structured feedback capture tied to visible elements
- layout warnings as first-class validation signals

What AI Native should not copy blindly:

- a dependency-first approach before proving our own workflow fit
- a UI feedback system that becomes heavier than the value it returns

Best translation into this repo:

- a future `lavish-like` review artifact workflow
- stronger browser-based UI feedback loops
- structured human annotations feeding `ui-validation-retro`

### 3. no-mistakes

Why it matters:

- frames safe delivery as a governed push problem
- validates changes in disposable worktrees before forwarding to the real
  remote
- separates safe automation from decisions that still need a human

What AI Native should borrow:

- "gate before real push" as an explicit delivery pattern
- disposable-worktree validation
- clear evidence trails for blocked pushes
- safe-auto-fix versus human-judgment boundaries

What AI Native should not copy blindly:

- a full productized push harness before our own governance model is mature
- any automation path that obscures why a change was blocked or altered

Best translation into this repo:

- a future governed-push workflow
- a delivery automation standard with explicit human gates
- a possible future AI Native implementation inspired by this pattern

## Strong Secondary Inspirations

### firstmate

Why it matters:

- reinforces a one-captain, many-specialists model
- uses parallel isolated worktrees and event-driven supervision
- supports the idea of one primary repo agent delegating to tightly scoped
  helpers

Best translation into this repo:

- validates the current primary-agent-plus-skills direction
- informs future multi-agent orchestration if AI Native scales into that space

### treehouse

Why it matters:

- makes reusable worktree pools practical for parallel agent work
- preserves dependencies and build caches while keeping isolation

Best translation into this repo:

- a future operational pattern for parallel repo work
- possible foundation for governed push, multi-agent review, or overnight tasks

### gnhf

Why it matters:

- models bounded long-running improvement loops with commit/rollback discipline
- shows a path for unattended or semi-attended iterative improvement

Best translation into this repo:

- future continuous-improvement or overnight scout mode
- likely downstream of better governance, observability, and validation assets

## Proposed AI Native Adaptations

### A. Lavish-Like UI Feedback Direction

Goal:

- reduce the number of human turns required for UI review and polish

Proposed shape:

- generate HTML or similarly inspectable local review artifacts for UI changes
- validate them in a real local browser
- allow structured human annotations tied to elements or visible regions
- surface layout warnings as machine-readable findings
- feed findings into repo-local feedback markdown and UI retro skills

Likely future assets:

- `assets/workflows/ui-review-artifact-workflow.md`
- `assets/quality/layout-warning-guidance.md`

Likely future skills:

- `ui-review-artifact`
- `layout-warning-audit`
- `annotation-ingestion`

### B. No-Mistakes-Like Governed Push Direction

Goal:

- reduce unsafe pushes and unclear approval paths without slowing delivery with
  unnecessary ceremony

Proposed shape:

- validate pushes in disposable worktrees or equivalent isolated execution
  contexts
- separate mechanical remediation from judgment-heavy decisions
- emit evidence when a push is blocked or rewritten
- make PR creation and follow-up status part of the same governed flow when
  appropriate

Likely future assets:

- `assets/workflows/governed-push.md`
- `assets/workflows/delivery-automation-standard.md`

Likely future skills:

- `push-readiness-audit`
- `autofix-boundary-audit`

## Priority Ranking For AI Native

1. AXI
2. lavish
3. no-mistakes
4. firstmate
5. treehouse
6. gnhf

This order is based on near-term leverage for AI Native, not on the overall
quality of those projects.

## Recommended Next Moves

1. Create the shared NFR framework and observability standard.
2. Define a tool-selection framework that can judge MCP versus CLI with explicit
   criteria.
3. Plan a `lavish-like` UI review artifact workflow for consumer repos.
4. Plan a `no-mistakes-like` governed-push workflow after the delivery
   automation standard is clearer.

## Guardrail

AI Native should borrow patterns, not identities.

If an external project offers a strong idea, adapt it into AI Native's
governance, skills, standards, and feedback loops rather than forcing the repo
to imitate the original tool's entire shape.
