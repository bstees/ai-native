---
name: component-boundary-audit
description: Check whether UI components and related modules honor single responsibility, reuse existing components appropriately, and maintain clean boundaries for styling, copy/resources, tests, and visual review artifacts. Use when UI decomposition or component reuse decisions are unclear.
---

# Component Boundary Audit

## Use This Skill When

- a UI surface feels too monolithic
- a component appears to own more than one distinct responsibility
- new components were introduced and reuse decisions need review
- one-off UI was built without clear self-contained boundaries
- design and implementation boundaries seem misaligned

## Goal

Verify that component decomposition is coherent, reusable where it should be,
and aligned with single responsibility.

## Read First

- [`../../../assets/quality/engineering-quality.md`](../../../assets/quality/engineering-quality.md)
- [`../../../assets/quality/ui-quality-standard.md`](../../../assets/quality/ui-quality-standard.md)
- [`../ui-pattern-extraction/SKILL.md`](../ui-pattern-extraction/SKILL.md)

## Workflow

1. Identify the component or UI surface under review.
2. Inspect whether each component owns one coherent job.
3. Check whether existing components or patterns could have been reused before
   introducing new ones.
4. Evaluate the boundaries for:
   - structure and behavior
   - styling
   - copy/resources
   - tests
   - visual review artifacts such as stories or screenshots when relevant
5. Report whether the current decomposition is:
   - coherent and appropriately reused
   - too monolithic
   - too fragmented
   - duplicative of existing patterns

## Output

- the main boundary findings
- whether reuse was missed, over-forced, or appropriate
- the recommended decomposition or consolidation path
- any cases where a one-off component is justified and still well-structured

## Guardrails

- do not equate more files with better decomposition
- do not force reuse when it would distort responsibility
- do not treat one-off components as exempt from discipline
- prefer explicit contracts and coherent ownership over abstract purity
