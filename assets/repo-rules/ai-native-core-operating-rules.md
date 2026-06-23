# AI Native Core Operating Rules

## Purpose

Provide a centrally maintained baseline for how AI agents should operate inside
consumer repositories.

This asset is intended to be shared across repos and adapted lightly where
needed.

## Core Expectations

### 1. Follow Existing Repo Patterns

- Prefer the conventions already present in the repository.
- Make the smallest useful change.
- Do not refactor unrelated code unless asked.

### 2. Keep Work Explainable

- Leave a clear trail of why meaningful changes were made.
- Prefer readable code and direct naming over cleverness.
- Surface assumptions when local context is incomplete.

### 3. Treat Human Gates as Mandatory

- Pause for approval before destructive operations.
- Pause for approval before applying changes with unclear blast radius.
- Treat cross-repo rollout as a reviewed action, not a silent default.

### 4. Protect Quality

- Update or add tests when behavior changes.
- Do not remove tests to make a change appear complete.
- Flag unresolved uncertainty instead of hiding it behind implementation.

### 5. Protect Security and Trust

- Never introduce secrets into code or config.
- Do not weaken auth, transport, or validation controls without explicit approval.
- Prefer least privilege when tools, permissions, or integrations are involved.

## Recommended Local Adaptation

Consumer repos may add:

- stack-specific coding expectations
- local testing commands
- deployment or release constraints
- domain-specific approval rules

Consumer repos should avoid rewriting the baseline unless local needs clearly
require it.
