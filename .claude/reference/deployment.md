# Deployment

> Deploy target, build output, asset paths, publish flow.

Not chosen yet. Constraints already set:

- The owner-review prototype must be private (password or access control, not only `noindex`) and `noindex`.
- Pick the host before writing any booking-system code: the server adapter, scheduled jobs (reminder texts) and database all follow from it.
- A public build must exclude the placeholder tags and the `/review` checklist page, and fail if any placeholder is unconfirmed (`docs/design-brief.md`, section 8).
