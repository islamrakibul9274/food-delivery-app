# Local redesign — review build

Branch: `improve/restaurant-experience`. No commits have been pushed, no production deployments triggered, and no production user/menu/order records changed.

## Available locally

- New storefront, menu and dish details; URL-based category/search/sort filters; vegetarian filter; favorites; consistent navigation/footer; complete supporting pages and helpful fallbacks.
- Warm, restrained typography and food photography. A CSS device preview replaces the blurry phone; an installable-web-app section replaces inactive store badges. No new AI imagery or invented customer reviews/ratings were used.
- Persistent bag with working removal/quantities, dish add-ons and notes; delivery/pickup checkout; server-priced totals and availability; cash payment; confirmation, status timeline, cancellation before confirmation, reorder with current menu prices.
- Cookie sessions, backend current-user/admin/ownership checks, authenticated profiles and addresses, rate limits, one-use password reset, and logout/session invalidation. The previous browser-stored JWT is no longer used. Existing preview passwords still work after signing in again.
- Admin overview with explicitly defined paid metrics and best sellers; order search/status/date filters and pagination; validated fulfilment transitions and cash-payment recording; dish editing/archiving; customer order counts; support inbox; restaurant settings and activity history.
- Same-origin development/API proxy, environment examples, one-command development startup, SPA deployment configuration, basic metadata/indexing rules, PWA icons/offline explanation, and CI checks.
- Public assets reduced from 45.85 MB to approximately 0.80 MB. This is a file-size comparison, not a measured page-speed or field Core Web Vitals result.

## Verification

- Backend: 12 passing tests, including real MongoDB integration in a unique disposable test database. Tests cover cookie sessions, authorization, ownership, forged prices, duplicate orders, lifecycle transitions, payment reporting, archive snapshots, support privacy, password reset replay, and dish add-on pricing.
- Frontend: 6 passing component tests in an in-memory DOM, covering menu search/filtering, dish options/cart totals, item removal, login return destination, forged localStorage admin role, and preservation of the cart after failed checkout.
- Frontend build and ESLint pass. Compatible dependency updates cleared the advisories reported by npm at implementation time.
- Local API readiness, 21 SPA route responses and 8 public assets passed HTTP checks. The actual frontend proxy also passed signup, HttpOnly cookie forwarding, current-user session lookup, admin denial and logout checks; the disposable check account was removed afterward.
- Interactive browser/visual QA is outstanding: the computer-use browser connection failed to load its request-header policy and native Chrome access was denied. No claim is made that a real-browser interaction, screenshot review, Lighthouse audit, or physical mobile install test has passed.

## Owner decisions before public launch

- Confirm the real menu, imagery, prices, allergens, operating location, contact details, delivery areas/fees, minimum order, currency/timezone and opening hours. Sample dishes/settings are confined to the preview database. Opening hours are display text; staff use the accepting-orders switch to close the kitchen.
- Review business policies and legal contact/jurisdiction/retention details; policy pages are explicit preview drafts.
- Configure transactional email and an approved sending address for real password-recovery email. Development writes private mail previews to ignored `server/.local-mail/` files. Production recovery is unavailable until configured.
- Configure server-side image hosting if file upload is needed, and rotate the previously exposed browser image-upload credential separately. Bundled food images and HTTPS URLs already work.
- Cash is the only implemented payment method. Native apps, social sign-in, online payments/webhooks/refunds, coupons, public reviews, loyalty, GPS tracking and multi-restaurant operations remain future scope. No nonfunctional controls advertise those capabilities.
- Review responsive rendering, keyboard use, actual PWA installation, browser cookie/proxy behavior, and accessibility in a real browser before production approval.

## Production release boundary

Both Vercel and two Render services follow `main`. Before merge, identify the second service's purpose, back up production, review the API contract change, and agree a coordinated or compatible staged release. No hosting service should be removed automatically.

Keep the existing production password hashes and roles. New optional product fields and new order fields are additive; legacy orders with no `userId` remain scoped to their authenticated account email, and old totals remain readable. Plan any backfill explicitly rather than automatically running preview seed code against production.

The new cookie session contract needs the frontend `/api` proxy. Set the backend production origin/URL variables, initialize restaurant settings, test production-like Secure cookies on a staging origin, and verify account/order privacy before promoting. Rollback requires compatible frontend/API commits and restoration of any changed configuration; do not roll back only one side of an incompatible contract.
