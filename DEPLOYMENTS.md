# RegReady Worker deployment evidence

## Source
- Repository: https://github.com/Atlas-Os1/regready-hunt
- Main baseline commit: `611d304ff62bb0428dc215798dd4b0cc8c674cb8`
- Preview branch: `development`
- Deployment timestamp: 2026-08-20/21 UTC session

## Preview
- Worker: `regready-hunt-preview`
- URL: https://regready-hunt-preview.srvcflo.workers.dev
- Version ID: `d3817bdd-56fb-41ef-bac3-eedf844232a4`
- Environment: `preview`
- Rules status: `demo-data`
- Runtime checks: homepage HTTP 200, `/api/health` returned `status: ok`, `/api/rules/status` returned Oklahoma source URLs, manifest HTTP 200, service worker HTTP 200.

## Production scaffold
- Worker: `regready-hunt-production`
- URL: https://regready-hunt-production.srvcflo.workers.dev
- Version ID: `6debb77d-bc0e-4abb-ae24-46a1caa2a501`
- Environment: `production`
- Rules status: `demo-data`
- Runtime verification required before calling this a public rules release: homepage, health, rules status, manifest, mobile flow, and source-pack review.

## Release boundary
Both Workers currently serve the mobile prototype and explicitly report `demo-data`. No Oklahoma hunting rule is represented as production-valid yet. Production rules content remains blocked on source-pack extraction, citation, review, and stale-source checks.

## Commands used
```bash
npm run check
npm run test:mobile
npm run cf:dry-run
npm run cf:deploy:preview
npm run cf:deploy:production
```
