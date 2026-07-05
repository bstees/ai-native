---
name: ui-pattern-extraction
description: Turn repeated UI structures, repeated polish fixes, or repeated usability corrections into reusable component, layout, or convention proposals. Use when similar interface problems are being solved more than once and drift is starting to appear.
---

# UI Pattern Extraction

## Use This Skill When

- similar UI structures are appearing in multiple places
- the same class of UI fix keeps recurring
- reusable components are drifting into local variants
- a pattern seems real but it is not yet clear whether it should become a
  shared component, configurable variant, layout pattern, or documented rule

## Goal

Promote repeated UI work into the smallest durable reusable pattern that
improves consistency without over-abstracting the design.

## Read First

- [`../../../assets/quality/ui-quality-standard.md`](../../../assets/quality/ui-quality-standard.md)
- [`../../../assets/quality/ui-review-checklist.md`](../../../assets/quality/ui-review-checklist.md)
- [`../ui-polish-audit/SKILL.md`](../ui-polish-audit/SKILL.md)
- [`../ui-validation-retro/SKILL.md`](../ui-validation-retro/SKILL.md)

Read this too when component boundaries are unclear:

- [`../component-boundary-audit/SKILL.md`](../component-boundary-audit/SKILL.md)

## Workflow

1. Identify the repeated UI structure, behavior, or correction.
2. Check whether the repetition is:
   - a reusable component opportunity
   - a configurable variant opportunity
   - a layout pattern opportunity
   - a documented convention only
3. Define the smallest reusable boundary that would reduce drift.
4. Confirm that extraction would preserve single responsibility and not merge
   distinct responsibilities just because the UI looks similar.
5. Report the proposed reusable pattern, its contract, and when extraction would
   be premature.

## Output

- the repeated UI pattern
- the recommended reuse form
- the likely API or contract boundary
- the cases where a one-off implementation should remain local

## Guardrails

- do not extract patterns from a single weak example
- do not create shared primitives that blur distinct responsibilities
- do not force reuse when composition or local clarity is the better design
- prefer durable coherence over cosmetic unification
