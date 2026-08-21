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
- The current image is released by browser form reset and is not persisted by RegReady.

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

- `npm run check`
- GitHub verification run `32452693971` passed on PR head `ca910c8`.
- Existing mobile/readiness tests remain part of the repository gate.
- Full live `npm run test:e2e` must be run after a reviewed preview deployment because the branch is not promoted to shared preview automatically.

## Follow-up

OCR requires a separately approved adapter contract: provider, retention, redaction behavior, failure states, and source attribution must be specified before implementation. No provider is assumed here.
