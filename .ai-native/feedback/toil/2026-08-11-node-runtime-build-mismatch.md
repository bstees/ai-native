# Declare The Node Runtime Required By The Build

## Metadata

- `feedback_id`: `toil-2026-08-11-node-runtime-build-mismatch`
- `captured_on`: `2026-08-11`
- `captured_by`: `codex`
- `source_type`: `toil`
- `scope`: `repo-local`
- `status`: `new`

## Context

Running the repository's documented `npm run build` verification after adding
the shared `write-unit-tests` skill.

## Friction

The default shell resolves Node `v16.15.1`, but installed Vite `8.2.0` declares
`^20.19.0 || >=22.12.0` and imports `node:util.styleText`. The documented build
therefore failed before project code was evaluated. A compatible Node `v24.16.0`
binary already existed at `/Users/bstees/.local/node-current/bin/node`, and the
same Vite build passed when invoked with it explicitly.

## Likely Guidance Gap

`package.json` and the README require Node generically but do not declare or
enforce the minimum runtime needed by the checked-in build toolchain.

## Proposed Improvement

Declare the supported Node range in `package.json` and the setup guidance, then
ensure the normal shell or repository wrapper selects a compatible runtime.
Add a lightweight preflight only if the package manager's engine check is not
sufficiently reliable for local and CI use.

## Evidence

- `npm run build` under Node `v16.15.1` failed because `node:util` did not export
  `styleText`.
- `node_modules/vite/package.json` declares Node
  `^20.19.0 || >=22.12.0`.
- `/Users/bstees/.local/node-current/bin/node node_modules/vite/bin/vite.js build`
  passed under Node `v24.16.0`.

## Next Action

During the next repo-local feedback review, choose the supported Node range and
add one canonical runtime-selection path before tightening build enforcement.
