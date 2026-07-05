---
name: token-efficiency
description: Reduce instruction and execution context footprint while preserving quality, safety, and clarity. Use when an agent has too much context, an instruction file feels over-scoped, or a task can likely be handled with a narrower brief.
---

# Token Efficiency

## Use This Skill When

- an instruction file feels too large for its responsibility
- a sub-agent was given more repo context than it needed
- repeated explanations are inflating task cost
- the same task could likely be performed from a smaller brief
- a repo is drifting toward prompt bloat or instruction sprawl

## Goal

Lower context cost without losing the information required for safe, high
quality execution.

## Read First

- [`planning/instruction-system-architecture.md`](../../../planning/instruction-system-architecture.md)
- [`../dry-context/SKILL.md`](../dry-context/SKILL.md)

Read these only if they are relevant to the current scope problem:

- [`../../../assets/workflows/goal-and-plan-mode.md`](../../../assets/workflows/goal-and-plan-mode.md)
- [`../../../assets/quality/engineering-quality.md`](../../../assets/quality/engineering-quality.md)

## Workflow

1. Identify where the context cost is coming from:
   - duplicated content
   - over-scoped instructions
   - unnecessary repo-wide context
   - repeated examples or explanations
   - a sub-agent brief that is wider than the task
2. Use `dry-context` thinking when duplication is part of the problem.
3. Decide the smallest safe reduction:
   - move detail out of the always-on layer
   - replace repeated prose with a reference
   - shorten a sub-agent brief to only the needed surface
   - split one over-scoped artifact into narrower canonical layers
4. Check that the reduction does not remove safety, quality, or validation
   requirements.
5. Report the narrower recommended context shape.

## Output

- the main source of unnecessary context cost
- the recommended reduced context surface
- the safe information that must remain
- any follow-up refactor or documentation changes that would preserve the gain

## Guardrails

- do not compress guidance into vagueness
- do not remove important examples when they prevent real mistakes
- do not optimize token count at the expense of verification or safety
- prefer smaller, clearer scopes over clever compression
