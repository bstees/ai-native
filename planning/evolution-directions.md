# Evolution Directions

## Context

The current seed prompt is a starting point, not the finished operating model.
After the initial generation path is proven, we will likely want to plan a next
round of enhancements.

## Open Direction

We do not yet know where this work will create the most leverage. Two plausible
paths have already emerged:

1. A centralized repository that feeds reusable AI tooling, rules, prompts, and
   standards into a wider ecosystem.
2. A prompt-driven approach that generates the needed tooling directly inside
   each target repository.

## What To Learn Next

- Which approach is easier for teams to adopt
- Which approach is easier to keep current over time
- Where validation and governance fit most naturally
- How much duplication each model creates across repos and tools

## Working Principle

Treat the seed prompt as a durable artifact while keeping the repository shape
light until the next planning round makes the destination clearer.

## Current Planning Follow-Up

The next planning layer is now captured in
[`instruction-system-architecture.md`](./instruction-system-architecture.md).

That plan focuses on:

- a minimal `agents.md` as the always-on instruction surface
- vendor instruction files as symlinked adapters
- repo-local skills to keep sub-agents narrow and DRY
- instruction topology that reduces repetition across code and markdown
- evolution loops that learn from friction and propose better topology or skills
- a specialized UI/UX skill path for areas where agents need stronger guidance

External inspiration analysis is now captured in
[`external-inspirations-and-adaptation.md`](./external-inspirations-and-adaptation.md).
