# Decision Record: Vendor-Neutral Agent Orchestration

## Metadata

- `decision_id`: DR-2026-07-16-001
- `title`: Separate workload profiles from provider and model selection
- `status`: `approved`
- `review_status`: `approved`
- `decided_on`: `2026-07-16`
- `owner`: `ai-native`
- `approved_by`: repository owner
- `approved_on`: `2026-07-16`
- `linked_concepts`:
  - `agents/capability-routing`
  - `agents/context-efficiency`
  - `agents/provider-portability`

## Decision

Shared workflows and skills will select vendor-neutral agent profiles. Provider
adapters and organization-controlled model aliases will translate those
profiles into current execution settings.

## Context

Sub-agent tasks have different capability and context needs. Pinning model names
inside skills couples durable workflows to a fast-changing vendor landscape,
while inheriting broad parent context increases cost and context pollution.

## Evidence Basis

| Source ID | Signal | Why It Matters |
|---|---|---|
| `codex-subagents` | Custom agents can vary model, reasoning, permissions, and context inheritance | Confirms that execution profiles can be separated from workflows |
| `cross-provider-agent-tools` | Providers expose different combinations of native controls | Requires explicit adapter capability reporting rather than assumed parity |
| `repo-instruction-architecture` | Canonical guidance should exist once and use the narrowest useful scope | Favors one shared contract with small provider translations |

## Outcome

- What this repo will do: publish profiles, routing policy, adapter contracts,
  and context-packet rules as a shared asset
- What this repo will not do: embed concrete model names in skills or claim
  unsupported controls are portable
- Human gates required: approve new shared profiles, routing-policy changes,
  and provider adapters before cross-repo rollout

## Asset Implications

- Asset candidates: `assets/agent-orchestration/`
- Distribution model: managed shared asset with repo-local model registry and
  provider-specific launch integration
- Consumer repos affected: opt-in initially; eligible for broader rollout after
  provider-adapter pilots

## Review Trigger

Revisit when major agent clients converge on a portable capability-negotiation
standard or when profile routing produces repeated quality or cost failures.
