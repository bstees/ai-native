# Weekly AI Engineering Digest Delivery Plan

## Goal

Publish the historically dated Friday AI Engineering Briefs on
`brentstees.com`, trace each actionable finding into the AI Native backlog, and
record implementation and verification evidence without colliding with the
active `nuk`, site-shell, or AI Native workstreams.

## Execution Mode

This is plan-mode work because it crosses repositories, includes public-facing
content, and changes shared AI Native guidance. Implementation proceeds in
reviewable slices on feature branches. Merges, production deployment, and
consumer-repository rollout remain human gates.

## Repository Ownership

| Repository | Owns | This branch may change | Out of scope |
| --- | --- | --- | --- |
| `bstees/nuk` | Future brief intake, editorial review, and generation | Nothing while its active worktree is dirty | Its current draft, workflow, app, editorial package, and theme |
| `bstees/brentstees.com` | Public digest library | Digest content, digest routes, metadata, RSS/sitemap, and digest-local styles | Homepage copy, global navigation, global theme tokens, shell layout, deployment, and DNS |
| `bstees/ai-native` | Evidence, findings, backlog, implementation, and verification | New digest planning/evidence/backlog paths and narrowly scoped implementations | Concurrent telemetry, sync, and write-unit-tests work; consumer rollout |

The canonical cross-repository state is
[`weekly-digest-delivery-manifest.json`](./weekly-digest-delivery-manifest.json).
Article frontmatter and implementation records reference its stable digest and
finding IDs rather than duplicating status.

## Dependency Order

1. Inventory every source output and preserve its explicit historical date.
2. Resolve source URLs and remove ChatGPT-only citation markup.
3. Extract stable finding records and consolidate overlap into backlog items.
4. Implement the smallest high-confidence AI Native backlog slices and record
   tests or other evidence.
5. Build the site digest collection, index, article routes, RSS, sitemap, and
   local styles using the existing theme contract.
6. Verify content dates, internal links, metadata, feeds, responsive rendering,
   accessibility, AI Native tests, and both repository builds.
7. Push feature branches. Open pull requests when a GitHub integration is
   available; otherwise provide compare URLs without inventing PR numbers.
8. Rebase the digest branch onto the site-shell owner's integration commit,
   merge through review, then deploy through the site owner's release path.

## Conflict Policy

- Work only in dedicated Git worktrees based on the remote `main` baselines
  recorded in the manifest.
- Never stage, reset, stash, or commit changes from the dirty primary checkouts.
- Do not edit `brentstees.com/src/pages/index.astro`,
  `brentstees.com/src/data/site.ts`, or
  `brentstees.com/src/styles/global.css`.
- Do not edit `nuk` until its active work is committed to a named branch and a
  new dependency decision is recorded.
- Add new AI Native files first. Changes to established shared assets require
  targeted tests and a distinct manifest implementation record.

## Historical-Date Rule

Only a date explicitly present in the source output may become an article
publication date. One source brief has no explicit issue date; it remains in
the inventory with `publication_status: blocked_missing_explicit_date` and is
not published. A failed scheduled run is recorded as a run event, not an
article.

## Verification Contract

### Website

- Content schema rejects missing or invalid issue dates, duplicate slugs, empty
  findings, and non-HTTPS external sources.
- Digest index order is descending by the explicit issue date.
- Article canonical URLs, Open Graph dates, JSON-LD, RSS dates, and sitemap
  entries agree with article frontmatter.
- Production build passes with no changes to shell-owned files.
- Index and article pages receive desktop and narrow-screen browser review,
  keyboard review, and automated link/metadata checks.

### AI Native

- Manifest schema and referential-integrity checks pass.
- Every finding maps to a backlog item or an explicit `deferred` disposition.
- Every `implemented` finding links to a repository path, commit/branch, and a
  verification result.
- Existing `npm test`, `npm run build`, and relevant targeted tests pass under
  the repository-supported Node runtime.

## Human Gates

- Editorial approval of article wording and source representation.
- Approval to merge either feature branch.
- Approval to change the global site shell or theme.
- Approval to roll shared assets into consumer repositories.
- Production deployment and any DNS change.

## Known Blockers

- The GitHub CLI is not installed and the GitHub plugin is not connected, so PR
  creation may need a later browser or connector step.
- The `nuk` working tree contains an unapproved November 6 draft and extensive
  concurrent edits. It is evidence for future integration, not a safe input to
  modify now.
- The undated source brief cannot be assigned a historical date without new
  evidence.

