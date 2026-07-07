# AI Native

This repo is the central standards, workflows, skills, and governance layer for
our hybrid human-and-agent development model.

Work should happen in product repos. This repo exists to improve how those repos
work over time.

## Quick Start

### What This Repo Is For

Use this repo to:

- define or refine shared standards
- add or improve shared workflows and skills
- plan cross-repo improvements
- capture lessons from product repos such as `Interest Lens`

Do not treat this repo as the place where normal product feature work happens.

### What To Read First

1. [`agents.md`](./agents.md)
2. [`assets/repo-rules/ai-native-core-operating-rules.md`](./assets/repo-rules/ai-native-core-operating-rules.md)
3. [`assets/workflows/goal-and-plan-mode.md`](./assets/workflows/goal-and-plan-mode.md)
4. [`assets/quality/engineering-quality.md`](./assets/quality/engineering-quality.md)

That is the minimum shared operating surface.

### Human Workflow

1. Start with a clear goal.
2. Decide whether the work belongs here or in a consumer repo.
3. If the work is large, risky, or cross-cutting, plan first.
4. Change the narrowest shared asset, workflow, skill, or planning artifact
   that solves the problem.
5. Validate the change.
6. Capture friction or follow-up opportunities if the system made the work
   harder than it should have been.

### Where Things Live

- [`signals/`](./signals/): monitored sources and evidence inputs
- [`decisions/`](./decisions/): what we believe and why
- [`assets/`](./assets/): shared reusable standards, workflows, and guidance
- [`pilots/`](./pilots/): proving-ground adoption work with consumer repos
- [`reviews/`](./reviews/): human review queue and approval surfaces
- [`prompts/`](./prompts/): seed prompts and prompt source material
- [`planning/`](./planning/): architecture, governance, dashboard, and future-state planning
- [`.agents/skills/`](./.agents/skills/): repo-local skills for sub-agents

## Prerequisites

You only need a few basics to work effectively here:

- `git`
- `node` and `npm`
- `docker compose` if you want to run the showcase app with MySQL

## Useful Commands

### Verify The Repo

```bash
npm test
npm run build
```

### Run The Studio Locally

In-memory mode:

```bash
DB_MODE=memory npm start
```

Then open `http://localhost:3000`.

### Run The Studio With Docker

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

### Install Shared Assets Into Interest Lens

```bash
npm run install:interest-lens
node scripts/seed-interest-lens-onboarding.js
```

## How This Repo Relates To Product Repos

`AI Native` is the hub. Product repos are the spokes.

- product work happens in product repos
- shared learnings come back here
- shared assets evolve here
- updated assets are adopted back into product repos

`Interest Lens` is the first proving ground for this loop.

## Glossary

- `asset`: a reusable shared standard, workflow, rule, prompt, or framework
- `consumer repo`: a product repo that adopts shared AI Native assets
- `goal`: the concrete outcome a unit of work is trying to achieve
- `plan mode`: explicit planning before implementation for larger or riskier work
- `skill`: a narrow reusable technique used by agents or sub-agents
- `workflow`: the sequence and gates for a recurring type of work
- `retro`: a short review of what caused unnecessary friction and what should improve
- `hybrid team`: the combined human-and-agent delivery system

Keep this glossary small. Add terms only when a new word becomes important to
working effectively in the repo.
