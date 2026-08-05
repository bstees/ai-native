# Workflow Template

## Metadata

- `workflow_id`:
- `name`:
- `category`:
- `status`: `draft` | `active` | `superseded`
- `owner`:
- `tools`:
- `human_gates`:
- `risk_tier`: `low` | `moderate` | `high` | `critical`
- `maximum_data_classification`: `public` | `internal` | `confidential` | `restricted`
- `action_authority`: `observe` | `recommend` | `act-reversibly` | `act-consequentially`
- `escalation_path`:

## Purpose

What this workflow is for and when it should be used.

## Goal

What clear objective this workflow requires before execution begins.

## Trigger

What kind of request or condition should start this workflow.

## Inputs

- required:
- optional:

Before execution, confirm that the use case, data, provider, permissions, and
action authority conform to the
[`AI Usage Governance Standard`](../governance/ai-usage-governance-standard.md).

## Default Sequence

1. Understand
2. Plan
3. Execute
4. Verify
5. Report

## Human Gates

- what must pause for human review:
- what may continue automatically:

## Risk And Escalation

- required controls and validation evidence:
- stop conditions:
- accountable escalation roles:
- residual risk requiring approval:

## Output

What a successful run should leave behind.

## Local Variation Points

What a consumer repo is expected to adapt locally.

## Done Criteria

What must be true before this workflow is considered complete.
