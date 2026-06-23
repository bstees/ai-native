# Registry

This directory is the working source of truth for backlog curation.

It stores:

- the source registry we monitor
- the ontology we use to normalize observations
- the templates for evidence, concept, and backlog records
- the scoring rubric used to promote concepts

## Initial Workflow

1. Add or update a source in [`sources.yml`](./sources.yml).
2. Map observations using [`ontology.yml`](./ontology.yml).
3. Capture evidence using the templates in [`templates/`](./templates/).
4. Merge repeated evidence into concept records.
5. Generate backlog candidates only from sufficiently strong concept records.

## Status Model

- `emerging`: worth watching
- `provisional`: credible enough for bounded experiments
- `established`: suitable for routine backlog creation
- `internal-standard`: adopted and maintained by us

## First Target

The first curation pass should produce a small backlog report for `Interest
Lens` using the initial trusted sources and the templates in this directory.
