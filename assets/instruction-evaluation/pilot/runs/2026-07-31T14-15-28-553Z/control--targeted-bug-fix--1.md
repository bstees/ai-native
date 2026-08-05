Fixed the off-by-one error in [src/paginate.js](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-control-targeted-bug-fix-5sCsbW/src/paginate.js:3). The exclusive `slice` end now uses `start + pageSize`.

Verification:

- Reproduced the original failing pagination assertion.
- Targeted pagination test passes.
- Full `npm test` suite passes.
- `git diff --check` passes.
- No unrelated files were changed.
