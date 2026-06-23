Agentic Seeding Prompt

# Seed: Agentic Development Repository

**Category:** Prompt
**Applies to:** New agentic-development repo setup
**Tools:** Any
**Author:** your-team
**Last updated:** 2026-06-10

---

## Purpose

Use this prompt to generate the complete `agentic-development` repository from scratch in a single AI session. It captures a full Level 3 Agentic Development infrastructure: folder structure, every file's content, contributing guidelines, CI integration, and the sync mechanism. Give this to an AI agent with filesystem write access and it will produce an immediately usable repo that is identical in structure and intent to the one you are reading now.

---

## Prompt

```
You are going to build a complete GitLab repository called `agentic-development` for a company called `[YourCompany]`.
This is `[YourCompany]`'s central source of truth for AI-assisted (Level 3 Agentic) development infrastructure.

Read this entire prompt before writing a single file. Plan the complete file tree first, then create every file.

---

## PHILOSOPHY

**Centralise without forcing.** Files from this repo are distributed to consuming repos under `.ai-standards/` — a dedicated namespace that never overwrites existing AI config files. Teams opt in at their own pace.

**One source, many adapters.** Shared content (rules, guardrails, standards) is written once in tool-agnostic Markdown. Tool-specific folders contain thin adapters in the format each tool expects.

**Validation is non-negotiable at Level 3.** The `validation/` folder is a first-class framework covering output quality, autonomy boundaries, and human approval gates. All agent definitions must reference it.

**Agentic Maturity Levels:**
- L1 — AI as autocomplete (suggestions only)
- L2 — AI as pair programmer (AI drafts, human reviews)
- L3 — AI as autonomous agent (multi-step tasks with human gates) ← THIS REPO TARGETS L3
- L4 — AI as orchestrator (agents coordinate agents)

---

## COMPLETE FILE TREE TO CREATE

```
agentic-development/
├── README.md
├── CONTRIBUTING.md
├── ci/
│   └── ai-standards.gitlab-ci.yml
├── definition-of-done/
│   ├── README.md
│   ├── api-endpoint.md
│   ├── bug-fix.md
│   ├── feature.md
│   └── infrastructure.md
├── guardrails/
│   ├── README.md
│   ├── cost-controls.md
│   ├── data-privacy.md
│   ├── destructive-operations.md
│   └── security.md
├── how-to/
│   ├── README.md
│   └── cline-company-model-setup.md
├── mcp/
│   ├── README.md
│   ├── repo/
│   │   └── mcp-settings.template.jsonc
│   ├── user/
│   │   ├── mcp-settings.jsonc
│   │   └── mcp-settings.reporting.jsonc
│   └── workspace/
│       ├── mcp-settings.backend.jsonc
│       ├── mcp-settings.data.jsonc
│       └── mcp-settings.frontend.jsonc
├── prompts/
│   ├── README.md
│   ├── code-review/
│   │   └── self-review.md
│   ├── debugging/
│   │   └── systematic-debug.md
│   ├── documentation/
│   │   └── generate-readme.md
│   ├── general/
│   │   └── explain-codebase.md
│   └── scaffolding/
│       └── new-feature.md
├── rules/
│   ├── README.md
│   ├── cline/
│   │   └── org-core.clinerules
│   ├── cursor/
│   │   ├── agent-requested/
│   │   │   └── validation-checklist.mdc
│   │   ├── always-on/
│   │   │   └── org-core.mdc
│   │   └── auto-attached/
│   │       └── typescript.mdc
│   ├── shared/
│   │   ├── coding-standards.md
│   │   ├── git-conventions.md
│   │   └── security-guardrails.md
│   └── windsurf/
│       └── org-core.windsurfrules
├── sync/
│   ├── manifest.yml
│   └── sync.sh
└── validation/
    ├── README.md
    ├── 1-output-quality/
    │   └── checklists/
    │       └── code-output.md
    ├── 2-autonomy-boundaries/
    │   └── risk-tier-model.md
    ├── 3-human-gates/
    │   └── agent-pause-points.md
    └── policy/
        └── validation-policy.md
```

---

## FILE CONTENTS

Create each file below with exactly this content.

---

### README.md

```markdown
# [YourCompany] Agentic Development

> **The central source of truth for [YourCompany]'s AI-assisted development infrastructure.**

This repository centralizes, normalizes, and promotes company-wide contribution to [YourCompany]'s Level 3 Agentic Development capabilities. Instead of every team maintaining AI configurations in isolation, this repo provides shared, validated, reusable artifacts that any team can adopt — without disrupting existing setups.

---

## What's in Here

| Folder | Purpose |
|---|---|
| [`mcp/`](./mcp/) | MCP server configurations at user, workspace, and repo levels |
| [`rules/`](./rules/) | AI agent behavior rules for Cursor, Cline, Windsurf, and more |
| [`prompts/`](./prompts/) | Reusable prompt library for scaffolding, review, debugging, docs |
| [`definition-of-done/`](./definition-of-done/) | DoD templates by work item type |
| [`guardrails/`](./guardrails/) | What AI agents must NOT do — hard limits and boundaries |
| [`validation/`](./validation/) | The trust layer: output quality, autonomy boundaries, human gates |
| [`sync/`](./sync/) | Opt-in CI mechanism to distribute artifacts to consuming repos |

---

## Philosophy

**Centralize without forcing.** Files from this repo are distributed into consuming repos under `.ai-standards/` — a dedicated namespace that never overwrites existing AI configuration files. Teams opt in at their own pace.

**One source, many adapters.** Shared content (rules, guardrails, standards) is written once in tool-agnostic Markdown. Tool-specific folders contain thin adapters in the format each tool expects (Cursor `.mdc`, Cline `.clinerules`, Windsurf rules blocks).

**Validation is non-negotiable at Level 3.** The `validation/` folder is a first-class framework covering output quality, autonomy boundaries, and human approval gates. All agent definitions must reference it.

---

## Quick Start — Consuming This Repo

### Option 1: Browse and copy manually
Browse any folder, find artifacts relevant to your team, and copy them into your repo.

### Option 2: Opt-in CI sync (recommended)
Add the following to your repo's `.gitlab-ci.yml` to receive automatic updates into `.ai-standards/`:

```yaml
include:
  - project: 'your-org/ai/agentic-development'
    ref: main
    file: 'ci/ai-standards.gitlab-ci.yml'
```

See [`sync/README.md`](./sync/README.md) for full opt-in instructions.

---

## Quick Start — Contributing

1. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md)
2. Find the right folder for your artifact
3. Follow the folder's `README.md` for format/template guidance
4. Open a merge request — CODEOWNERS will route it to the right reviewer

---

## Agentic Maturity Levels

| Level | Description |
|---|---|
| **Level 1** | AI as autocomplete — suggestions only, human writes everything |
| **Level 2** | AI as pair programmer — humans direct, AI drafts, humans review |
| **Level 3** | AI as autonomous agent — agents execute multi-step tasks with human gates |
| **Level 4** | AI as orchestrator — agents coordinate other agents with minimal human oversight |

This repo is the infrastructure backbone for **Level 3**.

---

## Maintainers

See [`.gitlab/CODEOWNERS`](./.gitlab/CODEOWNERS) for ownership by area.

Questions? Open an issue or reach out in `#ai-tools` on Slack (or your team's equivalent channel).
```

---

### CONTRIBUTING.md

```markdown
# Contributing to [YourCompany] Agentic Development

Thank you for contributing! This repo thrives on company-wide input.

---

## Ground Rules

1. **No secrets, ever.** No API keys, passwords, tokens, or internal URLs in any file. Use placeholders like `YOUR_API_KEY_HERE`.
2. **Tool-agnostic first.** Write content in `shared/` or the category folder before creating tool-specific adapters.
3. **Document your assumptions.** If your artifact assumes a specific tech stack or org-specific convention, say so at the top.
4. **Reference validation.** All agent definitions must include a `## Validation` section referencing the appropriate checklists from `validation/`.
5. **Small, focused MRs.** One artifact or tightly related set of artifacts per merge request.

---

## What to Contribute

| You have... | Add it to... |
|---|---|
| A prompt you use regularly | `prompts/` (pick the right subcategory) |
| An AI rule or coding standard | `rules/shared/` + tool adapters |
| A definition of done for a work type | `definition-of-done/` |
| A guardrail or hard limit | `guardrails/` |
| An MCP server config | `mcp/user/`, `mcp/workspace/`, or `mcp/repo/` |
| A repeatable AI skill | `skills/` |
| A multi-step agent workflow | `agents/` |
| A validation checklist or gate | `validation/` |

---

## File Format Conventions

### Prompts, Skills, DoD, Guardrails
Use Markdown. Include these sections at the top:

```markdown
# [Title]

**Category:** [e.g., Prompt / Skill / Guardrail]
**Applies to:** [e.g., All repos / Frontend / Backend / Agent workflows]
**Tools:** [e.g., Cursor, Cline, Windsurf, Any]
**Author:** [GitLab username]
**Last updated:** [YYYY-MM-DD]

## Purpose
## Usage
## [Content sections...]
```

### Agent Definitions
```markdown
# [Agent Name]

**Type:** Reporting Agent | Development Agent | Review Agent
**MCPs Required:** [list]
**Autonomy Tier:** 0–3
**Human Gates:** [describe where human approval is required]

## Goal
## Trigger
## Prerequisites
## Workflow Steps
## Output Format
## Validation
## Error Handling / Escalation
```

### Rules (shared/)
Plain Markdown. Tool-specific adapters reference or reformat shared content — keep adapters thin.

### MCP Configs
JSONC (JSON with inline `//` comments — strip before use in strict JSON parsers).

---

## Merge Request Process

1. Create a branch: `feat/add-[artifact-name]` or `fix/update-[artifact-name]`
2. Add your artifact in the correct folder
3. Update the folder's `README.md` if adding a new file
4. Open an MR: clear title + description explaining what it does and why
5. CODEOWNERS will automatically assign reviewers

---

## Review Criteria

- [ ] No secrets or internal credentials
- [ ] Correct folder and format
- [ ] Agent definitions include Autonomy Tier and Human Gates
- [ ] Validation section references appropriate checklists
- [ ] Placeholders used for environment-specific values
- [ ] Content is genuinely reusable across teams
```

---

### rules/shared/coding-standards.md

```markdown
# Coding Standards

**Category:** Rule — Shared Source
**Applies to:** All repos, all languages
**Last updated:** 2026-06-09

---

## Purpose

These standards define how AI agents should write and modify code across all repositories in your organisation.

---

## General Principles

- **Clarity over cleverness.** Write code a mid-level engineer can understand without reading the surrounding context.
- **Minimal footprint.** Make the smallest change necessary. Don't refactor unrelated code unless explicitly asked.
- **No silent failures.** Always handle errors explicitly. Never swallow exceptions or return `null`/`undefined` without documenting why.
- **Consistent naming.** Follow naming conventions already established in the file or module.

---

## Code Quality Rules

### Functions and Methods
- Functions do one thing. If you write "and" to describe it, split it.
- Keep functions under 40 lines.
- Max 3 parameters — use an options object if more are needed.
- Always specify return types in typed languages.

### Error Handling
- Catch specific error types, not generic `Exception`/`Error` unless intentional.
- Log errors with context: what was attempted, what failed, relevant IDs.
- Never expose internal error details to API consumers.

### Asynchronous Code
- Always `await` or `.then()` Promises — no fire-and-forget unless intentional.
- Handle `Promise.all` rejections — use `Promise.allSettled` for partial failures.
- Add timeouts to all external network calls.

### Comments
- Comment *why*, not *what*.
- Remove commented-out code before committing.
- Mark technical debt with `// TODO(username): description`.

---

## Language-Specific Standards

### TypeScript / JavaScript
- Prefer `const` over `let`; never use `var`.
- Use `===` for equality checks.
- Prefer `async/await` over raw Promises.
- TypeScript strict mode. Avoid `any` — use `unknown` and narrow the type.
- Prefer named exports over default exports.

### Python
- Follow PEP 8. Use `black` for formatting.
- Type hints on all public functions.
- Prefer `pathlib` over `os.path`.
- Use `dataclasses` or `pydantic` for structured data.

### General (all languages)
- No magic numbers — define named constants.
- No hardcoded URLs, credentials, or environment-specific values.
- All public APIs must have docstrings/JSDoc.

---

## Testing Requirements

- Write or update tests for every change that modifies behavior.
- Unit tests: happy path, edge cases, error cases.
- Don't mock what you don't own.
- Test names describe the scenario: `it('returns 404 when user does not exist')`.
- Minimum coverage: **80%** on new code.

---

## What AI Must NOT Do

- ❌ Remove existing tests to make coverage thresholds pass
- ❌ Suppress linting errors with inline disable comments without explanation
- ❌ Add dependencies without checking if an equivalent already exists
- ❌ Refactor code outside the scope of the current task
- ❌ Write `console.log` / `print` debug statements in committed code
- ❌ Introduce breaking changes to public APIs without flagging them
```

---

### rules/shared/git-conventions.md

```markdown
# Git Conventions

**Category:** Rule — Shared Source
**Applies to:** All repos
**Last updated:** 2026-06-09

---

## Purpose

Consistent git hygiene makes code reviews faster and automated tooling reliable. AI agents must follow these conventions.

---

## Branch Naming

Format: `<type>/<short-description>`

| Type | When to use |
|---|---|
| `feat/` | New feature or capability |
| `fix/` | Bug fix |
| `chore/` | Maintenance, dependency updates, tooling |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behavior change |
| `test/` | Adding or improving tests |
| `hotfix/` | Urgent fix for production |

Rules: lowercase and hyphens, no underscores or spaces, 3–5 words max, never commit to `main`/`master`.

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body — explain WHY]

[optional footer — Refs: TICKET-1234 / Closes #42 / BREAKING CHANGE: ...]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`

Rules: max 72 chars subject, imperative mood, body explains why not what.

---

## Merge Requests

- Title matches primary commit message format
- Description must include: what changed, why, how to test, screenshots for UI changes
- Assign at least one reviewer
- Do not merge your own MR without approval (except trivial doc fixes)

---

## What AI Must NOT Do

- ❌ Create branches with generic names like `fix-bug` or `ai-changes`
- ❌ Write commit messages like "fix stuff", "WIP", or "changes"
- ❌ Commit directly to protected branches
- ❌ Include multiple unrelated changes in a single commit
- ❌ Leave merge conflict markers in committed code
- ❌ Force-push to shared branches
```

---

### rules/shared/security-guardrails.md

```markdown
# Security Guardrails

**Category:** Rule — Shared Source
**Applies to:** All repos, all AI actions
**Last updated:** 2026-06-09

---

## Credential and Secret Rules

- **Never write secrets into code.** No API keys, passwords, tokens, certificates, or private keys in any file.
- **Never log secrets.**
- **Use environment variables** for all configuration that varies by environment.
- **Detect hardcoded secrets** — flag them: `// SECURITY: hardcoded secret — move to env var`.
- **Never commit `.env` files.**

---

## Input Validation Rules

- Validate all inputs at the boundary.
- Use allowlists, not denylists where possible.
- Use parameterized queries for SQL — never string concatenation.
- Reject unexpected fields in API request bodies.

---

## Auth / Authorization Rules

- Never bypass auth checks.
- Check authorization at every layer.
- Use least privilege — request only needed permissions/scopes.
- Do not cache auth tokens in localStorage or non-secure cookies.

---

## Dependency Rules

- Don't add dependencies without necessity check.
- Prefer well-maintained, widely-used packages.
- Check for known vulnerabilities: `npm audit` / `pip-audit` / `trivy`.
- Pin versions in production.

---

## What AI Must NOT Do

- ❌ Write, suggest, or accept secrets embedded in code or config files
- ❌ Generate code that disables security features (TLS, CSRF, auth middleware)
- ❌ Write SQL with string concatenation for user-provided values
- ❌ Add packages from unofficial or unverified sources
- ❌ Write code that exfiltrates data to external endpoints not already used by the project
```

---

### rules/cline/org-core.clinerules

```
# Org Core Rules — Cline Adapter
# HOW TO USE: Copy to your repo root as `.clinerules`
# Source of truth: rules/shared/ in the agentic-development repo.

## Identity
You are working in a [YourCompany] engineering repository. Apply all rules below in every interaction.

## Coding Standards
- Write clear, readable code — a mid-level engineer should understand it without context.
- Make the SMALLEST change needed. Do not refactor code outside the task scope.
- Handle ALL errors explicitly. Never swallow exceptions silently.
- Functions do one thing. Under 40 lines. Max 3 parameters.
- No magic numbers. No hardcoded credentials, URLs, or env-specific values.
- All public APIs must have docstrings / JSDoc.
- No console.log / print statements in committed code.
- TypeScript: const > let, never var. Strict mode. No `any`. Named exports.
- Python: PEP 8, black, type hints on public functions, pathlib over os.path.

## Git Conventions
- Branches: `<type>/<short-description>` (feat/, fix/, chore/, docs/, refactor/, test/, hotfix/)
- Commits: Conventional Commits — `<type>(<scope>): <description>`
- Never commit to main/master directly. Never force-push to shared branches.

## Security — NEVER do these
- Write secrets, API keys, tokens, or passwords in any file
- Use eval(), exec(), Function() with user input
- Use string concatenation in SQL queries
- Disable TLS verification, CSRF protection, or auth middleware
- Expose internal error details to API consumers

Always use environment variables for credentials. Always validate and sanitize inputs.

## Testing
- Write or update tests for every behavioral change.
- Cover: happy path, edge cases, error cases.
- Minimum 80% coverage on new code.
- Never remove tests to pass coverage thresholds.

## Validation
Before completing any coding task, run through the pre-merge checklist:
`.ai-standards/validation/1-output-quality/checklists/code-output.md`

Before any write/mutate operation in production:
`.ai-standards/validation/2-autonomy-boundaries/risk-tier-model.md`
```

---

### rules/cursor/always-on/org-core.mdc

```
---
description: Org core coding standards, git conventions, and security guardrails — always active
alwaysApply: true
---

# Org Core Rules

You are working in a [YourCompany] engineering repository. The following rules are always active.

## Coding Standards
- Write clear, readable code over clever code.
- Make the **smallest change** necessary. Do not refactor code outside the scope of the task.
- Handle all errors explicitly. Never swallow exceptions silently.
- Functions do one thing. Keep them under 40 lines. Max 3 parameters.
- No magic numbers — use named constants.
- No hardcoded URLs, credentials, or environment-specific values.
- All public APIs must have docstrings/JSDoc.
- No `console.log` / `print` debug statements in committed code.

**TypeScript/JS:** `const` over `let`, never `var`. Strict mode. Avoid `any`. Named exports preferred.
**Python:** PEP 8, `black`, type hints on all public functions, `pathlib` over `os.path`.

## Git Conventions
- Branch names: `<type>/<short-description>`
- Commit messages: Conventional Commits — `<type>(<scope>): <description>`
- Never commit to `main` or `master` directly.
- Never force-push to shared branches.

## Security — Non-Negotiable
- **NEVER** write secrets, API keys, tokens, or passwords in any file. Use environment variables.
- **NEVER** use `eval()`, `exec()`, `Function()` with user-controlled input.
- **NEVER** use string concatenation in SQL queries — use parameterized queries.
- **NEVER** disable TLS verification, CSRF protection, or auth middleware.
- Always validate and sanitize inputs at the boundary.
- Flag hardcoded secrets found in existing code with a comment.

## Testing
- Write or update tests for every change that modifies behavior.
- Cover: happy path, edge cases, error cases.
- Minimum 80% coverage on new code.
- Do NOT remove tests to pass coverage thresholds.
```

---

### rules/cursor/auto-attached/typescript.mdc

```
---
description: TypeScript-specific coding standards and patterns
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# TypeScript Standards

## Type Safety
- Use TypeScript strict mode (`"strict": true` in tsconfig).
- Avoid `any` — use `unknown` and narrow with type guards.
- Prefer `type` aliases for unions/intersections; `interface` for extendable object shapes.
- Always specify return types on exported functions.
- Use `readonly` on properties that should not mutate after construction.

## Patterns
- `const` over `let`. Never `var`.
- Use `===` for all equality comparisons.
- Prefer `async/await` over raw Promise chains.
- Named exports — avoid default exports.
- Prefer optional chaining (`?.`) and nullish coalescing (`??`).

## Error Handling
- Use custom error classes extending `Error` for domain errors.
- Always type catch clauses: `catch (err: unknown)` and narrow before use.
- Never swallow errors silently.

## Imports
- Use path aliases (`@/`) configured in tsconfig.
- Group imports: external → internal → types. Separate groups with blank lines.

## React (if applicable)
- Functional components with hooks — no class components in new code.
- Type component props explicitly with an `interface Props` above the component.
- Keep components under 200 lines — extract logic to hooks or sub-components.
```

---

### rules/cursor/agent-requested/validation-checklist.mdc

```
---
description: Pre-merge validation checklist — load when reviewing AI-generated output before committing or opening an MR
alwaysApply: false
---

# Pre-Merge Validation Checklist

## Output Quality Checks

### Code Correctness
- [ ] Logic is correct for the happy path
- [ ] Edge cases are handled (null/undefined, empty arrays, boundary values)
- [ ] Error cases return appropriate responses (not 500s for user errors)
- [ ] No regressions — existing behavior is preserved where not intentionally changed

### Code Quality
- [ ] Functions are focused and under 40 lines
- [ ] No magic numbers — named constants used
- [ ] No debug logging (`console.log`, `print`, etc.)
- [ ] No commented-out code blocks
- [ ] TypeScript: no `any` types introduced

### Security
- [ ] No secrets, credentials, or tokens in any file
- [ ] All user inputs are validated and sanitized
- [ ] SQL uses parameterized queries
- [ ] No `eval()` or dynamic code execution with user input
- [ ] No security feature bypass (TLS, CSRF, auth)

### Testing
- [ ] Tests written or updated for all behavior changes
- [ ] Happy path, edge cases, and error cases covered
- [ ] No tests deleted to make coverage pass
- [ ] Tests are meaningful

### Documentation
- [ ] Public APIs have docstrings/JSDoc
- [ ] Complex logic has explanatory comments (why, not what)
- [ ] README updated if behavior changed significantly

## Autonomy Boundary Check
- [ ] Action falls within the approved autonomy tier for this environment
- [ ] No writes to production without explicit approval
- [ ] No irreversible operations without human gate

## Git / MR Hygiene
- [ ] Branch name follows convention: `<type>/<description>`
- [ ] Commit messages follow Conventional Commits format
- [ ] MR description includes: what changed, why, how to test
- [ ] No unrelated changes bundled in this MR
```

---

### rules/windsurf/org-core.windsurfrules

```
# Org Core Rules — Windsurf Adapter
# HOW TO USE: Copy to your repo root as `.windsurfrules`
# Source of truth: rules/shared/ in the agentic-development repo.

## Identity
You are working in a [YourCompany] engineering repository. The following rules apply to all interactions.

## Coding Standards
- Clarity over cleverness. Write for the mid-level engineer.
- Minimal footprint. Make the smallest change necessary. No unsolicited refactors.
- Explicit error handling always. No silent failures.
- Functions: single responsibility, under 40 lines, max 3 params.
- No magic numbers. No hardcoded credentials or environment-specific values.
- Public APIs must have docstrings / JSDoc.
- No debug logging (console.log, print) in committed code.
- TypeScript: const > let, no var, no any, strict mode, named exports.
- Python: PEP 8, black, type hints, pathlib.

## Git Conventions
- Branch names: `<type>/<kebab-case-description>`
  Types: feat, fix, chore, docs, refactor, test, hotfix
- Commit messages: Conventional Commits `<type>(<scope>): <summary>`
- Never push to main/master. Never force-push shared branches.

## Security Rules — Non-Negotiable
NEVER:
- Embed secrets, keys, tokens in any file — use env vars
- Use eval/exec/Function with user-controlled input
- Concatenate strings into SQL queries — use parameterized queries
- Disable TLS, CSRF, or auth middleware
- Return internal error details to API callers

ALWAYS:
- Validate and sanitize all inputs at the boundary
- Use principle of least privilege
- Flag hardcoded secrets found in existing code

## Testing
- Tests required for every behavioral change.
- Cover: happy path, edge cases, error cases.
- 80% coverage minimum on new code.
- Do NOT remove tests to satisfy coverage thresholds.

## Validation Gates
Pause and confirm with the user before:
- Any write/mutate operation in a production environment
- Any irreversible operation (delete, truncate, drop)
- Any action that crosses system boundaries (e.g., GitLab → ServiceNow)
- Any situation where confidence in the requirement is low
```

---

### guardrails/security.md

```markdown
# Security Guardrails

**Category:** Guardrail — Hard Limit
**Applies to:** All AI actions, all repos, all environments
**Last updated:** 2026-06-09

These limits apply even when explicitly instructed otherwise.

## Absolute Prohibitions

- ❌ Write API keys, passwords, tokens, certificates, or private keys in any file
- ❌ Log, print, serialize, or return credential values in any output
- ❌ Commit `.env` files or any file containing real credentials
- ❌ Use `eval()`, `exec()`, `Function(new ...)`, or equivalent with user-controlled input
- ❌ Use `subprocess`/`child_process` with `shell: true` and user input
- ❌ Construct SQL queries via string concatenation with user input
- ❌ Insert user content into HTML without escaping
- ❌ Bypass, disable, or comment out authentication or authorization middleware
- ❌ Write `if (process.env.NODE_ENV === 'development') skip_auth()` patterns
- ❌ Disable TLS certificate verification (`verify=False`, `rejectUnauthorized: false`)
- ❌ Add packages from unverified, unofficial, or clearly abandoned sources

## Required Behaviors

✅ Always use environment variables for credentials
✅ Always validate and sanitize inputs at the trust boundary
✅ Always flag hardcoded secrets found in existing code
✅ Always use parameterized queries for database access
✅ Always use least-privilege when generating IAM policies

## When a User Asks You to Cross These Lines

Respond with:
> "I can't do that — it would violate our security guardrails ([specific rule]). Here's a compliant alternative: [alternative]."
```

---

### guardrails/data-privacy.md

```markdown
# Data Privacy Guardrails

**Category:** Guardrail — Hard Limit
**Applies to:** All AI actions involving personal or sensitive data
**Last updated:** 2026-06-09

## Absolute Prohibitions

- ❌ Log, print, or return PII (names, emails, SSNs, phone numbers, addresses, IPs) in plain text in logs
- ❌ Store PII in caches, local files, or non-encrypted storage without explicit approval
- ❌ Send PII to third-party services not approved for data processing
- ❌ Include real customer data in test fixtures, seeds, or examples — use anonymized/synthetic data
- ❌ Return more data than requested — never over-fetch PII from databases
- ❌ Expose PII in URL query parameters

## Required Behaviors

✅ Mask or truncate PII in all log output
✅ Use synthetic/anonymized data in all tests and development fixtures
✅ Apply data minimization — return only the fields the caller needs
✅ Use encryption at rest for any PII stored outside of a managed database

## For Reporting Agents

Reporting agents querying ServiceNow or GitLab must:
- Aggregate and anonymize data before surfacing it (e.g., "5 engineers" not names)
- Not cache user-identifiable query results beyond the session
```

---

### guardrails/destructive-operations.md

```markdown
# Destructive Operations Guardrails

**Category:** Guardrail — Hard Limit
**Applies to:** All AI actions involving irreversible changes
**Last updated:** 2026-06-09

## Absolute Prohibitions

- ❌ Execute `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or equivalent without a confirmed human gate
- ❌ Delete cloud resources (S3 buckets, RDS instances, EKS clusters) in production
- ❌ Run `kubectl delete` on production namespaces or stateful workloads
- ❌ Execute `terraform destroy` or `terraform apply` with deletions on production state
- ❌ Delete GitLab repositories, branches, or pipeline artifacts
- ❌ Purge message queues (Kafka, SQS, RabbitMQ) in production
- ❌ Force-push to shared branches

## Required Behaviors Before Any Destructive Action

1. **Pause** — Do not proceed without explicit confirmation
2. **State the impact** — Clearly describe what will be permanently changed or lost
3. **Confirm the environment** — Verify this is not production (or that production changes are intended)
4. **Request explicit confirmation** — "This action is irreversible. Please confirm."
5. **Log the action** — Record what was done, when, and by whose instruction

## Safe Alternatives

| Destructive action | Safe alternative |
|---|---|
| `DROP TABLE` | Rename table first, verify, then drop |
| Delete S3 bucket | Enable versioning + lifecycle rules; archive first |
| `kubectl delete pod` | Drain node gracefully |
| Delete GitLab branch | Archive or tag before deleting |
```

---

### guardrails/cost-controls.md

```markdown
# Cost Controls Guardrails

**Category:** Guardrail — Hard Limit
**Applies to:** AI actions that create, scale, or invoke cloud/API resources
**Last updated:** 2026-06-09

## Absolute Prohibitions

- ❌ Create cloud resources (VMs, RDS instances, EKS node groups) in production without explicit human approval
- ❌ Scale out resources in production autonomously
- ❌ Make API calls in a loop without a hard limit and backoff
- ❌ Leave ephemeral resources running after a task completes

## Required Behaviors

✅ Estimate cost impact before creating any cloud resource
✅ Set explicit limits on all loops that invoke paid APIs
✅ Tag all created resources with `created-by: ai-agent` and `ticket: TICKET-XXXX`
✅ Clean up ephemeral resources at the end of every automated workflow
✅ Alert if API call count exceeds 100 in a single run — pause and confirm

## Thresholds Requiring Human Approval

| Action | Threshold |
|---|---|
| New cloud resource | Any production resource |
| Monthly cost increase | > $50/month estimated |
| API calls per workflow run | > 100 external API calls |
| LLM token usage per task | > 500K tokens |

## For Reporting Agents

- Cache query results to avoid redundant API calls
- Do not schedule reporting agents to run more frequently than every 15 minutes
- ServiceNow queries must use field filters — never fetch all records from large tables
```

---

### validation/README.md

```markdown
# Validation Framework

Validation is the trust layer that makes Level 3 Agentic Development safe to operate.

```
Agent takes an action
        │
        ▼
[Pillar 2: Autonomy Boundary Check]
Is this action in the allowed tier for this environment?
  NO → Hard stop / escalate
  YES ↓
        ▼
[Pillar 3: Human Gate Check]
Does this action require human approval first?
  YES → Pause, notify, wait for sign-off
  NO ↓
        ▼
Agent produces output
        ▼
[Pillar 1: Output Quality Check]
Run automated checks + checklist
  FAIL → Block / flag for human review
  PASS → Proceed
```

## The Three Pillars

| Pillar | Folder | Question it answers |
|---|---|---|
| **1 — Output Quality** | `1-output-quality/` | Is what the AI produced correct, safe, and complete? |
| **2 — Autonomy Boundaries** | `2-autonomy-boundaries/` | Is this action within what the AI is allowed to do on its own? |
| **3 — Human Gates** | `3-human-gates/` | Where must a human approve before the agent proceeds? |

## Getting Started

**For developers:** Start with `1-output-quality/checklists/code-output.md` before every AI-generated MR.

**For team leads:** Read `2-autonomy-boundaries/risk-tier-model.md` to understand what agents can do autonomously.

**For architects:** Read `policy/validation-policy.md` for the full framework.
```

---

### validation/1-output-quality/checklists/code-output.md

```markdown
# Code Output Quality Checklist

**Pillar:** 1 — Output Quality
**Use when:** Reviewing AI-generated code before committing or opening an MR
**Last updated:** 2026-06-09

Run through this checklist for every AI-generated code change before it leaves your local branch.

## Correctness
- [ ] Logic is correct for the happy path
- [ ] Edge cases handled: null/undefined, empty collections, boundary values, concurrent access
- [ ] Error cases return appropriate responses (not raw exceptions)
- [ ] No regressions — existing tests still pass

## Code Quality
- [ ] Functions do one thing and are under 40 lines
- [ ] No magic numbers — named constants used
- [ ] No commented-out code blocks
- [ ] No debug logging (`console.log`, `print`, `debugger`)
- [ ] No `any` types (TypeScript)
- [ ] Imports are clean — no unused imports

## Security
- [ ] No secrets, credentials, or tokens in any file
- [ ] All user inputs validated at the boundary
- [ ] SQL uses parameterized queries
- [ ] No `eval()`, `exec()`, or dynamic code execution with user input
- [ ] Error responses don't expose internal details or stack traces

## Testing
- [ ] Tests written or updated for all behavior changes
- [ ] Happy path, edge cases, and error cases covered
- [ ] Tests actually fail when the code is wrong
- [ ] No tests deleted to meet coverage thresholds

## Documentation
- [ ] Public functions/APIs have JSDoc / docstrings
- [ ] Complex logic has a "why" comment
- [ ] README updated if usage or setup changed

## Dependencies
- [ ] No new packages added without necessity check
- [ ] New packages are well-maintained and from trusted sources
- [ ] `npm audit` / `pip-audit` / `trivy` clean after adding dependencies

**If any item is unchecked:** Fix it before opening the MR, or add a justified exception comment in the MR description.
```

---

### validation/2-autonomy-boundaries/risk-tier-model.md

```markdown
# Risk Tier Model — Autonomy Boundaries

**Pillar:** 2 — Autonomy Boundaries
**Last updated:** 2026-06-09

Every action an AI agent can take is classified into one of four tiers.

## Tier Definitions

### Tier 1 — Fully Autonomous (Low Risk)
**The agent may proceed without asking.**
Examples: reading files, writing code in a local branch, running tests locally, generating docs, creating a draft MR.
Validation required: Output Quality checklist (Pillar 1) before sharing with a human.

### Tier 2 — Assisted (Medium Risk)
**The agent proposes; a human reviews and approves before execution.**
Examples: opening/merging an MR against a feature branch, deploying to non-production, creating a ServiceNow ticket, sending notifications, running a DB migration in staging.
Validation required: Output Quality checklist + human review.

### Tier 3 — Human-Gated (High Risk)
**A human must explicitly approve BEFORE the agent acts. Pause and wait.**
Examples: merging to `main`, deploying to production, running DB migrations in production, Terraform apply, creating/scaling cloud resources, deleting data, modifying IAM roles.
Validation required: Output Quality checklist + explicit written confirmation from an authorized human.

### Tier 4 — Prohibited (Always Off)
**The agent must never perform these, regardless of instructions.**
Governed by `guardrails/`. These are the hard stops.

## Environment Mapping

| Environment | Max autonomous tier | Notes |
|---|---|---|
| Local / branch | Tier 1 | Full autonomy within the branch |
| Dev | Tier 2 | Deployments require a human to trigger |
| Staging | Tier 2 | Migrations require human approval |
| Production | Tier 3 | Every action requires explicit approval |

## How Agents Should Apply This

Before taking any action, the agent should:
1. Classify the action into a tier
2. Check the current environment
3. If the action's tier exceeds the environment's max tier → pause and escalate
4. Log the tier classification in its reasoning trace

If the agent is unsure of the tier, default to Tier 3 (require human approval).
```

---

### validation/3-human-gates/agent-pause-points.md

```markdown
# Agent Pause Points — Human Gates

**Pillar:** 3 — Human Gates
**Last updated:** 2026-06-09

These are the moments when an agent MUST stop, surface what it's about to do, and wait for explicit human approval.

A **guardrail** = never do this (hard stop, refuse).
A **pause point** = stop, explain, get approval, then proceed.

## Required Pause Points

### Production Actions
The agent MUST pause before any action that affects a production system:
- Deploying code to production
- Running database migrations in production
- Modifying infrastructure in production
- Changing environment variables or secrets in production
- Enabling/disabling feature flags in production

Required format: "I'm about to [specific action] in [production environment]. This will [describe impact]. Do you want me to proceed? (yes/no)"

### Irreversible Actions
- Deleting data, records, files, or resources
- Dropping or truncating database tables
- Permanently closing or resolving tickets

Required format: "This action cannot be undone: [specific action]. [Resource] will be permanently [deleted/lost]. Please confirm: yes to proceed, no to abort."

### Cross-System Actions
- Creating a ServiceNow ticket from GitLab data
- Updating a ServiceNow record based on agent analysis
- Sending a Slack message to a channel
- Triggering a CI/CD pipeline

### Low-Confidence Situations
- The task is ambiguous and multiple interpretations are plausible
- The agent is making assumptions about business rules it hasn't been told

Required response: "I'm not certain about [specific aspect]. My assumption is [X]. Do you want me to proceed with that assumption, or can you clarify?"

## How to Signal a Pause

1. **Stop** — do not take the action
2. **State what it was about to do** (specific, not vague)
3. **State the impact**
4. **Ask a binary question** (yes/no or choice between options)
5. **Wait** — do not time out or default to proceeding
```

---

### validation/policy/validation-policy.md

```markdown
# Validation Policy

**Last updated:** 2026-06-09
**Owner:** Platform Engineering
**Applies to:** All teams using Level 3 Agentic Development

## Minimum Requirements

### For Every AI-Generated Code Change
1. Run the Output Quality checklist before opening an MR
2. At least one human reviewer must approve the MR
3. All automated tests must pass

### For Every Autonomous Agent Action
1. The agent must classify the action into a risk tier before executing
2. Actions at or above the environment's tier limit must pause for human approval
3. All Tier 3 actions must be logged with who authorized them

### For Every Production Deployment
1. Tier 3 gate: explicit written approval from team lead or above
2. Output quality checklist must be complete
3. Rollback plan must be documented before deployment
4. Post-deployment verification must be completed within 30 minutes

## Maturity Levels

| Level | Description | Autonomous tier allowed |
|---|---|---|
| L1 | AI suggests; human does everything | None |
| L2 | AI drafts; human reviews all output | Tier 1 only |
| L3 | AI acts; human gates critical paths | Tier 1-2 autonomous, Tier 3 gated |
| L4 | AI acts end-to-end; full audit trail | All tiers with full traceability |

Most teams operate at L3. L4 requires platform team sign-off.
```

---

### definition-of-done/feature.md, bug-fix.md, api-endpoint.md, infrastructure.md

For each Definition of Done file, create the checklists exactly as described:

**feature.md** — Sections: Implementation, Testing, Security, Documentation, Observability, Deployment Readiness, Process. Each item must be specific and verifiable (not vague). Include items like: all acceptance criteria met, no `any` types (TS), unit tests ≥80% coverage, no secrets in logs/responses/code, ServiceNow ticket updated, MR description includes what/why/how-to-test.

**bug-fix.md** — Sections: Root Cause, Fix, Testing, Security, Documentation, Process. Key items: root cause documented in one sentence, regression test written BEFORE the fix, fix addresses root cause not symptom, no regressions, security team notified if security-related.

**api-endpoint.md** — Sections: Design, Implementation, Error Handling, Testing, Documentation, Observability, Process. Key items: RESTful conventions, request body/params validated with schema, auth checked, error body structured as `{ error: { code, message } }`, OpenAPI spec updated, structured log on entry/exit with request ID.

**infrastructure.md** — Sections: Planning, Implementation, Safety, CI/CD, Documentation, Process. Key items: `terraform plan` reviewed for unintended deletions, no hardcoded secrets in IaC, IAM least privilege (no `*`), deletion protection on data-bearing resources, rollback plan in MR, pipeline is idempotent, ServiceNow change record for production.

---

### prompts/ files

**prompts/general/explain-codebase.md** — A prompt that asks the AI to explore the repository and provide: (1) Overview, (2) Architecture, (3) Entry points, (4) Key dependencies, (5) Data flow for the main use case, (6) Non-obvious gotchas, (7) Where to start for a specific change. Include instructions to read actual files, not guess, and flag uncertainty.

**prompts/scaffolding/new-feature.md** — A prompt for scaffolding a new feature. Asks the AI to: review existing patterns first, create files following existing conventions, write tests alongside implementation, apply the org Definition of Done for features, and output a summary of files created/changed.

**prompts/code-review/self-review.md** — A prompt where the AI reviews its own output before submission. Walk through: correctness, edge cases, security (no secrets, no SQL injection, no auth bypass), tests written, docs updated. Output a ✅/❌/⚠️ summary.

**prompts/debugging/systematic-debug.md** — A structured debugging prompt. Steps: (1) reproduce the issue, (2) identify the most likely location, (3) read relevant code, (4) form a hypothesis, (5) propose a minimal fix, (6) write a regression test, (7) verify no regressions.

**prompts/documentation/generate-readme.md** — A prompt to generate a README for a codebase. Sections: What this is, Prerequisites, Installation, Usage (with examples), Configuration (env vars), Architecture overview, Contributing, License.

---

### mcp/ files

**mcp/user/mcp-settings.jsonc** — User-level MCP config with: filesystem (npx @modelcontextprotocol/server-filesystem, scope to /Users/YOUR_USERNAME/work), git (uvx mcp-server-git, alwaysAllow: git_status, git_log, git_diff, git_show, git_branch), fetch (uvx mcp-server-fetch), memory (npx @modelcontextprotocol/server-memory), sequential-thinking (npx @modelcontextprotocol/server-sequential-thinking). All with JSONC comments explaining each.

**mcp/user/mcp-settings.reporting.jsonc** — Reporting MCPs: servicenow (env: SERVICENOW_INSTANCE_URL, SERVICENOW_USERNAME, SERVICENOW_PASSWORD), gitlab (env: GITLAB_PERSONAL_ACCESS_TOKEN, GITLAB_API_URL), prometheus (env: PROMETHEUS_URL, PROMETHEUS_TOKEN), grafana (env: GRAFANA_URL, GRAFANA_TOKEN). Each with alwaysAllow lists and JSONC comments.

**mcp/workspace/mcp-settings.frontend.jsonc** — Frontend MCPs: playwright (npx @executeautomation/playwright-mcp-server, enabled), storybook (disabled, env: STORYBOOK_URL), figma (disabled, env: FIGMA_TOKEN, FIGMA_FILE_KEY).

**mcp/workspace/mcp-settings.backend.jsonc** — Backend MCPs: postgres (disabled, env: POSTGRES_CONNECTION_STRING, note to use read-only), openapi (disabled, env: OPENAPI_SPEC_URL), redis (disabled, env: REDIS_URL).

**mcp/workspace/mcp-settings.data.jsonc** — Data/ML MCPs: sqlite (uvx mcp-server-sqlite, disabled, env: SQLITE_DB_PATH), aws-s3 (disabled, env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, note: read-only IAM), data-catalog (disabled, env: CATALOG_URL, CATALOG_TOKEN).

**mcp/repo/mcp-settings.template.jsonc** — Template for repo-level MCPs. Contains two commented-out examples: a local-dev-db (postgres) and an internal-api. Explains this file should be committed to .cursor/mcp.json or .mcp.json in consuming repos.

---

### sync/manifest.yml

List of files to distribute via sync.sh:
- rules/shared/coding-standards.md, git-conventions.md, security-guardrails.md
- rules/cline/org-core.clinerules
- rules/cursor/always-on/org-core.mdc, auto-attached/typescript.mdc, agent-requested/validation-checklist.mdc
- rules/windsurf/org-core.windsurfrules
- definition-of-done/feature.md, bug-fix.md, api-endpoint.md, infrastructure.md
- guardrails/security.md, data-privacy.md, destructive-operations.md, cost-controls.md
- validation/1-output-quality/checklists/code-output.md, 2-autonomy-boundaries/risk-tier-model.md, 3-human-gates/agent-pause-points.md, policy/validation-policy.md
- prompts/scaffolding/new-feature.md, code-review/self-review.md, debugging/systematic-debug.md, documentation/generate-readme.md, general/explain-codebase.md

---

### sync/sync.sh

A bash script that: takes a target repo path as $1 and optional --dry-run as $2; reads the manifest with `yq`; copies each listed file to `$TARGET_REPO/.ai-standards/<path>`; skips files where a `.local.md` override exists; creates directories as needed; uses `set -euo pipefail`; prints clear COPY/SKIP/WARN log lines; on completion, prints next steps (git diff, git add, git commit, push, open MR).

---

### ci/ai-standards.gitlab-ci.yml

Two jobs in the `validate` stage:

**ai:sync-check** — runs on MR events and default branch pushes; checks if `.ai-standards/` exists; warns (but does not fail, `allow_failure: true`) if it's missing; uses `alpine:3.19`.

**ai:lint** — runs on MR events when files under `.ai-standards/`, `rules/`, `guardrails/`, `validation/`, or `mcp/` change; uses `node:20-alpine`; checks for hardcoded secrets in MCP configs (grep for api_key/password/token/secret followed by a non-env-var value); checks that rule files in `rules/shared/` have `Applies to:` metadata; exits non-zero on failure (`allow_failure: false`).

---

### how-to/cline-company-model-setup.md

A step-by-step guide to configure Cline in VS Code with your organisation's internal OpenAI-compatible AI endpoint:

- **Overview:** Your org runs an internal endpoint (e.g. `https://your-llm-gateway.example.com/api`) — usage billed to the company, model pre-approved for internal code/data, centrally auditable.
- **Prerequisites:** VS Code, Cline extension (`saoudrizwan.claude-dev`), company API key (request via your AI tools channel or team lead).
- **Steps:** (1) Open Cline settings gear icon, (2) Set API Provider to "OpenAI Compatible", (3) Set Base URL to your internal endpoint, (4) Paste your API key, (5) Set Model ID to the approved model (e.g. `claude-sonnet-4-5` — check your AI tools channel for current recommendation), (6) Configure model settings: Supports Images ✅, Context Window 1000000, Max Output Tokens -1, Temperature 0.
- **Verify:** Type "Say 'Connected' and nothing else" in a new chat.
- **Troubleshooting table:** 401 (bad key), 404 (wrong URL), model not found (verify model ID), slow first response (warmup is normal).

---

## CLOSING INSTRUCTIONS

After creating all files:

1. Initialize a git repository: `git init`, `git add -A`, `git commit -m "feat: initial agentic-development infrastructure"`
2. Verify the full tree matches the structure listed at the top of this prompt using `find . -type f | sort`
3. Report a summary: total files created, any files skipped, and confirm the repo is ready for a first push to your Git remote
4. Suggest the first three follow-up tasks: (a) add a CODEOWNERS file, (b) create `agents/` and `skills/` folders with README stubs, (c) write the first reporting agent definition
```

