# Backlog Curation System

## Purpose

Define a practical system for turning changes in AI-native software development
practice into a curated, explainable backlog.

## Core Principle

Do not rely on a single external source of truth. Instead, maintain an internal
source of truth built from trusted inputs, explicit scoring, and human review.

## System Layers

### 1. Source Registry

Maintain a registry of sources with metadata such as:

- source name
- source type
- trust tier
- owner
- refresh cadence
- extraction method

Suggested trust tiers:

1. Official docs, changelogs, standards bodies, vendor security notes
2. Research reports, peer-reviewed papers, benchmark datasets
3. Practitioner blogs, conference talks, credible engineering writeups
4. Social chatter and exploratory signals

### 2. Concept Ontology

Normalize observations into a small set of concept types:

- `capability`: code review, test generation, issue triage, agent handoff
- `control`: approvals, sandboxing, cost limits, human gates
- `context`: repo rules, memory, MCP/connectors, environment setup
- `quality`: evals, traces, review outcomes, defect signals
- `delivery`: CI, scheduled jobs, background agents, sync workflows

### 3. Evidence Records

For each source observation, capture:

- source reference
- extraction date
- summarized claim
- mapped concept
- novelty or change signal
- confidence score
- notes about ambiguity

### 4. Concept Records

Merge related evidence into a concept record with:

- stable concept ID
- concept name
- status: `emerging`, `provisional`, `established`, `internal-standard`
- summary of supporting evidence
- first seen date
- last changed date
- affected workflows or asset categories
- recommended next action

### 5. Backlog Generation

Create backlog candidates only when a concept record crosses a threshold such
as:

- it appears in multiple trusted sources
- it persists over time
- it shows up across more than one ecosystem or workflow
- it has a plausible operational impact for our repos

Each backlog item should include:

- title
- rationale
- linked concept record
- confidence level
- expected value
- suggested experiment or implementation step
- review date

## Decision Rules

Promote concepts carefully:

- `emerging` means interesting but not ready to drive default work
- `provisional` means credible enough for bounded experiments
- `established` means suitable for routine backlog creation
- `internal-standard` means we have adopted it and now maintain it

## Human Review Loop

The system should automate detection and summarization, but humans should still
approve:

- source additions
- ontology changes
- promotions to `established`
- backlog items that affect multiple repos

## First Deliverables

1. A `sources` registry schema
2. A `concept-record` schema
3. A scoring rubric for trust and novelty
4. A review cadence for promoting concepts
5. A first generated backlog report for `Interest Lens`
