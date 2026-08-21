# RegReady Hunt

Mobile-first v1 prototype for a citation-first hunt readiness checklist. It turns a hunter's selected state, species, date, and weapon into a clearly labeled readiness workflow.

## Current scope
- Responsive web/PWA shell for iOS and Android browsers
- State, species, date, and weapon inputs
- Demo rule-pack output with source links
- Explicit demo-data and official-source warnings
- Local saved hunt card using browser storage
- No account, payment, scraping, or legal claim in v1

## Why this is the first build
It is the smallest product that can test whether hunters pay for a personalized, source-linked readiness card before we build a national rules ingestion system.

## Run
```bash
python3 -m http.server 4173
```
Then open `http://localhost:4173/projects/regready-hunt/`.

## Next gate
Replace the demo rule pack with one reviewed state/species pack, record source URL and retrieval date, and run a paid pilot.
