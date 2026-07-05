---
name: ui-flow-audit
description: Generate and maintain critical user flows for UI surfaces so agents can validate the minimum usable experience directly in browser or simulator. Use when UI work needs clearer flow definitions, stronger usability coverage, or a better validation target.
---

# UI Flow Audit

## Use This Skill When

- a UI surface lacks explicit critical user flows
- browser or simulator validation needs a clearer target
- a screen has multiple states and it is unclear which ones are essential
- UI work has been approved too subjectively or too late

## Goal

Define the smallest set of critical flows that represent minimum usability for
the affected UI area.

## Read First

- [`../../../assets/quality/usability-validation-standard.md`](../../../assets/quality/usability-validation-standard.md)
- [`../../../assets/quality/ui-quality-standard.md`](../../../assets/quality/ui-quality-standard.md)

Read this if the work is part of a larger UI effort:

- [`../session-retro/SKILL.md`](../session-retro/SKILL.md)

## Workflow

1. Identify the UI surface being changed.
2. List the smallest set of high-value user goals for that surface.
3. Convert those goals into critical flows with:
   - goal
   - starting state
   - sequence of actions
   - expected visible outcome
   - failure conditions
4. Remove flows that are redundant or too edge-case-heavy for the minimum
   usable experience.
5. Report the final flow set in a form that can be exercised directly in
   browser or simulator.

## Output

- a concise list of critical user flows
- the states that must be validated directly
- the visible success and failure conditions for each flow

## Guardrails

- do not create a long catalog of minor variations
- do not confuse QA exhaustiveness with critical-flow usefulness
- flows should be concrete enough to validate directly, not abstract wishes
