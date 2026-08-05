Fixed the pagination off-by-one error in [src/paginate.js](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-targeted-bug-fix-QhIH5K/src/paginate.js:3).

Added regression cases for partial final pages and one-item page sizes in [tests/paginate.test.js](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-targeted-bug-fix-QhIH5K/tests/paginate.test.js:6).

Validation:

- `npm test` — passed
- `git diff --check` — passed
- Only the pagination implementation and its tests were modified; unrelated fixture files remain untouched.
