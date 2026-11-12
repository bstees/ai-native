# Weekly Digest Findings Backlog

This record consolidates the practical findings from the 13 historically dated weekly AI engineering digests published from 2026-08-14 through 2026-11-06. The machine-readable source of truth for digest, finding, primary/secondary backlog, implementation, verification, and publication links is [`planning/weekly-digest-delivery-manifest.json`](../planning/weekly-digest-delivery-manifest.json).

Baseline review was performed against AI Native commit `140e3ff2706ef5a9873d8bf3e4eb716ee86c8ae9`. Existing assets are noted as foundations, not as digest finding implementations. At baseline there were no digest-linked evidence records, concept records, backlog-item instances, implementation records, or verification runs. An item must not move to `implemented` until the manifest names the implementation paths and commit and records passing verification evidence.

All items use branch `codex/weekly-digest-findings`. `issueUrl` and `pullRequestUrl` remain `null`; no issue or pull request has been invented. Backlog `findingIds` in the manifest include both primary and secondary mappings. The lists below show the primary findings that establish each item's core scope.

## AF-001: Workflow Contracts and Human-Judgment Gates

- Status: `in_progress`
- Primary findings: `F-2026-08-14-01`, `F-2026-08-14-03`, `F-2026-08-28-01`, `F-2026-09-04-02`, `F-2026-09-11-01`, `F-2026-09-11-05`, `F-2026-09-25-03`, `F-2026-10-02-03`, `F-2026-11-06-02`
- Baseline: goal/plan workflow, authority tiers, human gates, governance policy, and agent-profile contracts already exist.
- Verified branch slice: `IMP-AF001-TASK-CONTRACT` adds a machine-readable task contract, full-boundary approval fingerprint, consequential-action gate checks, validator, and negative regression tests.
- Remaining gap: the slice is not yet packaged for consumer repositories, and requirements refinement does not yet have its own artifact or end-to-end runtime enforcement.
- Done when: a versioned task contract records goal, included/excluded scope, constraints, assumptions, stable acceptance IDs, required evidence, authority level, and human gates; approved criteria can change only through a new revision; invalid or consequential contracts fail deterministic validation.

## AF-002: Independent Verification and Acceptance Boundaries

- Status: `in_progress`
- Primary findings: `F-2026-08-14-04`, `F-2026-08-21-04`, `F-2026-08-28-02`, `F-2026-08-28-04`, `F-2026-10-02-02`, `F-2026-10-09-02`, `F-2026-10-09-03`, `F-2026-10-16-02`, `F-2026-10-16-05`, `F-2026-10-23-03`, `F-2026-10-23-04`, `F-2026-10-30-01`, `F-2026-10-30-03`, `F-2026-11-06-04`
- Baseline: engineering-quality and code-review workflows, a read-only fresh-context reviewer profile, and instruction-evaluation cases exist. Concurrent `write-unit-tests` work is uncommitted and is not evidence that this epic is implemented.
- Verified branch slice: `IMP-AF002-EVIDENCE-BUNDLE` adds a canonical evidence bundle that loads and validates the approved contract, requires exact criterion coverage, binds uncommitted changes by content fingerprint (or a durable commit), and rejects self-review or unresolved blockers.
- Remaining gap: reviewer execution and consumer packaging remain separate work; the active unit-test stream has not been merged or claimed by this branch.
- Done when: a validated evidence bundle links the approved contract revision, changed paths/commit, exact command outcomes, acceptance evidence, independent reviewer identity, findings, unresolved risks, and disposition; self-review cannot satisfy independence and unresolved blockers prevent a verified result.

## AF-003: Skills and Harness Quality

- Status: `in_progress_external`
- Primary findings: `F-2026-08-28-03`, `F-2026-09-04-03`, `F-2026-09-25-01`, `F-2026-10-16-01`, `F-2026-10-16-04`, `F-2026-11-06-01`
- Baseline: an instruction-evaluation framework, cases, pilot runs, schemas, comparison tooling, repository-local skills, and an agent-contract validator exist. The concurrent `write-unit-tests` skill and synchronization wiring are dirty and must be handed off before related changes continue.
- Gap: important skills lack a common execution contract and representative held-out behavioral regression coverage; there is no code-review skill in this repository.
- Done when: each important skill declares prerequisites, permitted actions, evidence, recovery, and completion; deterministic scenarios cover permissions, tool use, state, error recovery, and approvals; representative and held-out cases detect regressions without relying on the executor's self-report.

## AF-004: Agent Trajectory Observability

- Status: `in_progress_external`
- Primary findings: `F-2026-08-21-02`, `F-2026-08-21-03`, `F-2026-10-09-05`
- Baseline: token-usage data, server support, dashboard UI, and a hybrid-team dashboard plan exist. Structured telemetry-lake and API work is active and unmerged elsewhere.
- Gap: no committed lifecycle event model covering inputs, assumptions, actions, evidence, decisions, failures, interventions, and outcomes; retention and redaction controls are absent.
- Done when: structured, queryable trajectory events preserve provenance across lifecycle phases; sensitive content is minimized or redacted; retention is explicit; tests prove schema integrity and safe failure behavior after the active telemetry work lands.

## AF-005: Engineering Knowledge and Retrieval

- Status: `in_progress`
- Primary findings: `F-2026-08-14-05`, `F-2026-09-11-02`, `F-2026-09-18-03`, `F-2026-09-25-04`, `F-2026-10-09-04`, `F-2026-10-23-02`, `F-2026-10-30-02`, `F-2026-11-06-03`
- Baseline: a deterministic repository-surface index, content fingerprint, staleness refresh, and `dry-context` skill exist.
- Verified branch slice: `IMP-AF005-PROVENANCE` adds Git revision, dirty-state, and exact dirty-snapshot fingerprints to the deterministic index, plus the schema-validated digest/finding/backlog/implementation ledger.
- Remaining gap: dependency relationships, incident/decision retrieval, and intent-based routing across deterministic and semantic sources are not implemented.
- Done when: retrieved knowledge carries source, repository revision, dirty/fresh state, date, and dependencies; deterministic code navigation and dependency context are preferred for code questions; broader history and semantic retrieval are routed by intent; tests prevent absolute paths, remotes, secrets, or source bodies from leaking.

## AF-006: Failure Learning and Guardrail Promotion

- Status: `in_progress`
- Primary findings: `F-2026-08-14-02`, `F-2026-09-11-03`, `F-2026-09-18-01`, `F-2026-09-25-02`
- Baseline: feedback ingestion, session retrospectives, validation-gap automation, and human-correction metrics exist.
- Verified branch slice: `IMP-AF006-FAILURE-PROMOTION` adds a bounded failure taxonomy and a validated failure-to-remediation-to-regression-to-promotion record. Promotion requires recurrence, generalizability, passing regression evidence, and human approval.
- Remaining gap: aggregate effectiveness reporting and consumer packaging are not implemented.
- Done when: reproducible failures are classified with a bounded taxonomy and linked to remediation type, owner, regression case, evaluation result, promotion decision, and outcome; promoted guardrails require passing regression evidence and approval; records retain evidence links without storing raw sensitive conversations.

## AF-007: Agent Security and Governance

- Status: `planned`
- Primary findings: `F-2026-09-11-04`, `F-2026-09-18-02`, `F-2026-10-09-01`, `F-2026-11-06-05`
- Baseline: governance, risk, incident, and adoption artifacts; least-privilege authority levels; governance-aware profiles/adapters; and fail-closed resolver tests form a substantial foundation.
- Gap: no skill/MCP supply-chain inventory, version and pin policy, license/provenance record, or deterministic repository-policy compliance suite.
- Done when: skills, MCP servers, tools, permissions, versions, licenses, and provenance are inventoried and reviewable; high-risk changes fail closed; critical repository policies execute as deterministic checks; product-verification and agent-verification evidence remain distinct.

## AF-008: Long-Running Execution and Working State

- Status: `deferred_dependency`
- Primary findings: `F-2026-09-04-04`, `F-2026-10-02-04`, `F-2026-10-16-03`, `F-2026-10-23-01`
- Baseline: planning, bounded-investigation budgets and stop conditions, context-minimizing profiles, and model selection exist.
- Gap: no durable checkpoint, resumable working-state contract, provenance-aware recovery path, or realistic multi-hour regression scenario.
- Dependency: begin after AF-001 task contracts and AF-004 trajectory events are stable.
- Done when: inspectable, versioned checkpoints preserve plans, decisions, assumptions, evidence, open questions, and recovery state; interruption/resume and stale-context tests prove constraint-safe recovery; a multi-hour representative task measures redirections, discarded work, and evidence-backed completion.

## AF-009: Multi-Agent and Multi-Model Orchestration

- Status: `deferred_dependency`
- Primary findings: `F-2026-08-21-01`, `F-2026-09-04-01`, `F-2026-10-30-04`
- Baseline: vendor-neutral profiles, provider adapters, routing policy, escalation, model selection, a read-only reviewer, and resolver/schema/routing tests form a substantial foundation.
- Gap: no actual multi-step workflow runner, parallel execution model, independently verifiable phase handoff, or comparative orchestration benchmark.
- Dependency: implement after AF-001 contracts and AF-002 independent evidence boundaries are established.
- Done when: a model-independent workflow runs bounded phases with explicit inputs, outputs, authority, evidence, and human gates; parallel work has deterministic merge/acceptance rules; benchmarks compare verified completion, quality, total cost, and human-intervention time.

## AF-010: Delivery Intelligence and Production-Qualified Outcomes

- Status: `in_progress_external`
- Primary findings: `F-2026-09-18-04`, `F-2026-09-18-05`, `F-2026-10-02-01`, `F-2026-10-02-05`, `F-2026-10-23-05`, `F-2026-10-30-05`
- Baseline: token metrics, instruction-evaluation success/correction measures, dashboard code, and a hybrid-dashboard outcome model exist. Structured telemetry work is active and unmerged elsewhere.
- Gap: no post-merge outcome model or experiment correlation connecting AI participation and human judgment to delivery quality.
- Done when: 30/60-day outcomes capture cycle time, rework, follow-up fixes, escaped defects, change-failure rate, MTTR, maintainability signals, total execution cost, and human intervention; reports correlate those outcomes to AI participation without using tokens, LOC, commits, merges, or issues as productivity proxies.
