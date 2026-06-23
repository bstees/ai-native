# Decision Record: Centrally Maintained Repo Rules

## Metadata

- `decision_id`: DR-2026-06-23-001
- `title`: Publish shared repo operating rules as a centrally maintained asset
- `status`: `approved`
- `decided_on`: `2026-06-23`
- `owner`: `ai-native`
- `linked_concepts`:
  - `context/shared-repo-rules`
  - `control/human-gated-agent-operations`

## Decision

`AI Native` will publish a centrally maintained repo rules asset that consumer
repositories can adopt with minimal local editing.

The first version will focus on stable operating expectations for agentic
software development rather than tool-specific implementation detail.

## Context

Across current coding-agent ecosystems, teams are converging on a need for
shared instructions that keep AI work aligned with repo conventions, testing
expectations, and safety boundaries.

The pattern appears broad enough to support a reusable asset, but still needs
human-gated rollout in real consumer repos.

## Evidence Basis

| Source ID | Signal | Why It Matters |
|---|---|---|
| `openai-codex-docs` | Emphasis on project instructions, approvals, tools, and best-practice setup | Indicates shared operating guidance is becoming a first-class part of agentic development |
| `anthropic-claude-code-overview` | Strong focus on workflow setup and reusable context for coding agents | Reinforces that consistent agent behavior depends on maintained repo context |
| `github-changelog-copilot` | Ongoing product change around agent workflows and enterprise controls | Suggests consumer repos benefit from stable local guidance despite vendor churn |

## Outcome

- What this repo will do:
  publish and maintain a shared repo rules asset for consumer repos
- What this repo will not do:
  assume that one vendor-specific file format is the universal distribution path
- Human gates required:
  asset publication, consumer-repo adoption, and any repo-specific tightening of permissions

## Asset Implications

- Asset candidates:
  core repo rules, adaptation guidance, and tool-specific wrappers over time
- Distribution model:
  central source with light consumer adaptation
- Consumer repos affected:
  `Interest Lens` first, then other production repos

## Review Trigger

Revisit this decision if consumer repos consistently need heavy rewrites or if
tool ecosystems converge on a clearly better distribution model.
