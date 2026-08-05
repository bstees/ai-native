# Decision Record: AI Usage Governance Standard

## Metadata

- `decision_id`: `DR-2026-07-16-002`
- `title`: Establish a canonical AI usage governance and risk-control standard
- `status`: `approved`
- `decided_on`: `2026-07-16`
- `owner`: `ai-native`
- `linked_concepts`:
  - `control/human-gates`
  - `control/bounded-autonomy`
  - `control/ai-data-handling`
  - `control/risk-escalation`

## Decision

AI Native will maintain a canonical AI usage governance standard covering risk
classification, data handling, action authority, human oversight, provider
review, escalation, incidents, exceptions, and auditable adoption.

Consumer repositories may strengthen the baseline. Weakening it requires a
documented, approved, time-bounded exception with compensating controls.

## Context

Existing guidance already required human gates, least privilege, bounded
autonomy, validation, and controlled cross-repository promotion. Those controls
were distributed across operating rules, workflows, orchestration assets, and
planning documents. The absence of one operational standard made data-handling
rules, escalation ownership, exception handling, and adoption evidence too easy
to interpret inconsistently.

## Outcome

- What this repo will do:
  publish a canonical policy and operational assessment, incident, and adoption
  artifacts; integrate governance declarations into agent orchestration; and
  fail closed when a required technical control is unsupported
- What this repo will not do:
  claim that a provider adapter replaces security, privacy, legal, or
  contractual due diligence
- Human gates required:
  approval of high and critical uses, acceptance of material residual risk,
  exceptions, consequential actions, and cross-repository policy changes

## Review Trigger

Revisit after a material AI incident, repeated exception pattern, significant
provider or regulatory change, or evidence that the control model either fails
to prevent harm or adds disproportionate friction without reducing risk.
