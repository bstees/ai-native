---
name: ui-polish-audit
description: Inspect spacing, hierarchy, alignment, state clarity, and component consistency against the shared UI quality bar. Use when UI work feels acceptable but not polished, when repeated aesthetic feedback is happening, or when reusable component quality needs review.
---

# UI Polish Audit

## Use This Skill When

- a UI works functionally but still feels rough
- spacing, rhythm, or alignment seem inconsistent
- similar components behave or appear differently without good reason
- human feedback has focused on aesthetics, clarity, or usability polish
- a reusable component needs a quality pass before broader adoption

## Goal

Find the highest-value polish gaps that stand between a functional UI and a
coherent, reusable, user-friendly result.

## Read First

- [`../../../assets/quality/ui-quality-standard.md`](../../../assets/quality/ui-quality-standard.md)
- [`../../../assets/quality/ui-review-checklist.md`](../../../assets/quality/ui-review-checklist.md)
- [`../../../assets/quality/usability-validation-standard.md`](../../../assets/quality/usability-validation-standard.md)

Read this if the work is becoming repetitive:

- [`../ui-flow-audit/SKILL.md`](../ui-flow-audit/SKILL.md)
- [`../session-retro/SKILL.md`](../session-retro/SKILL.md)

## Workflow

1. Inspect the target UI surface in its meaningful states.
2. Check for high-value polish gaps:
   - weak visual hierarchy
   - inconsistent spacing or rhythm
   - drifting alignment
   - unclear or inconsistent state treatment
   - one-off component behavior where reuse should dominate
3. Separate issues into:
   - local fixes
   - reusable component improvements
   - checklist or standard gaps
4. Prioritize the smallest set of changes that would materially improve
   coherence and usability.
5. If the same type of feedback keeps recurring, recommend a stronger reusable
   pattern or retro capture.

## Output

- the most important polish findings
- whether each finding is local or reusable
- recommended next fixes or pattern extractions
- any recurring feedback that should tighten standards or skills

## Guardrails

- do not equate novelty with quality
- do not force a redesign when a targeted polish pass is enough
- do not ignore browser or simulator reality in favor of code-only judgment
- prefer reusable improvement over isolated cosmetic patching
