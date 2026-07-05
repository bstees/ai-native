# Governance Layers And NFR Framework

## Purpose

Define the next governance layers that AI Native should support across consumer
repositories, with explicit treatment of non-functional requirements, platform
choices, delivery automation, and tool-selection decisions.

This plan exists because projects often fail when important non-functional
requirements remain implicit, unevenly enforced, or too expensive to validate
in practice.

## Core Position

Every consumer repo should have an explicit non-functional profile.

AI Native should provide:

- a shared framework for thinking about the right requirements
- guidance for where each requirement should live
- skills and workflows that help agents validate them efficiently
- evolution loops that keep the framework current as tools and constraints
  change

## Governance Layers

### 1. Architecture Governance

Purpose:

- encourage consistent, efficient design choices without turning patterns into
  rigid dogma

What belongs here:

- preferred design patterns by stack and problem type
- criteria for when deviation is justified
- consistency guidance for composition, modularity, and component reuse

Planned asset direction:

- `assets/architecture/design-pattern-guidance.md`

Planned skill direction:

- `pattern-fit-audit`

### 2. Non-Functional Definition Of Done

Purpose:

- make non-functional requirements explicit enough to shape design, validation,
  and release decisions

Shared framework categories should include:

- performance
- reliability
- availability
- security
- privacy
- accessibility
- maintainability
- operability
- observability
- scalability
- portability
- cost efficiency
- token efficiency
- human-operational efficiency

Each consumer repo should define:

- which NFRs are critical
- the minimum acceptable bar for each
- how each is validated
- whether failure against that NFR blocks completion

Planned asset direction:

- `assets/quality/non-functional-requirements-framework.md`
- repo-local `nfr-profile.md`

Planned skill direction:

- `nfr-audit`

### 3. Platform And IaC Governance

Purpose:

- make infrastructure and hosting choices explicit, reviewable, and aligned
  with a repo's NFR profile

Decision areas should include:

- cloud target: AWS, Cloudflare, hybrid, or other
- runtime style: serverless, container, VM, edge, or managed platform
- IaC approach: Terraform, provider-native tooling, Pulumi, or another justified
  model
- operational shape: single-service, event-driven, scheduled, stateful,
  multi-region, and similar concerns

Decision drivers should include:

- latency
- cost
- compliance
- portability
- observability
- operational complexity
- reliability
- AI-agent operability

Planned asset direction:

- `assets/infrastructure/infrastructure-decision-framework.md`

Planned skill direction:

- `platform-fit-audit`

### 4. Delivery Automation Governance

Purpose:

- define how CI/CD and AI-assisted automation should support quality without
  weakening human gates or validation integrity

Decision areas should include:

- what AI may automate directly
- what AI may recommend but not execute
- what evidence AI must provide to clear a gate
- which validations happen locally, in CI, during rollout, and after release

Planned asset direction:

- `assets/workflows/delivery-automation-standard.md`

Planned skill direction:

- `pipeline-audit`
- future helpers such as `ci-triage` and `release-risk-review`

### 5. Tooling Governance

Purpose:

- continually reassess the best way for agents to interact with systems as MCP
  offerings, CLI tools, and platform capabilities evolve

Decision areas should include:

- MCP versus CLI
- token efficiency
- output structure and reliability
- auth friction
- observability and failure clarity
- maintenance burden
- reproducibility

Planned asset direction:

- `assets/tooling/tool-selection-framework.md`

Planned skill direction:

- `mcp-cli-audit`

## Observability As A Universal Requirement

Observability should be treated as a requirement for every meaningful system,
not an optional improvement category.

The goal is not "log everything." The goal is to create feedback surfaces that
allow humans and AI to understand system behavior, state transitions, failures,
and timing with minimal ambiguity.

This should be approached as if we are building our own best-possible feedback
layer for agentic debugging and validation.

### Why It Is Universal

- AI agents work better when behavior is inspectable rather than inferred
- human debugging cost drops when important events are visible and correlated
- operational quality depends on seeing failures, latency, retries, and state
  changes clearly
- many other NFRs become impossible to validate consistently without adequate
  observability

### What Must Be Observable

At minimum, meaningful systems should expose enough signal to understand:

- important state transitions
- request or job lifecycles
- failures and retry behavior
- user-visible degradation
- external dependency behavior
- deployment or rollout effects
- critical business or workflow events where correctness matters

### Smart-Logging Rule

Observability must be designed, not sprayed across the codebase.

The system should avoid:

- noisy logging with no clear consumer
- repeated logs that add token cost but little insight
- sensitive or high-risk data leakage
- instrumentation that materially bloats code or obscures responsibility

Instead, prefer:

- event-level instrumentation at meaningful boundaries
- stable log or event shapes
- correlation identifiers where they materially improve diagnosis
- metrics or traces where logs are too verbose or low-signal
- log levels that reflect real operational value

### Observability Decision Questions

Before adding instrumentation, ask:

- what decision or diagnosis will this help with
- who or what is expected to consume this signal
- should this be a log, metric, trace, event, or test artifact instead
- what is the token, noise, and maintenance cost of this signal
- does the signal belong at this layer, or at a higher-value boundary

### Planned Asset Direction

- observability should be embedded in the shared NFR framework
- platform and pipeline decisions should be judged partly by observability fit
- future dedicated guidance should likely live in:
  `assets/quality/observability-standard.md`

### Planned Skill Direction

- `observability-fit-audit`
- future `instrumentation-retro`

## Cost Awareness Rule

NFR enforcement is not free.

AI Native should explicitly recognize the cost of stronger governance in:

- token usage
- human review time
- repo size
- pipeline duration
- infrastructure cost
- maintenance burden

The answer is not to ignore NFRs. The answer is to make their cost visible and
to choose validation and instrumentation patterns that are proportionate to the
actual risk.

## Recommended Rollout Order

1. shared NFR framework
2. observability standard
3. tool-selection framework
4. infrastructure decision framework
5. delivery automation standard
6. design-pattern guidance

Reasoning:

- NFRs define what matters
- observability strengthens every later governance layer
- tooling and infrastructure should be judged against explicit NFRs
- delivery automation should enforce what the earlier layers define
- pattern guidance becomes more useful once broader constraints are explicit

## Consumer Repo Adoption Model

Each consumer repo should eventually have:

- repo-local `agents.md` or equivalent adapter setup
- repo-local `nfr-profile.md`
- repo-local feedback markdown
- shared AI Native standards installed or referenced
- explicit decisions for platform, delivery automation, and major tool choices

The goal is not to make every repo identical. The goal is to make important
tradeoffs explicit, reviewable, and improvable.

## Done Criteria

This planning layer is ready to execute when:

- shared NFR assets are created
- observability is treated as mandatory, not optional
- tooling and infrastructure decisions have explicit review criteria
- consumer repos have a path to define their own NFR profile
- governance costs are acknowledged rather than hidden
