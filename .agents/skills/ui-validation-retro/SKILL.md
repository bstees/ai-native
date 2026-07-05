---
name: ui-validation-retro
description: Learn from high-turn UI work by capturing where flow definition, polish review, component design, or browser-or-simulator validation were weaker than they should have been. Use when UI delivery required too many iterations or too much late human correction.
---

# UI Validation Retro

## Use This Skill When

- UI work took too many turns to reach an acceptable result
- human feedback kept uncovering similar usability or polish issues
- browser or simulator validation happened late or uncovered obvious problems
- a reusable component still needed repeated manual correction
- it is unclear whether the real weakness was flow definition, polish review,
  validation depth, or component design

## Goal

Turn expensive UI iteration into a targeted improvement recommendation for the
next UI task.

## Read First

- [`../../../assets/quality/usability-validation-standard.md`](../../../assets/quality/usability-validation-standard.md)
- [`../../../assets/quality/ui-quality-standard.md`](../../../assets/quality/ui-quality-standard.md)
- [`../session-retro/SKILL.md`](../session-retro/SKILL.md)
- [`../ui-flow-audit/SKILL.md`](../ui-flow-audit/SKILL.md)
- [`../ui-polish-audit/SKILL.md`](../ui-polish-audit/SKILL.md)

## Workflow

1. Summarize where the UI task consumed more turns than expected.
2. Classify the main source of the drag:
   - missing or weak critical flows
   - insufficient browser or simulator validation
   - weak component contracts or reuse boundaries
   - recurring spacing, hierarchy, or state-clarity issues
   - standards or checklist gaps
3. Decide whether the improvement belongs in:
   - a local component or pattern change
   - a stronger UI skill
   - a better validation workflow
   - a tighter checklist or shared standard
4. Capture concise feedback when the pattern is repeatable enough to matter.
5. Recommend the smallest durable change that should reduce future UI turns.

## Output

- the most likely reason the UI task was expensive
- the best improvement target for the next iteration
- whether the issue is local, reusable, or candidate-shared
- a feedback markdown recommendation when recurring friction is present

## Guardrails

- do not blame the system for inherently exploratory design choices
- do not create a large retro when one concrete recommendation is enough
- do not skip direct UI validation evidence when diagnosing the problem
- prefer reusable improvement paths over isolated one-off fixes
