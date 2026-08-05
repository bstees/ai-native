# AI Usage Governance Standard

## Metadata

- `standard_id`: `ai-usage-governance`
- `status`: `active`
- `owner`: `ai-native`
- `review_cadence`: `at least annually and after a material incident or provider change`
- `decision_record`: `DR-2026-07-16-002`

## Purpose

Define the minimum controls for using AI systems safely and accountably across
consumer repositories. This standard governs data submitted to AI systems,
actions performed with AI assistance, required human oversight, escalation,
exceptions, and evidence.

It applies to interactive assistants, autonomous agents, embedded model calls,
third-party AI features, and automation that uses model output to affect code,
systems, data, users, or business decisions.

## Core Principles

- A human or named organizational role remains accountable for outcomes.
- Access to data and tools is limited to the minimum needed for the task.
- Autonomy increases only when consequence, uncertainty, and blast radius are
  understood and controlled.
- Required controls fail closed: an unavailable control blocks the affected
  use unless a time-bounded exception is approved.
- AI output is evidence to evaluate, not authority by itself.
- Material decisions, exceptions, incidents, and residual risks remain
  reviewable after the task ends.

## Required Use-Case Classification

Before first use, and again after a material change, classify the use case by
the highest applicable risk tier and data classification. Record a formal
assessment for high and critical uses. Repositories may require assessments at
lower tiers.

### Risk Tiers

| Tier | Typical characteristics | Minimum treatment |
| --- | --- | --- |
| `low` | Public data; drafting, formatting, or reversible analysis; no consequential action | Normal review, source validation where factual correctness matters, approved tooling |
| `moderate` | Internal data or repository changes with bounded, reversible impact | Approved tooling, least privilege, relevant tests or validation, human review before consequential merge or release |
| `high` | Confidential data; security-sensitive work; production-affecting recommendations or actions; broad organizational impact | Documented risk assessment, named owner and approver, required control verification, audit evidence, explicit human gate |
| `critical` | Regulated or highly sensitive data; safety-, rights-, employment-, legal-, or financially consequential decisions; irreversible or broadly autonomous production action | Prohibited by default; requires explicit governance and applicable security, privacy, legal, or domain authorization plus documented compensating controls |

When dimensions disagree, use the highest tier. Splitting a workflow into
smaller steps does not lower its tier if the combined outcome remains
consequential.

### Data Classifications

| Class | Examples | AI handling rule |
| --- | --- | --- |
| `public` | Published documentation, public source material | May use an approved system subject to normal validation |
| `internal` | Non-public code, plans, ordinary internal communications | Use only systems approved for internal data and send only task-relevant context |
| `confidential` | Customer data, private keys or architecture details, unreleased financial or business information | Requires an approved use case and provider controls for access, retention, training use, and isolation; minimize or de-identify first |
| `restricted` | Credentials, authentication secrets, regulated records, highly sensitive personal data, privileged material | Must not be submitted unless a written policy explicitly authorizes the exact system and use case; secrets and credentials must never be placed in prompts or model context |

If classification is uncertain, treat the data as the more restrictive class
and escalate to the data owner, privacy owner, or security owner.

## Data-Handling Controls

Every AI use must:

1. Use the least amount of data and context needed to complete the task.
2. Confirm that the provider, account, model, integrations, and enabled tools
   are approved for the highest data classification involved.
3. Respect purpose limitation: data supplied for the task must not be silently
   reused for training, evaluation, or another purpose.
4. Apply repository and organizational retention, residency, deletion,
   encryption, and access-control requirements.
5. Exclude secrets, credentials, tokens, private keys, and unnecessary personal
   data from prompts, logs, traces, screenshots, and generated artifacts.
6. Treat model output, tool output, conversation history, embeddings, caches,
   and telemetry as governed copies of their source data.
7. Use de-identification, redaction, synthetic data, or local processing when
   those measures materially reduce risk without defeating the task.
8. Stop and contain the workflow if protected data may have reached an
   unauthorized system or audience.

Approval of a provider does not approve every use case. Provider review and
use-case review are separate controls.

## Action Authority And Human Oversight

Each workflow or agent profile must declare its action authority:

- `observe`: read and analyze within an approved scope
- `recommend`: propose changes or decisions without applying them
- `act-reversibly`: make bounded changes that can be reviewed and recovered
- `act-consequentially`: affect production, protected resources, external
  parties, security posture, access, money, legal commitments, or irreversible
  data state

AI may not grant itself broader authority. Tool availability is not permission.

Human approval is required before:

- destructive or difficult-to-recover operations
- production deployment or mutation when policy does not already define a
  narrower approved automation path
- changes to authentication, authorization, secrets, security controls, data
  retention, privacy behavior, or protected-branch rules
- externally consequential communications or commitments
- cross-repository promotion of shared standards
- accepting high or critical residual risk

Approval must identify what is being approved and be based on validation
evidence. A human gate does not replace testing, review, or technical controls.

## Risk Mitigation And Validation

Controls must be proportional to the risk tier and failure modes. Consider at
least:

- incorrect or fabricated output
- prompt injection and untrusted instructions
- unauthorized data disclosure or retention
- excessive permissions or unintended tool use
- insecure or non-compliant generated changes
- automation bias and loss of meaningful human review
- provider, model, or integration changes that weaken an assumed control
- lack of traceability, rollback, or incident evidence

Mitigations may include bounded context, allowlisted tools, read-only modes,
schema validation, deterministic checks, independent review, evaluation sets,
sandboxing, staged rollout, monitoring, and rollback procedures.

Validation evidence and known residual risk must accompany approval for high
and critical uses. Unsupported required controls block execution.

## Escalation And Stop Conditions

Stop the affected action and escalate when:

- a required control is unavailable or weaker than the approved assessment
- the data classification or authorization is unclear
- validation fails or the system reports materially low confidence
- the requested action exceeds declared authority
- sensitive data may have been exposed, retained, or sent to the wrong system
- output could create security, privacy, legal, safety, financial, employment,
  or other material harm
- observed behavior differs materially from the approved use case

Escalate to the narrowest accountable role that can resolve the issue:

- task or repository owner for scope and implementation risk
- reviewer for correctness and validation gaps
- security owner for access, secrets, vulnerabilities, or malicious behavior
- privacy or data owner for personal, customer, confidential, or regulated data
- legal, compliance, HR, safety, or incident-response owner when the consequence
  falls within that function

Use the
[`AI Incident And Escalation Playbook`](./ai-incident-and-escalation-playbook.md)
for suspected exposure or material harm. Lack of an available owner is a block,
not permission to proceed.

## Provider And Integration Review

Before approving a provider or material integration, record:

- permitted data classifications and use cases
- training-use and retention behavior
- tenant and access isolation
- encryption, residency, deletion, and subprocessors where applicable
- identity, permission, and tool-execution controls
- audit-log and incident-notification capabilities
- how control changes will be detected and reviewed

Re-review after material contract, configuration, model, integration, or
provider-control changes. Adapter manifests describe technical enforcement;
they do not replace organizational due diligence.

## Exceptions

An exception must be written, approved by the accountable control owner, and
include:

- exact scope and business rationale
- affected risk tier and data classifications
- control being excepted and why it cannot currently be met
- compensating controls
- owner and approver
- start date, expiration date, and review trigger
- residual risk and rollback or termination plan

Exceptions must be time bounded. They may not authorize undisclosed handling of
restricted data or conceal an incident. Expired exceptions fail closed.

## Evidence And Auditability

Retain evidence proportional to consequence without unnecessarily retaining
sensitive prompts or outputs. Evidence may include:

- risk assessments and approvals
- provider reviews and adapter resolution results
- validation summaries and residual-risk statements
- decision and adoption records
- exceptions and their expiration
- incident timelines, containment, and remediation

Evidence must identify the use case, owner, date, decision, and applicable
control version. Consumer repositories should record adoption with the
[`AI Governance Adoption Checklist`](./ai-governance-adoption-checklist.md).

## Review Triggers

Review this standard and affected use cases after:

- a material AI-related incident or near miss
- introduction of a new provider, model class, agent capability, or data class
- expanded autonomy, permissions, users, or production impact
- a relevant legal, contractual, security, or privacy change
- repeated exceptions or human corrections indicating control failure

## Minimum Adoption Bar

A consumer repository is not aligned until it has:

- named the accountable owner and escalation contacts or roles
- classified its AI use cases and allowed data
- defined action authority and human gates
- verified required provider and execution controls
- established an exception and incident path
- recorded adoption gaps and remediation owners
