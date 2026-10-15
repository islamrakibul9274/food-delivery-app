# FOOD release — 15 October 2026

Application commit: `9d5e820` on `main` (storefront, secure ordering/admin API, and persistent menu image uploads). The README is updated after live verification.

## Live applications

- Website: https://food-delivery-app-smoky-sigma.vercel.app
- Primary API: https://fast-food-backend-v1.onrender.com
- Primary readiness: https://fast-food-backend-v1.onrender.com/api/health
- Secondary API retained: https://food-delivery-api-y8fy.onrender.com

The deployed application is explicitly configured as a demo. Test orders do not result in real deliveries or charges. Sample delivery/pickup settings were authorized by the owner. Existing account roles/passwords, menu items and historical orders were preserved; the release smoke-test records were removed.

## Changes

- Redesigned storefront, menu and dish details; URL-based search/category/sort filters; vegetarian filter; favorites; consistent navigation/footer; supporting pages and recoverable empty/error states.
- Food photography, restrained typography, and a mobile preview rendered in HTML/CSS. No new AI images or invented reviews/ratings. Public assets were reduced from 45.85 MB to approximately 0.80 MB; this is not a measured Core Web Vitals result.
- Persistent bag, working removal/quantity controls, catalog-priced add-ons and notes; delivery/pickup checkout; cash/demo payment; idempotent order creation; confirmation, status timeline, cancellation before confirmation, and reordering with current prices.
- HttpOnly sessions, backend role/ownership checks, private profiles/addresses/orders, authentication rate limits, one-use password-reset tokens and session revocation. Old localStorage JWT sessions are retired; existing account passwords remain valid.
- Admin order search/status/date filters and pagination, controlled state transitions, payment recording, menu editing/archiving, customer records, support inbox, operational settings, paid-order reporting, best sellers and activity history.
- Same-origin development/production API proxies, environment examples, Node 24, CI checks, per-page metadata, private-route indexing headers, PWA icons and offline explanation. Private API/order responses are not cached.

## Verification

- Local production build and ESLint passed.
- All 13 backend tests and 6 frontend component tests passed. Upload regression coverage checks permissions, file-byte validation, persistent byte-for-byte retrieval, image deduplication, and saving an uploaded image to a menu item. Database integration tests use a uniquely named disposable database on the development cluster.
- GitHub Actions passed for the application commit.
- Vercel production deployment and both Render deployments reached ready/live states.
- Live HTTPS checks passed for public and nested SPA routes, the production JavaScript asset, both backend database-readiness endpoints, and the frontend API proxy.
- Live signup/login/current-user lookup passed with Secure, HttpOnly, SameSite=Lax cookies. Anonymous sessions were not exposed through caching; customer access to administrative endpoints was denied.
- Live demo checkout, duplicate-submission protection, cross-account order privacy, the admin queue, fulfilment transitions through completion, demo payment recording, customer status retrieval and logout passed.
- Live admin image upload passed through the frontend proxy. Retrieved bytes matched the original PNG; the secondary Render service served the same persistent image. Temporary image-test records were cleaned up.
- Temporary release-test accounts, sessions, orders and audit entries were removed. The original 3 users, 1 product and 4 orders remained after cleanup.
- Interactive screenshot/visual QA and physical mobile installation remain separate checks: the browser connection failed and Chrome control was not approved. Automated component/API checks do not establish visual correctness.

## Hosting configuration

Vercel builds `client/` with Node 24 and forwards `/api` to the primary Render service. Its SPA fallback supports direct navigation and refreshes of nested pages.

Both existing Render services share the same database. Each uses Node 24, `npm ci`, `npm start`, `/api/health`, production cookie settings, and the public frontend origin. Build filters watch `server/**` and `.node-version`; documentation-only commits do not restart the API. The secondary service was retained rather than removed.

A private owner-only database snapshot was saved before release. Backups, environment secrets, and local recovery-mail previews are ignored by Git and were checked before committing.

## Integration and business limits

- Stripe/online payments, native-store apps, social sign-in, coupons, loyalty, public reviews, GPS tracking and multi-restaurant operations are not implemented or advertised as working controls.
- Production password recovery needs an email provider and verified sender. Until configured, the API explicitly reports recovery as unavailable; development writes private mail previews to `server/.local-mail/`.
- Menu uploads use persistent MongoDB media storage, validated image bytes, content-hash deduplication and cacheable public image URLs. The unused legacy image-host credential was removed from Render. No separate image-host account is required.
- Opening hours are informational. The admin accepting-orders switch controls checkout availability. Confirm real service areas, prices, allergens, operating details and policies before changing from demo to real operations.

## Future deployments

Push reviewed changes to `main` after checks pass. Backend and frontend contracts must remain compatible or be released in a coordinated rollout. Preserve account roles/hashes and historical order snapshots; do not run preview seed code against production. A rollback must account for both the frontend/API versions and any configuration or data changes.
