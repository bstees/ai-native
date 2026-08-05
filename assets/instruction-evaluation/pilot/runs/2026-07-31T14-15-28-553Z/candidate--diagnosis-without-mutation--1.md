The duplicate is caused by retrying a non-idempotent multi-step operation as one unit.

- [`importRecord()`](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-diagnosis-without-mutation-Xj7B3U/src/import-records.js:4) wraps both `database.insert()` and `database.markImported()` in the same retry loop.
- The insert completes at [line 6](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-diagnosis-without-mutation-Xj7B3U/src/import-records.js:6), but if the marker fails at [line 10](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-diagnosis-without-mutation-Xj7B3U/src/import-records.js:10), the catch silently starts the entire sequence again.
- The log records exactly that sequence: first insert succeeds, marking times out, and the retry inserts `customer-42` again ([log lines 1–4](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-diagnosis-without-mutation-Xj7B3U/logs/import-job.log:1)).

There is no transaction, rollback, idempotency key, existence check, or upsert visible in this code. The two successful log entries for the same external ID indicate that the database layer also does not enforce effective uniqueness for this operation.

It is intermittent because it requires a partial failure: the insert must commit, followed by a failure or timeout before the import is considered complete. A normal run inserts only once.

Validation:

- A read-only reproduction with a fake database produced two identical rows after making the first `markImported()` call time out.
- There is no import regression test in [`tests/run.js`](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-diagnosis-without-mutation-Xj7B3U/tests/run.js:1).
- `npm test` was run, but the existing unrelated pagination test failed.
- `git status` and `git diff` remained clean; no repository files were changed.
