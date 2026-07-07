# Hybrid Team Dashboard

## Purpose

Define a dashboard model for managing a hybrid human-and-agent development team.

The dashboard should not exist to display vanity metrics. It should help the
team manage flow, quality, friction, observability, bottlenecks, and
improvement opportunities over time.

## Core Goal

Improve the effectiveness of the hybrid team by making it easier to:

- improve efficiency
- improve quality
- reduce friction
- expose the worst bottlenecks
- identify low-hanging fruit
- evolve the code and workflows so bottlenecks disappear or move
- increase throughput
- increase human-and-AI synergy

## Management Questions

The dashboard should help answer:

- are we getting faster or slower
- are we getting better or sloppier
- where is the drag right now
- which bottlenecks are trending worse over time
- which skills and sub-agents are genuinely helping
- which workflows are expensive relative to their value
- where should we focus next for the highest return

## Core Principles

- trends matter more than point-in-time snapshots
- bottlenecks matter more than activity counts
- insights should be traceable back to real events
- every metric should be tied to a decision someone could make
- low-hanging fruit should be surfaced, not buried
- human and agent work should be visible in one operating model

## Primary Views

### 1. Overview

Purpose:

- answer "where should we look first?"

Core panels:

- flow health
- quality health
- team efficiency
- improvement signal

Suggested top metrics:

- throughput
- cycle time
- blocked work count
- validation failure rate
- human review load
- token spend
- recurring retro themes
- top bottleneck by delay caused

### 2. Trends

Purpose:

- show whether conditions are improving, stable, or degrading

Suggested time windows:

- trailing 7 days
- trailing 30 days
- trailing 90 days
- trailing 12 weeks
- trailing 6 months where volume supports it

Suggested trend lines:

- throughput over time
- cycle time over time
- blocked work by category over time
- token cost over time
- human review effort over time
- validation failure categories over time
- reopen or rework rate over time
- UI iteration count over time

### 3. Bottlenecks

Purpose:

- highlight where the system is losing the most time or quality

Suggested bottleneck categories:

- planning
- validation
- human gates
- environment or tooling
- UI iteration
- observability gaps
- workflow design
- skill or sub-agent weakness

For each bottleneck, show:

- frequency
- average delay caused
- trend
- affected repos
- likely root cause
- recommended next action

### 4. Agents And Skills

Purpose:

- evaluate the effectiveness of sub-agents, skills, and workflows over time

Tracked entities:

- sub-agents
- skills
- workflows

Suggested metrics:

- invocation count
- success rate
- average turns per use
- average token cost
- human correction rate
- rework rate after use
- downstream acceptance rate
- estimated time saved
- repo-specific performance differences

### 5. Repo View

Purpose:

- show how a specific consumer repo is performing and where it needs help

Suggested repo panels:

- active backlog by epic or workflow
- throughput trend
- top open bottlenecks
- top recurring retro themes
- NFR health
- observability maturity
- UI quality trend
- most-used skills and sub-agents
- highest human-correction areas

### 6. Improvements

Purpose:

- convert analytics into action

Each improvement candidate should include:

- title
- category
- impact estimate
- effort estimate
- confidence
- evidence source
- trend reference
- owner
- status

Suggested ranking views:

- highest impact / lowest effort
- fastest worsening bottlenecks
- highest-cost weak skills
- most repeated friction

## Event Model

The dashboard should be built on explicit events rather than inferred narrative.

### Work Unit

A unit of delivery or review, such as:

- feature
- bug fix
- refactor
- audit
- review
- rollout
- retro follow-up

### Actor

Who or what performed meaningful work:

- human
- primary agent
- sub-agent
- skill
- workflow
- pipeline automation

### Event

Meaningful moments in a work unit lifecycle, such as:

- planned
- started
- blocked
- resumed
- validated
- failed
- approved
- deferred
- pushed
- reopened
- promoted

### Cost

Costs attached to the event or work unit:

- elapsed time
- token usage
- human review time
- pipeline duration
- infrastructure cost where practical

### Outcome

Meaningful result states:

- accepted
- reworked
- failed
- regressed
- promoted
- abandoned

### Signal

Improvement-oriented signals:

- retro finding
- bottleneck observation
- NFR miss
- observability gap
- repeated human correction
- low-hanging-fruit candidate

## Suggested MVP Metrics

Start with a small number of high-signal metrics.

Recommended MVP set:

1. throughput by week
2. cycle time by week
3. blocked work by category
4. validation failure rate
5. human review load
6. token spend
7. top recurring retro themes
8. skill effectiveness leaderboard
9. top bottlenecks by delay caused
10. low-hanging-fruit matrix

## Skill And Sub-Agent Scoring

Skills and sub-agents should not be judged by invocation count alone.

Suggested evaluation dimensions:

- usefulness
- cost
- reliability
- correction burden
- downstream quality effect
- repo fit

Possible composite score inputs:

- success rate
- average correction after use
- average token cost
- average time saved
- rework rate
- acceptance or promotion rate

The goal is not to rank for ego. The goal is to see which capabilities are
worth strengthening, retiring, or promoting.

## Low-Hanging Fruit Model

The dashboard should explicitly surface low-hanging fruit.

Candidate signals include:

- repeated friction with rising trend
- high delay and low fix complexity
- expensive workflows with weak outcomes
- observability gaps that block diagnosis
- repeated UI corrections that suggest a missing pattern
- repeated human gates caused by unclear preparation rather than true risk

Recommended scoring inputs:

- frequency
- delay caused
- impact if fixed
- implementation effort
- confidence

## Observability Requirement

The dashboard depends on observability that is good enough to expose real
behavior without drowning the system in noise.

Required stance:

- instrument meaningful boundaries
- prefer stable event shapes
- keep logging and tracing proportional to diagnostic value
- avoid instrumentation that creates more confusion than insight

The dashboard should help reveal where observability is missing, weak, or too
noisy.

## Visualizations

Recommended visualization types:

- line charts for trends
- stacked bars for category composition over time
- heatmaps for repo or skill hotspots
- ranked tables for bottlenecks and improvement candidates
- scatter or quadrant views for impact versus effort
- sparklines for compact trend context

Avoid:

- charts that cannot drive a decision
- overly dense dashboards that hide the top problems
- metrics without clear ownership or interpretation

## Phased Rollout

### Phase 1: Event Model

- define the event schema
- identify the first event producers
- capture enough data to support trend and bottleneck views

### Phase 2: MVP Dashboard

- build overview
- build trends
- build bottlenecks

### Phase 3: Capability Analytics

- add agents and skills view
- add repo-specific views
- add low-hanging-fruit prioritization

### Phase 4: Improvement Loop

- connect signals directly into the backlog
- track whether improvements reduce the targeted bottlenecks over time

## Likely Future Assets

- `assets/quality/dashboard-metrics-framework.md`
- `assets/quality/event-model-guidance.md`
- `assets/workflows/improvement-signal-triage.md`

## Likely Future Skills

- `dashboard-signal-audit`
- `bottleneck-triage`
- `skill-effectiveness-audit`
- `low-hanging-fruit-prioritization`

## Done Criteria

This planning layer is ready to execute when:

- the event model is explicit
- the first dashboard views are defined
- skills and sub-agents can be measured over time
- bottlenecks and low-hanging fruit can be surfaced directly
- trends can be read across meaningful time windows
