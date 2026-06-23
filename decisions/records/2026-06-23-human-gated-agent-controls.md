# Decision Record: Human-Gated Agent Controls

## Metadata

- `decision_id`: DR-2026-06-23-002
- `title`: Treat human gates and bounded autonomy as mandatory shared guidance
- `status`: `approved`
- `decided_on`: `2026-06-23`
- `owner`: `ai-native`
- `linked_concepts`:
  - `control/human-gates`
  - `control/bounded-autonomy`

## Decision

`AI Native` will treat human gates, approval points, and bounded autonomy as
mandatory ingredients of shared assets intended for production repositories.

## Context

As AI capabilities expand, the safest stable pattern is not full autonomy by
default. It is useful automation constrained by explicit approval points,
permissions, and review expectations.

That pattern is becoming common enough that it should shape shared assets from
the beginning rather than being added later.

## Evidence Basis

| Source ID | Signal | Why It Matters |
|---|---|---|
| `openai-codex-docs` | Strong emphasis on approvals, environment controls, and task boundaries | Shows production use depends on bounded execution, not unconstrained autonomy |
| `github-changelog-copilot` | Enterprise-facing controls continue to be a product focus | Indicates governance is a durable requirement, not a temporary concern |
| `dora-research` | AI adoption is increasingly evaluated through delivery outcomes and risk management | Suggests controls should be treated as part of performance, not just compliance |
| `ai-productivity-rct-paper` | Productivity gains are not universal and depend on context | Reinforces the need for human checkpoints before scaling behavior widely |

## Outcome

- What this repo will do:
  require shared assets to define where humans review, approve, or halt work
- What this repo will not do:
  publish default assets that encourage fully automatic production mutations without review
- Human gates required:
  approval before destructive changes, approval before cross-repo rollout, and review before standardization

## Asset Implications

- Asset candidates:
  operating rules, validation checklists, approval guidance, and pilot rollout templates
- Distribution model:
  central source with repo-level enforcement choices
- Consumer repos affected:
  all future production repos, with `Interest Lens` as the first pilot

## Review Trigger

Revisit this decision if evidence shows a safer and more effective pattern for
production adoption than explicit human-gated autonomy.
