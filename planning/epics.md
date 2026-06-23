# Current Epics

## Overview

This repository now has two active epics that should shape near-term work.
They are related but intentionally separate: one establishes how we decide what
matters, and the other establishes how we distribute the resulting assets.

## Epic 1: Backlog Curation and Ingestion

Build a repeatable system that scans trusted sources, normalizes concepts,
scores their relevance, and turns established practices into actionable backlog
items.

### Goals

- Define a durable ontology for AI-native software development practices
- Curate a source registry with trust tiers and refresh cadence
- Create a concept record format that captures evidence and status
- Generate backlog candidates from established or meaningfully changed concepts
- Keep hype, weak signals, and one-off vendor marketing out of the default flow

### Desired Outcomes

- A shared source of truth for "what is becoming standard"
- A transparent way to explain why a backlog item exists
- A repeatable review process for promoting concepts from emerging to
  established

## Epic 2: Share Native-AI Tools With Other Repos

Build the packaging and distribution model for prompts, rules, workflows, and
supporting assets so they can be adopted cleanly by other repositories.

### Goals

- Define what an exportable native-AI asset looks like
- Decide when assets should be consumed from a centralized repo versus generated
  in place
- Create pilot sync or install patterns that do not disrupt consuming repos
- Separate shared source material from tool-specific adapters

### Desired Outcomes

- A low-friction way for other repos to adopt useful assets
- A clear distinction between source-of-truth artifacts and generated outputs
- A path to scale beyond one pilot repository without duplicating maintenance

## Pilot Relationship

`Interest Lens` will be the first proving ground for both epics:

- It will consume early curation outputs as backlog input.
- It will test how reusable native-AI assets are packaged and adopted in a real
  repository.

This keeps the work grounded in actual usage before we generalize the model.
