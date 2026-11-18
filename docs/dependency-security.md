# Dependency security review

Reviewed 2026-11-18 against the committed lockfile.

## Current finding

`npm audit` reports five high-severity package entries caused by one advisory:
[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), a
regular-expression denial of service in picomatch. The dependency path is the
Vite development/build toolchain, including tinyglobby, fdir, and the React plugin.
These are not five independent vulnerabilities.

The installed picomatch version and current registry latest are both 4.0.7.
The advisory lists no patched version. Vite 8.3.8 also depends on picomatch
`^4.0.7`; updating Vite alone does not resolve this advisory. The major downgrades
suggested by `npm audit fix --force` have not been applied: a lower audit count
would not by itself establish a compatible or safer toolchain.

`npm audit --omit=dev` reports zero known findings at this review. The Docker
runtime stage already omits development dependencies and serves the built app
with Express. This is a dependency-graph observation, not proof that a deployed
container is configured that way or that the application has no vulnerabilities.

## Handling while awaiting an upstream fix

- Do not accept untrusted glob patterns into build tooling or run builds against
  untrusted source/configuration on a privileged machine.
- Keep development servers private; do not use Vite as the production server.
- CI uses unprivileged pull-request execution with read-only repository access,
  no saved checkout credentials, no deployment, and a bounded job timeout.
- CI records the full audit report, including development dependencies, as an
  artifact. An advisory does not disappear because the production audit passes.
- CI blocks on high or critical findings in production dependencies. The full audit gate permits only the exact recorded advisory and affected audit findings,
  package versions, and development-only lockfile classification through a
  reviewed exception expiring 2026-12-18. New or changed findings, malformed
  reports, audit execution errors, and expiry fail the gate. This is not risk
  acceptance on behalf of every consumer or deployment.

## Recheck and close

Run `npm run audit:dependencies` and `npm audit --omit=dev` after dependency changes. When an
upstream patched version becomes available, update the narrowest compatible
lockfile dependency, run the full tests, instruction evaluation and build with
`.nvmrc`, then re-audit. Record remaining findings rather than claiming security
clearance from a passing build.

The exception lives in `scripts/dependency-audit-exception.json`. A clean audit
passes even after expiry and requests removal of the obsolete exception. Any
extension or graph change requires explicit review, not an automatic renewal.
