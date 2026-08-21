# RegReady Hunt project plan

## Product boundary
A mobile-first source-linked preparation checklist. It does not issue licenses, provide legal advice, scrape agencies, or replace official sources.

## V1 acceptance
- User can select state, species, date, and weapon on a phone.
- User receives a personalized checklist.
- Official source link is visible.
- Demo-data warning is visible.
- Hunt card can be saved locally.
- Layout works at narrow mobile widths.

## Paid pilot
Start with one state and one species. Charge for a season pass only after a reviewed source pack exists.

## Source-pack contract
`state`, `species`, `effectiveDate`, `retrievedAt`, `officialUrl`, `seasonRules`, `licenseRules`, `weaponRules`, `reportingRules`, `transportRules`, `emergencyNoticeUrl`, `reviewer`, `reviewStatus`.

## Integrations
- Deep links to onX/HuntStand/GoHunt only where public share/export links are documented.
- GPX export later.
- No private API scraping.

## Next implementation tickets
1. Curate and review one official state/species pack.
2. Add pack versioning and stale-source detection.
3. Add payment-gated season pass.
4. Add installable offline cache after source-pack integrity is proven.
