# Decision Record: Local Consumer Overlay

## Metadata

- `decision_id`: `DR-2026-07-17-001`
- `title`: Treat synchronized AI Native assets as one ignored local overlay
- `status`: `approved`
- `decided_on`: `2026-07-17`
- `owner`: `ai-native`
- `linked_concepts`:
  - `distribution/local-overlay`
  - `control/instruction-ownership`
  - `feedback/intentional-export`

## Decision

Consumer repositories will ignore the entire `.ai-native/` directory with one
`.gitignore` rule. Synchronized assets, state, configuration, feedback, and
audits are local runtime inputs rather than selectively tracked content.

Instruction integration has two supported paths:

- replace custom instruction entry points with an AI Native-managed `AGENTS.md`
  and supported symlinks while preserving prior files as unique `*-old.md`
  files
- keep the existing `AGENTS.md`, add one managed AI Native reference line, and
  preserve custom tool-specific instructions

Feedback will move upstream only through a separate, intentional export flow.

## Context

The prior model generated a long selective `.gitignore` block so synchronized
standards stayed local while feedback, audits, and consumer configuration could
be committed. That mixed ownership made installation noisy, created avoidable
ignore complexity, and increased the chance of conflicts across consumer repos.

## Migration

The next sync:

- collapses the legacy managed ignore block to `.ai-native/`
- detects `.ai-native` files already tracked by Git
- requires confirmation before removing those paths from the index while
  preserving the local files
- migrates old appended instruction blocks to the keep/reference path
- retains old managed instruction entry points in the replace/link path
- removes the obsolete managed/forked consumer distinction

Previously tracked assets require a one-time staged deletion in each seeded
consumer repository.

## Human Gates

- choose replace/link or keep/reference when custom instruction files exist
- confirm removal of legacy `.ai-native` paths from the Git index
- review and intentionally export consumer feedback before it enters AI Native

## Review Trigger

Revisit if local-only installation prevents necessary team coordination, if
feedback export produces material collision or data-handling risk, or if a
package-based distribution model makes copied local assets unnecessary.
