---
name: dry-context
description: Find duplicated code, duplicated markdown guidance, repeated workflow prose, and other opportunities to reduce context or repetition without losing necessary clarity. Use when instructions, docs, or implementation feel repetitive, over-scoped, or likely to drift.
---

# Dry Context

## Use This Skill When

- code appears repeated across modules or components
- markdown guidance appears repeated across instructions, workflows, or standards
- a file feels larger than its real responsibility
- multiple files seem to express the same rule in slightly different words

## Goal

Reduce repetition in code and markdown while preserving clarity, quality, and
local usability.

## Read First

- [`planning/instruction-system-architecture.md`](../../../planning/instruction-system-architecture.md)

Read these only if they are relevant to the suspected duplication:

- [`../../../assets/repo-rules/ai-native-core-operating-rules.md`](../../../assets/repo-rules/ai-native-core-operating-rules.md)
- [`../../../assets/workflows/README.md`](../../../assets/workflows/README.md)
- [`../../../assets/quality/engineering-quality.md`](../../../assets/quality/engineering-quality.md)

## Workflow

1. Identify the repeated thing.
2. Classify it:
   - duplicated implementation
   - duplicated guidance
   - repeated workflow sequence
   - repeated checklist logic
   - repeated local adaptation that should become canonical
3. Decide the smallest safe reduction:
   - extract shared code
   - replace repetition with a reference
   - narrow one file and let another stay canonical
   - promote a repeated local pattern into one reusable asset
4. Check that the reduction does not hide necessary context from the reader.
5. Report the duplication, the proposed reduction, and any guardrails.

## Outputs

- a concise list of duplication findings
- recommended canonical location for each repeated rule or pattern
- proposed extraction or reference strategy
- any cases where repetition should remain because local clarity matters more

## Guardrails

- do not remove context that is necessary for safe execution
- do not optimize for fewer words if the result becomes vague
- do not merge files with different responsibilities just to reduce file count
- prefer references over paraphrased repetition when one file is already
  canonical
