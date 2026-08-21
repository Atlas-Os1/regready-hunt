# RegReady Worker deployment evidence

## Source
- Repository: https://github.com/Atlas-Os1/regready-hunt
- Main baseline commit: `611d304ff62bb0428dc215798dd4b0cc8c674cb8`
- Current development/source-pack head: `1024ef5`
- Preview branch: `development`
- Deployment timestamp: 2026-08-20/21 UTC session

## Preview
- Worker: `regready-hunt-preview`
- URL: https://regready-hunt-preview.srvcflo.workers.dev
- Version ID: `1bba37a7-a350-4fe4-b4f6-2c0830d1fa2c`
- D1: `regready-hunt-rules-preview` (`298875a7-d758-4e8a-b0d6-96aff6666180`)
- Environment: `preview`
- Rules status: `source-captured-normalization-pending-human-review`
- Runtime checks: homepage HTTP 200, `/api/health` returned `status: ok`, `/api/rules/status` returned Oklahoma source URLs, `/api/rules/oklahoma` returned 8 source documents and 17 normalized records across deer, elk, antelope, black bear, and mountain lion.

## Production scaffold
- Worker: `regready-hunt-production`
- URL: https://regready-hunt-production.srvcflo.workers.dev
- Version ID: `c18c7cbd-c1ff-4a53-89a1-82d423119d7d`
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

## Release boundary
Both Workers currently serve captured/normalized source evidence and explicitly report that human review is pending. No Oklahoma hunting rule is production-valid yet. Production rules content remains blocked on citation review, interpretation review, and stale-source checks.

## Commands used
```bash
npm run check
npm run test:mobile
npm run cf:dry-run
npm run cf:deploy:preview
npm run cf:deploy:production
```
