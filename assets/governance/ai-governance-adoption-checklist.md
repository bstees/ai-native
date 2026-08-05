# AI Governance Adoption Checklist

## Record

- `repository_or_system`:
- `owner`:
- `reviewed_on`:
- `review_status`: `draft` | `pending-human-review` | `approved` | `superseded`
- `approver`:
- `standard_version_or_commit`:
- `next_review_on`:

For each item record `inherited`, `implemented-locally`, `gap`, `not-applicable`,
or `excepted`, plus an evidence link or remediation owner and date.

## Accountability And Inventory

- [ ] Accountable AI-use owner is named.
- [ ] Security, privacy/data, repository, and incident escalation roles are named.
- [ ] AI providers, models, agents, integrations, and embedded AI features are inventoried.
- [ ] Intended and prohibited use cases are documented.

## Classification And Data Handling

- [ ] Each material use case has a risk tier.
- [ ] Allowed data classifications are explicit.
- [ ] Data flows include prompts, outputs, tools, logs, traces, caches, and embeddings.
- [ ] Provider training-use, retention, deletion, residency, isolation, and access behavior are reviewed where applicable.
- [ ] Secrets and restricted-data handling are explicitly controlled.
- [ ] Data minimization, redaction, or de-identification is applied where useful.

## Authority, Guardrails, And Validation

- [ ] Agent and workflow action authority is declared.
- [ ] Human gates cover destructive, production, security, privacy, external, and cross-repository consequences.
- [ ] Tool permissions and data access follow least privilege.
- [ ] Required controls fail closed when unsupported.
- [ ] Validation and evaluation requirements match the risk tier.
- [ ] Rollback, containment, or shutdown mechanisms are practical and tested where consequence warrants it.

## Escalation, Incidents, And Exceptions

- [ ] Stop conditions and escalation routes are documented.
- [ ] The incident playbook is linked from local operating guidance.
- [ ] Exceptions require scope, rationale, owner, approver, compensating controls, residual risk, and expiration.
- [ ] Material incidents and near misses trigger reassessment and shared learning.

## Evidence And Lifecycle

- [ ] Assessments, approvals, validation, exceptions, and incidents have controlled evidence locations.
- [ ] Review cadence and material-change triggers are defined.
- [ ] Gaps have owners and target dates.
- [ ] Cross-repository changes require human-reviewed promotion into canonical assets.

## Gaps And Decisions

| Control or gap | Status | Evidence or exception | Owner | Target or expiration |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Approval

- Adoption decision:
- Conditions:
- Accepted residual risk:
- Approval evidence:
