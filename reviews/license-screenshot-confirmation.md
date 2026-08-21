# License screenshot confirmation

## Scope
The current slice is screenshot-assisted confirmation. It is not OCR, ODWC account synchronization, or legal proof.

## Privacy contract

- The browser accepts PNG, JPEG, and WebP images up to 5 MB.
- The selected image is rendered with a local `blob:` URL.
- No image upload route exists.
- The API receives only fields explicitly confirmed in the form.
- The API stores a minimized record with `status=user-confirmed`.
- Provenance is `screenshot-reviewed-local` when a local screenshot was selected and `manual-entry` otherwise.
- The current object URL is revoked when replaced, rejected, or successfully saved; the preview source is cleared and the form is reset after save. The image is not uploaded or persisted by RegReady.

## Fields

Stored fields are limited to:

- agency
- license name
- species
- masked license suffix
- expiry date
- capture provenance

RegReady does not request or store DOB, SSN, barcode/QR payloads, full license identifiers, or agency credentials.

## Verification

- `npm run check`, `npm run test:mobile`, `npm run test:trip:e2e`, and `npm run cf:dry-run` passed during the current PR-head reconciliation. Mobile output was 390px with no overflow, 4 checklist items, 5 season evidence items, local save, and disclaimer; trip output was 6 trip items, shared read-only access, 4 connection cards, and no overflow.
- Bounded `REGREADY_URL=http://127.0.0.1:8787 npm run test:e2e` passed against a remote-D1 Wrangler preview on the preceding functional head `3902f3f`: local `blob:` preview, `screenshot-reviewed-local` provenance, account/license/plan flows, duplicate signup 409, unknown route 404, unauthenticated plan 401, logout/login, no browser errors, and no mobile overflow. The current head changes only this review artifact; no functional files changed after that browser run.
- GitHub Actions verification status and the current PR head SHA must be read from PR #11 at review time; documentation-only evidence must not be reused after a head change. The prior functional verification run was `32505264366` on `fcb0ed8`; the subsequent documentation refresh requires a fresh exact-head CI result.
- No shared-preview or production deployment was performed; the bounded browser run created test records only in the preview database.

## Deployment state

- No shared-preview or production deployment was performed. `npm run cf:dry-run` only validated the preview bindings (`RULES_DB`, `ASSETS`, `ENVIRONMENT`, and `RULES_STATUS`).
- The bounded browser run used a local Wrangler preview and created test records only in the preview database.

## Risks

- This slice does not establish legal validity, perform OCR, upload raw images, or synchronize ODWC credentials.
- A future OCR/import feature requires a separately approved provider, retention, redaction, failure-state, and provenance contract.

## Next gate

- Fresh exact-head CI, repository-visible PR-Checker triage, Curator verification, Code-Rev, and independent non-implementing verification must all pass before Cleo considers merge. No merge or deploy is authorized by this artifact.

## Follow-up

OCR requires a separately approved adapter contract: provider, retention, redaction behavior, failure states, and source attribution must be specified before implementation. No provider is assumed here.
