# AI Native

This repository is the central maintenance layer for reusable native-AI assets
that can serve production repositories.

Its job is to watch how AI is being applied across the software development
lifecycle, detect recurring patterns that appear to be becoming standard, and
turn those patterns into maintainable shared assets with human approval gates.

Consumer repositories such as `Interest Lens` should benefit from what is
maintained here without having to rediscover best practices repo by repo.

## Current Contents

- [`signals/`](./signals/) stores monitored sources, ontology, scoring, and
  evidence templates
- [`decisions/`](./decisions/) stores what we believe is mature enough to act
  on and why
- [`assets/`](./assets/) stores shared tools, prompts, rules, workflows, and
  packaging guidance for other repos
- [`pilots/`](./pilots/) stores adoption plans and feedback loops for early
  consumer repos
- [`reviews/`](./reviews/) stores the lightweight human review interface and
  approval queue
- [`prompts/`](./prompts/) stores versioned seed prompts and related source
  material

## Operating Model

1. Watch trusted sources for common threads in AI-for-SDLC practice.
2. Curate those signals into concepts with evidence and status.
3. Decide which concepts should become shared infrastructure.
4. Publish or update shared assets for consumer repositories.
5. Validate adoption through pilot repos such as `Interest Lens`.

## Current Focus

1. Establish the signal-to-decision pipeline.
2. Define how approved concepts become shared assets.
3. Use `Interest Lens` as the first proving ground for cross-repo adoption.
