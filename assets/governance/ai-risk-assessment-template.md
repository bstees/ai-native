# AI Risk Assessment

## Record

- `assessment_id`:
- `use_case`:
- `owner`:
- `assessed_on`:
- `review_status`: `draft` | `pending-human-review` | `approved` | `rejected` | `superseded`
- `approver`:
- `next_review_on`:
- `linked_decisions_or_exceptions`:

## Scope And Intended Outcome

- Users and affected parties:
- AI providers, models, agents, and integrations:
- Environments and repositories:
- Intended benefit:
- Explicitly excluded uses:

## Classification

- Risk tier: `low` | `moderate` | `high` | `critical`
- Highest data classification: `public` | `internal` | `confidential` | `restricted`
- Action authority: `observe` | `recommend` | `act-reversibly` | `act-consequentially`
- Classification rationale:

## Data Flow

- Data sources and owners:
- Data sent to the AI system:
- Generated data and downstream destinations:
- Storage, retention, deletion, and residency:
- Training or evaluation use:
- Logs, traces, caches, embeddings, and other copies:
- Redaction, minimization, or de-identification:

## Risk And Control Review

| Failure mode or harm | Likelihood | Impact | Preventive controls | Detection and response | Residual risk |
| --- | --- | --- | --- | --- | --- |
| Incorrect or fabricated output |  |  |  |  |  |
| Prompt injection or untrusted instruction |  |  |  |  |  |
| Unauthorized disclosure or retention |  |  |  |  |  |
| Excessive permissions or unintended action |  |  |  |  |  |
| Insecure or non-compliant output |  |  |  |  |  |
| Automation bias or inadequate human review |  |  |  |  |  |
| Loss of traceability, recovery, or incident evidence |  |  |  |  |  |

## Required Controls And Evidence

- Approved provider and configuration:
- Identity and least-privilege controls:
- Human gates and approvers:
- Validation or evaluation requirements:
- Monitoring and audit evidence:
- Rollback, containment, or shutdown mechanism:
- Escalation roles:

## Decision

- Decision: `approve` | `approve-with-conditions` | `reject`
- Conditions or remediation required:
- Accepted residual risk:
- Approval evidence location:
- Reassessment triggers:
