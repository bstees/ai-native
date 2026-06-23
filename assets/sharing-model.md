# Sharing Model

## Purpose

Define how `AI Native` serves other repositories.

## Core Idea

This repo is the maintenance layer. Consumer repos should receive the benefits
of curated, shared assets without each one becoming responsible for tracking
industry change independently.

## Distribution Options

### Central Source with Sync

Use when an asset should stay consistent across many repos and benefit from
regular updates from a single source.

### Generate In Place

Use when an asset needs heavy repo-specific adaptation or would be difficult to
consume as a static shared file.

## Decision Criteria

Prefer central sharing when:

- the asset is broadly reusable
- consistency matters more than local customization
- the maintenance burden is lower centrally

Prefer generation in place when:

- the asset depends heavily on repo-local context
- the output is disposable or frequently reshaped
- the shared value is the generation pattern more than the generated file

## Initial Assumption

Prompts, rules, and validation artifacts are the best first candidates for
central maintenance and cross-repo sharing.
