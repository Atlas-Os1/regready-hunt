# RegReady Worker deployment evidence

## Source
- Repository: https://github.com/Atlas-Os1/regready-hunt
- Main baseline commit: `611d304ff62bb0428dc215798dd4b0cc8c674cb8`
- Current development/source-pack head: `47a8c4a`
- Preview branch: `development`
- Deployment timestamp: 2026-08-20/21 UTC session

## Preview
- Worker: `regready-hunt-preview`
- URL: https://regready-hunt-preview.srvcflo.workers.dev
- Version ID: `6be5a5b6-8c29-4597-bfc7-95f742af8dd8`
- D1: `regready-hunt-rules-preview` (`298875a7-d758-4e8a-b0d6-96aff6666180`)
- Environment: `preview`
- Rules status: `source-captured-normalization-pending-human-review`
- Runtime checks: homepage HTTP 200, `/api/health` returned `status: ok`, `/api/rules/status` returned Oklahoma source URLs, `/api/rules/oklahoma` returned 8 source documents and 17 normalized records across deer, elk, antelope, black bear, and mountain lion.

## Production scaffold
- Worker: `regready-hunt-production`
- URL: https://regready-hunt-production.srvcflo.workers.dev
- Version ID: `86db67c7-25a1-4080-834b-0500dee219e6`
- D1: `regready-hunt-rules-production` (`a7edad20-4403-40dc-8df0-e5f4fdd03286`)
- Environment: `production`
- Rules status: `source-captured-normalization-pending-human-review`
- Runtime checks: `/api/health` returned `status: ok`; `/api/rules/oklahoma` returned the same 8 source documents and 17 normalized records.

## Source-pack runtime verification
- Source snapshot: `2026-08-21T03:32:09.614609+00:00`
- Source documents captured: 8
- Normalized records stored in each D1 database: 17
- Species present: deer, elk, antelope, black bear, mountain lion
- Mobile live-flow check: production Worker, 390px viewport, Elk selection rendered 5 season evidence records with no horizontal overflow.
- Visual QA: live production mobile screenshot reviewed after the redesign. Source connection, 8 sources, 17 records, planner hierarchy, safety footer, and evidence layout were visible and legible.
- Browser E2E: live production 390px flow passed account creation, duplicate signup rejection (409), all six species states, local save, ODWC handoff link, license snapshot, hunt-plan save, logout/login recovery, unauthenticated plan rejection (401), unknown API rejection (404), and no browser/page errors after expected statuses.
- GitHub Actions: preview run `32448723601` passed; verification run `32448723607` passed on head `d15a120`; corrected preview run on head `f6040e1` passed; corrected verification run on head `f6040e1` passed.
- Trip workspace live E2E: account-created trip, six seeded planning lanes, owner detail route, buddy invite, read-only shared route, four connection cards, and 390px no-overflow check passed on production version `86db67c7-25a1-4080-834b-0500dee219e6`.

## Product integration boundary
Both Workers currently serve captured/normalized source evidence and explicitly report that human review is pending. No Oklahoma hunting rule is production-valid yet. Production rules content remains blocked on citation review, interpretation review, and stale-source checks.

## Commands used
```bash
npm run check
npm run test:mobile
npm run cf:dry-run
npm run cf:deploy:preview
npm run cf:deploy:production
```
