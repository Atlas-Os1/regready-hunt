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

- `npm run check` passed on exact head `3902f3f`.
- `npm run test:mobile` passed at 390px with no overflow; `npm run test:trip:e2e` passed with 6 trip items, shared read-only access, 4 connection cards, and no overflow.
- Bounded `REGREADY_URL=http://127.0.0.1:8787 npm run test:e2e` passed against a remote-D1 Wrangler preview: local `blob:` preview, `screenshot-reviewed-local` provenance, account/license/plan flows, duplicate signup 409, unknown route 404, unauthenticated plan 401, logout/login, no browser errors, and no mobile overflow.
- GitHub Actions `RegReady verification` run `32454969254` passed for exact head `3902f3f`.
- No shared-preview or production deployment was performed; the bounded browser run created test records only in the preview database.

## Follow-up

OCR requires a separately approved adapter contract: provider, retention, redaction behavior, failure states, and source attribution must be specified before implementation. No provider is assumed here.
