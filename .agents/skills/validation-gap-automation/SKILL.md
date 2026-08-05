---
name: validation-gap-automation
description: Convert a documented, recurring, machine-observable validation gap into the smallest maintainable automated check, or recommend a non-automated validation method when deterministic enforcement would be misleading. Use when audits, incidents, retrospectives, reviews, or repeated manual checks reveal a validation gap that may belong in tests, schemas, static analysis, scripts, CI, rollout checks, or monitoring.
---

# Validation Gap Automation

## Goal

Close a concrete validation gap with the cheapest reliable control while
preserving the distinction between machine-checkable facts and human judgment.

## Read First

- [`../../../assets/quality/engineering-quality.md`](../../../assets/quality/engineering-quality.md)

Read the applicable domain standard or workflow for the gap. For AI governance
controls, also read:

- [`../../../assets/governance/ai-usage-governance-standard.md`](../../../assets/governance/ai-usage-governance-standard.md)

## Workflow

1. State the gap as a failed or missing observable guarantee. Identify its
   source, consequence, recurrence, and current manual validation.
2. Decide whether deterministic automation fits:
   - the condition is objective and machine-observable
   - failure matters enough or recurs often enough to justify maintenance
   - a passing check would provide meaningful evidence rather than a weak proxy
   - the rule is stable enough to encode
3. If any condition fails, do not create a script. Define the narrowest useful
   human review, evaluation rubric, sampling practice, or monitoring signal and
   explain why automation would mislead.
4. Search for an existing test framework, linter, schema validator, build step,
   platform control, or script that can express the guarantee. Extend it before
   creating a parallel mechanism.
5. Choose the cheapest effective enforcement point:
   - local or pre-commit for fast author feedback
   - test or CI for merge-blocking guarantees
   - rollout for environment-dependent behavior
   - monitoring for production-only signals
6. Implement the smallest check that closes the gap. Keep policy in its
   canonical asset and keep executable logic in code or configuration.
7. Prove both directions:
   - a conforming fixture or state passes
   - a representative violation fails with a clear remediation message
8. Run adjacent validation and report what the check proves, what it does not
   prove, its enforcement point, ownership, and residual risk.

## Selection Rules

- Prefer configuration of an established tool over custom parsing.
- Prefer schema or contract validation for structured data.
- Prefer focused tests for behavior and boundary conditions.
- Prefer static analysis for stable syntactic or dependency rules.
- Prefer monitoring only when the signal cannot be known before deployment.
- Avoid regex-only policy enforcement when syntax-aware or schema-aware tools
  are practical.
- Avoid repository-wide scans with unclear ownership or noisy findings.

## Required Output

- documented gap and automation-fit decision
- selected mechanism and enforcement point
- implementation or explicit non-automation recommendation
- positive and negative evidence
- limitations, owner, and residual risk

## Guardrails

- Do not automate subjective approval, risk acceptance, architectural fitness,
  data classification under ambiguity, or visual quality as a binary proxy.
- Do not treat a passing check as proof beyond its explicit guarantee.
- Do not duplicate an existing control merely to produce a new script.
- Do not weaken production, security, privacy, or branch controls to make the
  check easier to run.
- Keep generated failures actionable and low-noise.
- Escalate when the check would require new authority, sensitive data, or a
  consequential external-system change.
