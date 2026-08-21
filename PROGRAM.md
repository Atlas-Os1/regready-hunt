# Outdoor Apps Program

## Destination
Build five independent, mobile-first outdoor and hunting products that can share integration contracts without sharing release risk. Launch the smallest sellable product first, validate payment, then advance the next product only when its own evidence gate is met.

## Portfolio
1. **RegReady Hunt** - personalized, citation-first hunt-readiness checklist. **V1 implementation lane.**
2. **HuntAccess OS** - landowner-controlled permissions, scheduling, waivers, and check-in. **Planning lane.**
3. **Field-to-Freezer** - post-harvest compliance, processor coordination, and freezer records. **Planning lane.**
4. **Outfitter FieldOps** - guide/outfitter trip operations and client readiness. **Planning lane.**
5. **HuntClub Stewardship** - club scheduling, safety, workdays, harvest, and landowner reports. **Planning lane.**

## Shared platform rules
- Each product has its own repository or monorepo package, deployment target, data namespace, domain, billing catalog, and release notes.
- Shared libraries are limited to typed contracts, authentication primitives, design tokens, analytics conventions, and integration adapters. Product data never shares a table by default.
- Mobile-first means responsive web/PWA first, with iOS and Android installability. Native wrappers or Expo clients come after paid validation.
- Official state agency sources remain the legal authority. AI can explain or organize sourced material, but cannot invent rules or replace the source link.
- Existing outdoor apps are integrations, not dependencies: support deep links, GPX/CSV export, share sheets, and webhooks where documented. Do not scrape or reverse-engineer private APIs.

## Delivery pipeline
`product decision -> bounded issue -> implementation branch -> PR-Checker -> Curator artifact -> deep review -> independent test -> preview -> Cleo approval -> deploy`

No production deploy is implied by this local scaffold.

## First commercial sequence
1. Sell a single-state RegReady season pass or concierge rules-pack setup.
2. Measure completed readiness checks, source-click-through, and payment conversion.
3. Add a second state only after the first pack has a verified update workflow.
4. Start HuntAccess with clubs and landowners, not a two-sided marketplace.
5. Use the same account and integration adapters only after the product boundaries remain clear.

## Evidence status
- Verified workspace: newly created at `C:/Users/Minte/OutdoorApps`.
- Verified existing outdoor repository: none found in the inspected local project locations.
- Product facts: based on prior research sources in the parent conversation; claims requiring legal authority remain explicitly unimplemented until state source packs are curated.
