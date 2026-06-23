# Scoring Rubric

## Purpose

This rubric helps us decide whether a new signal is weak noise, a candidate for
experimentation, or strong enough to drive backlog creation.

## Source Trust

Score each evidence record from `1` to `4`:

| Score | Meaning |
|---|---|
| `4` | Official docs, changelogs, standards bodies, vendor security notes |
| `3` | Research reports, peer-reviewed work, benchmark datasets |
| `2` | Credible practitioner writeups, conference talks, vendor case studies |
| `1` | Social chatter, weak signals, unverified commentary |

## Novelty or Change

Score each evidence record from `0` to `3`:

| Score | Meaning |
|---|---|
| `0` | No meaningful change from what we already track |
| `1` | Incremental clarification or minor feature evolution |
| `2` | Material workflow change or meaningful new control/capability |
| `3` | New concept category, broad ecosystem shift, or strong operational implication |

## Operational Relevance

Score each evidence record from `0` to `3`:

| Score | Meaning |
|---|---|
| `0` | Not relevant to our repos or current epics |
| `1` | Potentially relevant later, but not actionable now |
| `2` | Relevant to one active repo or pilot workflow |
| `3` | Relevant across multiple repos or central sharing strategy |

## Promotion Guidance

Use judgment, but default to these thresholds:

- `emerging`
  when a concept is supported by one strong source or several weak signals
- `provisional`
  when a concept has at least two credible evidence records and a plausible
  pilot path
- `established`
  when a concept appears across multiple trusted sources, persists over time,
  and has clear operational relevance
- `internal-standard`
  only after we adopt it in practice and choose to maintain it intentionally

## Backlog Rule

Generate backlog items by default only from `established` concepts, or from
`provisional` concepts when the output is explicitly labeled as a pilot or
experiment.
