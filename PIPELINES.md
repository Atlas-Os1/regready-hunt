# Independent deployment pipelines

Each product is independently deployable. Shared platform work must not make one product's release dependent on the others.

## RegReady Hunt
- Local preview: static PWA
- Preview: product-specific Cloudflare Pages or Worker target
- Production: separate custom domain and analytics namespace
- Release gate: reviewed source pack, tests, mobile QA, current-head review, Cleo approval

## HuntAccess OS
- Preview: isolated Worker plus D1/R2 namespace
- Production: separate database, storage prefix, billing catalog, and domain
- Release gate: permission/tenant isolation, waiver audit trail, payment test, mobile QA

## Field-to-Freezer
- Preview: isolated Worker plus source-pack registry
- Production: separate processor/customer data namespaces
- Release gate: source freshness, CWD/transport review, privacy, processor acceptance test

## Outfitter FieldOps
- Preview: isolated app/API and test payment mode
- Production: separate booking/payment account scope
- Release gate: offline behavior, document access control, cancellation/refund rules

## HuntClub Stewardship
- Preview: isolated club tenant fixtures
- Production: separate club data boundaries and report export path
- Release gate: role isolation, report correctness, safety-record retention, mobile QA

## Team review chain
Implementation lane -> PR-Checker -> Curator documentation -> deep review -> non-implementing verification -> Cleo merge/deploy decision.
