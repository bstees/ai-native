# AI Native

A shared engineering system for AI-assisted software delivery: reusable agent workflows,
quality contracts, governance controls, and evidence that helps humans decide what to ship.

Created by [Brent Stees](https://brentstees.com), AI Native treats developer tooling as
an internal product. Product work stays in consumer repositories; shared standards,
validation, and lessons return here.

## Start Here: Capabilities and Evidence

- **Repeatable delivery:** [task contracts](assets/workflows/task-contract.md) and
  [independent verification](assets/workflows/independent-verification.md) separate
  intended outcomes from implementation claims.
- **Bounded agent work:** [orchestration contracts and routing](assets/agent-orchestration/README.md)
  define reusable roles and provider adapters.
- **Governance:** [risk and data-handling controls](assets/governance/README.md)
  describe authority, escalation, and human review boundaries.
- **Instruction evaluation:** the [recorded pilot assessment](assets/instruction-evaluation/pilot/runs/2026-07-31T14-15-28-553Z/assessment.md)
  compares two instruction variants. Both missed an expected behavior; the assessment
  recommends more trials rather than claiming an improvement from a small sample.
- **Specification-derived verification:** the [runtime pilot report](experiments/november-13-node-runtime-pilot/pilot-report.json)
  and [evidence bundle](experiments/november-13-node-runtime-pilot/task-evidence-bundle.json)
  record one fail-before/pass-after criterion and two unmet requirements in a historical
  patch. This is evidence of finding an incomplete fix, not a claim that every gate passed.

**Status:** an evolving engineering toolkit and Studio app, with executable tests and
recorded pilots. These artifacts do not establish organization-wide adoption,
production reliability, or a statistically reliable productivity improvement.

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
- [`assets/agent-orchestration/`](./assets/agent-orchestration/): portable
  sub-agent profiles, context policy, routing, and provider adapters
- [`assets/governance/`](./assets/governance/): AI usage, data-handling, risk,
  escalation, exception, and adoption controls
- [`assets/instruction-evaluation/`](./assets/instruction-evaluation/): cases,
  run contracts, and comparison guidance for AI-facing Markdown
- [`pilots/`](./pilots/): proving-ground adoption work with consumer repos
- [`reviews/`](./reviews/): human review queue and approval surfaces
- [`prompts/`](./prompts/): seed prompts and prompt source material
- [`planning/`](./planning/): architecture, governance, dashboard, and future-state planning
- [`.agents/skills/`](./.agents/skills/): repo-local skills for sub-agents

## Prerequisites

You only need a few basics to work effectively here:

- `git`
- `node` and `npm`; use `nvm use` to select the version in `.nvmrc`
- `docker compose` if you want to run the showcase app with MySQL

## Useful Commands

### Verify The Repo

Install the locked dependencies first with `npm ci`.

```bash
npm test
npm run build
npm run eval:instructions
```

[CI](../../actions/workflows/ci.yml) runs these deterministic checks on pull requests
and pushes to `main`. It does not run paid model pilots, deploy the app, or certify
production readiness.

### Query Existing Repo Surfaces

Use the local surface index before broad exploration when looking for an
existing exported contract, component, route, command, schema, or canonical
guidance section:

```bash
npm run query:repo -- "agent profile contract"
```

The first query bootstraps a deterministic index and later queries refresh it
when public surfaces change. The generated cache stays inside Git's private
metadata (or `.ai-native/cache/` before Git is initialized) and contains
signatures and concise navigation summaries, not implementation bodies.
Candidate discovery honors Git ignore rules—even for legacy tracked paths—and
excludes conventional dependency, vendor, generated, test, and build trees so
results stay focused on first-party repo surfaces.

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

### Sync Shared Assets Into A Consumer Repo

```bash
npm run sync -- /absolute/path/to/consumer-repo
npm run seed:onboarding -- /absolute/path/to/consumer-repo --repo-name "Consumer Repo"
```

`sync` triages the target automatically:

- missing `.ai-native/`: install the managed shared assets
- drifted managed assets: update them and remove stale previously managed files
- already current: report that the repo is already up to date

Sync state records a calver release in `.ai-native/.sync-state.json`. The current shared asset version is `26.08.0`, following `YY.MM.patch`, where the last number increments for additional releases in the same month.

The first successful sync on a new or previously synced consumer also builds a
Git-private repository surface index and records the versioned bootstrap in the
same state file. Later syncs check that marker and skip indexing entirely, even
when shared assets change. A failed bootstrap remains pending for the next sync;
normal index queries still refresh stale surface contracts on demand.

Consumer installation has two simple ownership layers:

- `AI Native` is the `source` repo for standards
- `.ai-native/` is a local consumer overlay refreshed from the source
- the consumer repo owns its normal instruction files and may either replace
  them with AI Native-managed entry points or keep them with one AI Native
  reference line
- `sync` should be run against consumer repos, not the `AI Native` source repo

Sync ensures one ignore rule—even when it runs before `git init`—and does not
selectively expose files beneath it:

```gitignore
.ai-native/
```

Choose one instruction path when a custom instruction file already exists:

```bash
npm run sync -- /absolute/path/to/consumer-repo --instructions-mode=replace
npm run sync -- /absolute/path/to/consumer-repo --instructions-mode=keep
```

- `replace` preserves custom instruction files as unique `*-old.md` files,
  installs an AI Native-managed `AGENTS.md`, and creates supported symlinks
- `keep` preserves the existing `AGENTS.md`, adds one managed reference line,
  preserves custom tool instructions, and removes legacy AI Native symlinks

Repos seeded by an older release may still track `.ai-native/`. The next sync
detects that state. Interactive runs ask before removing those paths from the
Git index while keeping the local files; non-interactive runs require
`--migrate-tracked-assets` or `--yes`. This creates a one-time staged deletion
for the consumer repo to review and commit.

Use `--dry-run` with `sync` to preview what would be created, updated, or removed.

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

## Dependency Security

See the [dependency security review](docs/dependency-security.md) for the current
picomatch development-tool advisory, production-only audit result, and explicit
limitations. CI preserves the full dependency audit, not just production results.
