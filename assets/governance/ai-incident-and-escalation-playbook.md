# AI Incident And Escalation Playbook

## Purpose

Provide a minimum response path for suspected AI-related data exposure,
unauthorized action, harmful output, control failure, or material deviation from
an approved use case. Organization-specific security, privacy, legal, safety,
or incident-response procedures take precedence when stronger.

## Severity

| Severity | Indicators | Default response |
| --- | --- | --- |
| `SEV-1` | Ongoing or likely material harm; restricted-data exposure; compromised credentials; consequential unauthorized production action | Stop and contain immediately; activate organizational incident response and accountable executives or control owners |
| `SEV-2` | Confirmed confidential-data exposure; significant control bypass; externally harmful output or action with bounded impact | Stop affected use; notify security/privacy and service owner urgently; preserve evidence and begin formal response |
| `SEV-3` | Failed required control, near miss, or incorrect behavior without known material harm | Pause affected action; notify owner and reviewer; remediate and reassess before resuming |
| `SEV-4` | Low-impact policy deviation or quality issue handled within the normal workflow | Record, correct, and monitor for recurrence |

When uncertain, use the higher severity until triage establishes otherwise.

## Immediate Response

1. **Stop** the affected automation or consequential action.
2. **Contain** access, sharing, integrations, tokens, jobs, or deployments using
   the least destructive effective measure.
3. **Preserve** relevant timestamps, configuration, model/provider identity,
   tool calls, approvals, and outputs without making additional sensitive
   copies.
4. **Notify** the repository or service owner and the applicable security,
   privacy/data, legal/compliance, safety, HR, or incident-response owner.
5. **Classify** severity, affected data, systems, users, and ongoing exposure.

Do not delete evidence, rotate unrelated credentials, contact affected external
parties, or make legal conclusions unless the accountable response owner
directs it. Rotate or revoke credentials promptly when compromise is suspected.

## Escalation Record

- `incident_id`:
- `reported_on`:
- `reporter`:
- `severity`:
- `incident_owner`:
- `affected_use_case`:
- `provider_model_and_integrations`:
- `affected_data_classifications`:
- `affected_systems_or_parties`:
- `current_containment`:
- `required_notifications`:
- `next_update_due`:

## Triage Questions

- What happened, and what evidence distinguishes confirmed facts from inference?
- Is the behavior or exposure ongoing?
- What data, permissions, actions, and downstream systems were involved?
- Did output reach a user, production system, external party, or decision maker?
- Which required control failed, was bypassed, or was incorrectly assumed?
- Could credentials, personal data, regulated data, or confidential data be involved?
- What recovery, correction, notification, or legal obligations may apply?

## Recovery And Resumption

The affected use may resume only when the accountable incident or control owner
confirms that:

- containment is effective
- required notifications and response obligations are being handled
- the root or proximate control failure is understood well enough to operate
  safely
- remediation and compensating controls are implemented and verified
- the risk assessment and provider review are updated where needed
- residual risk and approval are documented

## Follow-Up

- Record the timeline, impact, contributing conditions, and remediation.
- Update standards, profiles, evaluations, or provider controls when the lesson
  applies beyond the incident.
- Track remediation owners and due dates.
- Review whether retained evidence contains sensitive data and apply the
  appropriate retention and access rules.
- Capture near misses; absence of harm does not mean the control worked.
