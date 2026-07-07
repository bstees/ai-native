# Current Epics

## Epic 1: Signal to Decision Engine

Build the system that scans trusted sources, normalizes concepts, scores their
relevance, and decides which emerging patterns are mature enough to shape
shared native-AI infrastructure.

### Goals

- define a durable ontology for AI-native software development practices
- curate a source registry with trust tiers and review cadence
- create evidence and concept record formats
- promote recurring patterns into explicit decisions with human gates
- keep hype and one-off vendor marketing out of default repo guidance

## Epic 2: Decision to Shared Asset Distribution

Build the packaging and distribution model that turns approved concepts into
maintained shared assets that can serve production repositories.

### Goals

- define what an exportable native-AI asset looks like
- decide when assets should live centrally versus be generated in place
- create pilot sync or install patterns that do not disrupt consumer repos
- separate source-of-truth material from generated or tool-specific outputs

## Cross-Cutting Enabler: Instruction System

The repo also needs a lean instruction architecture so shared assets can remain
usable as they spread across tools and consumer repos.

Current planning artifact:

- [`../planning/instruction-system-architecture.md`](../planning/instruction-system-architecture.md)

## Cross-Cutting Enabler: Governance And NFR Model

Shared assets will also need an explicit governance and non-functional model so
consumer repos can make platform, pipeline, tooling, and observability
decisions intentionally rather than by drift.

Current planning artifact:

- [`../planning/governance-layers-and-nfr-framework.md`](../planning/governance-layers-and-nfr-framework.md)

## Cross-Cutting Enabler: Hybrid Team Dashboard

The repo also needs an operating dashboard model so human and agent work can be
managed as one hybrid delivery system with visible trends, bottlenecks, and
improvement opportunities.

Current planning artifact:

- [`../planning/hybrid-team-dashboard.md`](../planning/hybrid-team-dashboard.md)

## Pilot Relationship

`Interest Lens` is the first proving ground for both epics.

- It will test whether decisions coming out of this repo are actually useful.
- It will test whether shared assets are adoptable with low friction.
- It will provide feedback before we scale the model to other production repos.
