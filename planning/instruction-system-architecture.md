# Instruction System Architecture

## Purpose

Define how this repository should structure always-on instructions, workflows,
and repo-local skills so agents can work with the narrowest useful scope and
the lowest practical token cost.

## Why This Matters

The repo is moving toward shared native-AI assets that will serve multiple
consumer repositories. If the instruction system itself is repetitive,
over-scoped, or vendor-fragmented, it will create the same problems we are
trying to remove from downstream repos.

This plan treats context budget as an engineering constraint.

It also treats evolution as a first-class system behavior: agents should learn
from friction, inefficiency, and repeated correction rather than ending each
task as if the system around the work is already optimal.

## Core Principle

Canonical guidance should exist once.

Everything else should do one of four things:

- point to the canonical guidance
- scope the guidance to a specific workflow
- apply the guidance to a specific task
- capture feedback when the guidance was insufficient

## Evolution Loop

Meaningful work sessions should have a lightweight retrospective path.

Default loop:

1. complete the work
2. check for avoidable friction, ambiguity, repetition, or validation pain
3. capture structured feedback in repo-local markdown when improvement
   opportunity exists
4. triage whether the issue is local or shared
5. decide whether to adjust topology, create a skill, improve a skill, update a
   workflow, or update a standard

The key rule is:

- agents may capture and propose evolution automatically
- shared-system mutation should remain human-gated

## Target Hierarchy

### Layer 1: `agents.md`

`agents.md` should be the smallest always-on contract in the repo.

It should answer only the questions every agent needs on every run:

- what this repo is for
- what quality bar is non-negotiable
- when explicit planning is required
- where workflows live
- where quality standards live
- where repo-local skills live
- how to escalate ambiguity and high-risk change
- the rule that canonical guidance should be referenced, not restated

`agents.md` should not contain:

- long workflow procedures
- repeated quality checklists
- vendor-specific wording
- stack-specific implementation details
- duplicated guidance already maintained elsewhere

### Layer 2: Vendor Adapters

Vendor-specific instruction files should be symlinks to `agents.md` whenever the
tool supports it.

Planned pattern:

- `CLAUDE.md -> agents.md`
- vendor-specific Copilot instruction file -> `agents.md`
- optional compatibility symlink `AGENTS.md -> agents.md` if ecosystem support
  proves useful

The rule is that vendor files should adapt to the source of truth, not become
parallel sources of truth.

### Layer 3: Shared Standards

Detailed standards should stay in canonical files under `assets/`.

Current canonical anchors:

- repo behavior:
  [`../assets/repo-rules/ai-native-core-operating-rules.md`](../assets/repo-rules/ai-native-core-operating-rules.md)
- plan mode:
  [`../assets/workflows/goal-and-plan-mode.md`](../assets/workflows/goal-and-plan-mode.md)
- engineering quality:
  [`../assets/quality/engineering-quality.md`](../assets/quality/engineering-quality.md)
- feedback ingestion:
  [`../assets/feedback/feedback-ingestion-standard.md`](../assets/feedback/feedback-ingestion-standard.md)
- governance and NFR planning:
  [`./governance-layers-and-nfr-framework.md`](./governance-layers-and-nfr-framework.md)

### Layer 4: Workflows

Workflows should define sequence, gates, and outputs for recurring task types.

Workflows should:

- reference standards instead of copying them
- add only the task-specific sequence and decisions
- stay focused on one recurring job shape

Examples already present:

- feature delivery
- bug fix
- code review
- usability validation
- repo onboarding audit

### Layer 5: Repo-Local Skills

Repo-local skills should live close to the repo and version with it.

Planned location:

- `.agents/skills/<skill-name>/SKILL.md`

Skills should be narrow techniques, not broad repo handbooks.

Skills should:

- inspect for one class of problem
- use the smallest required context surface
- point back to canonical standards when needed
- leave findings or outputs that another agent can use

### Layer 6: Evolution Feedback

Feedback is how the instruction system gets better instead of merely getting
larger.

Evolution inputs should include:

- toil captured during delivery
- review findings
- validation pain
- repeated human correction
- markdown written by developers outside formal workflows

This layer should feed:

- local workflow refinement
- skill creation proposals
- skill improvement proposals
- instruction-topology cleanup
- shared asset promotion after human review

## Agent Model

Start with the smallest useful set of agents.

### Primary Repo Agent

Owns orchestration.

Responsibilities:

- interpret the request
- choose whether plan mode is required
- select the right workflow
- decide when a sub-agent or skill is needed
- integrate outputs into one final result

### Delivery Agent

Owns implementation after scope is clear.

Responsibilities:

- make the requested change
- keep implementation modular and contract-adherent
- run required verification
- report residual risk

### Review Agent

Owns finding risk, duplication, quality gaps, and instruction drift.

Responsibilities:

- review code and docs for regressions or smells
- identify duplication and over-scoping
- verify that standards are being referenced instead of repeated
- propose consolidation targets
- capture evolution opportunities when the system made good work harder than it
  needed to be

## Skill Model

Skills should be reusable methods that multiple agents can invoke.

### First Skill: `dry-context`

Purpose:

- find duplicated code
- find duplicated markdown guidance
- find repeated workflow prose
- find places where a reference should replace repeated instruction

Expected outputs:

- duplication findings
- canonicalization recommendations
- suggested extraction or consolidation points

Success criteria:

- reduces repeated content without losing necessary guidance
- preserves readability and local usability
- prefers references over paraphrased repetition

### Second Skill: `token-efficiency`

Purpose:

- reduce context footprint while preserving behavior and quality

Expected behaviors:

- identify over-scoped instruction files
- flag detail that belongs in workflows or standards instead of `agents.md`
- recommend narrower inputs for sub-agents
- use `dry-context` findings when duplication is part of the token problem

Success criteria:

- smaller always-on context
- narrower sub-agent scope
- no important loss of quality or safety guidance

### Third Skill: `session-retro`

Purpose:

- learn from difficulty at the end of meaningful work sessions

Expected behaviors:

- capture avoidable friction, ambiguity, repetition, and validation pain
- distinguish between one-off difficulty and repeatable system weakness
- emit structured markdown feedback when guidance should improve

Success criteria:

- meaningful toil becomes durable input instead of disappearing
- repeated pain points become visible for future consolidation
- feedback stays concise enough to review on a cadence

### Fourth Skill: `instruction-topology`

Purpose:

- decide where guidance belongs

Expected behaviors:

- separate universal rules from workflow-specific guidance
- separate shared standards from repo-local feedback
- prevent new markdown from becoming an accidental duplicate standard

### Fifth Skill: `scope-guard`

Purpose:

- keep sub-agents tightly scoped

Expected behaviors:

- check whether a task can be solved from a smaller context slice
- recommend a narrower brief when an agent has been given too much surface area
- flag when a broad request should stay with the primary repo agent instead

### UI/UX Skill Cluster

UI and UX work deserve a specialized skill area because the quality bar is high,
the work is more subjective, and the cost of reaching a polished result is
usually higher than with purely functional code changes.

This cluster should help agents reduce the number of trial-and-error turns while
still validating the real experience.

#### `ui-flow-audit`

Purpose:

- generate and maintain critical user flows for UI surfaces

Expected behaviors:

- identify the smallest set of flows that represent minimum usability
- define visible success and failure conditions
- keep flow definitions narrow enough for direct validation

#### `ui-polish-audit`

Purpose:

- inspect spacing, hierarchy, alignment, state clarity, and consistency against
  the shared UI quality standard

Expected behaviors:

- look for inconsistent rhythm, hard-to-reach controls, weak hierarchy, and
  one-off component behavior
- prefer reusable component improvements over ad hoc fixes
- capture recurring aesthetic corrections as candidate standards or checklist
  upgrades

#### `ui-validation-retro`

Purpose:

- learn from high-turn UI tasks

Expected behaviors:

- capture where UI iteration required too many human turns
- identify whether the cause was missing flows, weak component contracts, thin
  visual standards, or insufficient browser/simulator validation
- recommend stronger skills, better topology, or improved checklists

#### `ui-pattern-extraction`

Purpose:

- reduce one-off interface work by extracting reusable component or layout
  patterns when repetition is emerging

Expected behaviors:

- identify when repeated UI fixes should become reusable patterns
- distinguish between reusable pattern opportunity and one-off local styling
- keep extracted patterns contract-adherent and independently testable

#### `component-boundary-audit`

Purpose:

- verify that UI decomposition honors single responsibility and sensible reuse
  boundaries

Expected behaviors:

- inspect whether components own one coherent job
- check whether existing components should have been reused before new ones
  were introduced
- distinguish between justified one-off components and accidental duplication
- recommend clearer contracts for styling, copy/resources, tests, and visual
  review artifacts

## Proposed File Layout

```text
agents.md
AGENTS.md -> agents.md                  # optional compatibility symlink
CLAUDE.md -> agents.md
.github/... -> agents.md               # where supported by vendor format
.agents/
  skills/
    dry-context/
      SKILL.md
    token-efficiency/
      SKILL.md
    session-retro/
      SKILL.md
    instruction-topology/
      SKILL.md
    scope-guard/
      SKILL.md
    ui-flow-audit/
      SKILL.md
    ui-polish-audit/
      SKILL.md
    ui-validation-retro/
      SKILL.md
    ui-pattern-extraction/
      SKILL.md
    component-boundary-audit/
      SKILL.md
```

## Draft `agents.md` Shape

The initial `agents.md` should likely stay under one screen when possible.

Suggested outline:

1. Repo purpose
2. Always-on rules
3. Plan mode trigger
4. Canonical document map
5. Sub-agent and skill usage rule
6. DRY rule for code and markdown
7. Evolution rule for capturing avoidable friction

## Migration Plan

### Phase 1: Planning

- approve this architecture
- choose exact vendor adapter targets
- confirm whether uppercase compatibility symlink is needed

### Phase 2: Root Instruction Setup

- create `agents.md`
- add vendor symlinks
- keep `agents.md` intentionally minimal

### Phase 3: First Repo-Local Skills

- create `.agents/skills/dry-context/SKILL.md`
- create `.agents/skills/token-efficiency/SKILL.md`
- create `.agents/skills/session-retro/SKILL.md`
- keep all three skills narrow and reference-based

### Phase 4: Evolution and UI Skill Seed

- define the first UI/UX skill cluster
- connect those skills back to the existing UI quality and usability standards
- require retro capture when UI work needed repeated human correction

### Phase 5: Audit Loop

- run a first instruction-topology audit on this repo
- identify repeated guidance across `assets/`, `planning/`, and future root
  instruction files
- convert findings into feedback markdown or direct consolidations
- review evolution feedback for candidates to become new skills or stronger
  workflows

## Guardrails

- do not create multiple instruction files with overlapping authority
- do not restate quality standards in `agents.md`
- do not create many top-level agents before their boundaries are proven
- do not let skills become mini-handbooks
- do not optimize token count by removing necessary safety or quality guidance
- do not let UI iteration pain disappear without checking whether better skills
  or patterns could reduce future turns

## Done Criteria

This plan is ready to execute when:

- `agents.md` has a clearly limited role
- vendor files are treated as adapters, not separate documents
- the first skills are defined as narrow methods
- evolution is explicitly captured instead of left to memory
- UI/UX has a specialized path for validation and improvement
- the repo has an explicit path for reducing duplication in both code and
  markdown
- future instruction growth has a defined place to go
