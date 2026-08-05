Implementation is blocked by missing governance decisions, so I made no repository changes.

The repository explicitly leaves these undefined:

- Customer retention period and deletion owner: [customer-data.md](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-ambiguous-cross-cutting-change-8Bd1Px/services/customer-data.md)
- Audit retention and legal-hold behavior: [audit-events.md](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-ambiguous-cross-cutting-change-8Bd1Px/services/audit-events.md)

Before implementation, please specify:

1. Whether “organization-wide” means one platform policy or per-customer-organization settings.
2. Retention periods for customer profiles/images and audit events.
3. Whether deletion covers backups, object storage, and warehouse exports.
4. Legal-hold precedence and release behavior.
5. Who may configure, approve, and execute retention changes.

Validation note: the untouched baseline `npm test` already fails in [paginate.js](/private/var/folders/mz/5sltz_tj4kq5y4tyswkmrmr80000gp/T/instruction-eval-candidate-ambiguous-cross-cutting-change-8Bd1Px/src/paginate.js:3), unrelated to retention.
