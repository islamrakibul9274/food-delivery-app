# FOOD improvement plan

Status: Core local implementation is ready for review following the user’s approval. See RELEASE_NOTES.md for verified checks and remaining launch requirements.

## Product direction

Build a complete, polished single-restaurant ordering application using the current React/Vite, Express, MongoDB, Vercel, and Render stack. Keep the FOOD name and red brand accent initially. Use a separate preview database throughout implementation and review. Preserve the current production menu, users, and orders.

Working assumptions: one restaurant, delivery and pickup, English initially, configurable currency with USD retained until the owner selects a market, cash on delivery/pickup first, and no existing native app listings until confirmed. Multi-restaurant operations are a separate product scope.

## Verified baseline before implementation

- Navigation points to `/menu`, `/service`, and `/contact`, but those routes are absent.
- Most footer destinations, app-store buttons, and forgot-password links point to `#`.
- `CartPage` calls `removeFromCart`, which `CartContext` does not provide.
- Checkout immediately submits an order. It collects no delivery address, contact phone, delivery instructions, delivery/pickup choice, or payment method.
- The API trusts caller-supplied order prices, totals, and customer email.
- Backend product management, order management, and profile updates lack authentication/ownership checks. The frontend admin guard trusts localStorage.
- Authentication state is read separately by multiple components. There is no backend-backed current-user initialization or coordinated expiry handling.
- Google/Facebook controls and newsletter submission have no implementation.
- The mobile mockup is 252 x 514 pixels and displayed up to 400 CSS pixels wide. Store badges are 170 x 46 raster images displayed up to 56 CSS pixels high.
- Several image files are approximately 7 MB each. Current image delivery is unnecessarily heavy.
- Hero and download copy include placeholder text; the download section describes groceries despite the restaurant product.
- ESLint currently reports 10 errors. Earlier dependency installation reported advisories in both applications; these require triage, rather than an automatic force upgrade.
- The preview menu currently contains one product copied from production. A richer demo catalog must be limited to the preview database.
- Vercel deploys the `client` directory from `main`. Two Render services are linked to the same repository and `main`; the frontend uses `fast-food-backend-v1`. Review the purpose of the second service before release; do not delete or disable it without approval.

## 1. Foundation and backend security

Deliverables:

- Work on a feature branch; preserve the existing local CORS fix.
- Establish shared configuration, reliable start scripts, documented development setup, and `.env.example` files containing names/placeholders only.
- Replace hardcoded frontend API and backend origin configuration with validated environment settings.
- Implement server-verified authentication, current-user lookup, admin authorization, and ownership checks for profiles and orders.
- Coordinate frontend auth through a single provider. Handle loading, refresh, logout, expiry, profile updates, return-to-destination, and forbidden states consistently.
- Choose session transport deliberately: prefer an HttpOnly session cookie behind a same-origin `/api` proxy, with CSRF/origin protection, secure production flags, and tested proxy forwarding. Verify compatibility with Vercel and Render before changing production settings.
- Derive user identity from the authenticated session. Never authorize requests from browser-provided role/email alone.
- Validate inputs and identifiers, normalize emails, enforce unique accounts and appropriate password constraints, rate-limit authentication endpoints, and return safe consistent errors.
- Calculate order prices, fees, discounts, and availability on the server from catalog records. Store money in integer minor units and preserve item/price snapshots on orders.
- Restrict product updates to approved fields; enforce order state transitions; prevent duplicate order submission.
- Move image-upload credentials out of client source into protected server configuration. Coordinate rotation of the existing exposed credential before release.

Completion: unauthenticated requests fail with 401; non-admin management requests fail with 403; one customer cannot access another customer's profile/orders; editing localStorage or submitted prices cannot grant privileges or alter checkout totals.

## 2. Routing and missing pages

Use explicit public, authentication, account, and admin layouts; loading/error boundaries; lazy route modules where useful; page titles; scroll restoration; and a useful not-found page. Add the Vercel SPA fallback in the deployed frontend directory and verify direct loads/refreshes. Preserve redirects from current URLs when changing paths.

| Area | Proposed routes |
| --- | --- |
| Public | `/`, `/menu`, `/menu/:slug`, `/about`, `/how-it-works`, `/contact`, `/faq` |
| Policies | `/privacy`, `/terms`, `/delivery-policy`, `/refund-policy` |
| Authentication | `/login`, `/signup`, `/forgot-password`, `/reset-password/:token` |
| Ordering | `/cart`, `/checkout`, `/orders/:id/confirmation` |
| Account | `/account`, `/account/addresses`, `/account/orders`, `/account/orders/:id`, `/account/favorites` |
| Admin | `/admin`, `/admin/orders`, `/admin/orders/:id`, `/admin/menu`, `/admin/menu/new`, `/admin/menu/:id/edit`, `/admin/customers`, `/admin/settings` |
| Fallbacks | branded 404, unauthorized/forbidden, and recoverable route errors |

Redirect `/service` to `/how-it-works`, `/profile` to `/account`, `/my-orders` to `/account/orders`, and existing admin add/manage paths to their replacements. Link tracking to authenticated order details. Remove the blog link until there is actual editorial content. Replace the locations-map placeholder with real delivery-area information. Policy copy remains a draft pending owner confirmation of actual business practices.

Completion: every visible link has a useful destination; unknown URLs show a helpful 404; refreshing any valid nested route works; protected routes preserve the intended destination after login.

## 3. Design system and landing-page redesign

Visual direction: warm cream backgrounds, tomato-red calls to action, charcoal typography, fresh food imagery, clear spacing, restrained shadows, and fewer decorative gradients/blobs. Use one coherent icon family, consistent button/form/card styles, accessible focus states, readable contrast, and reduced-motion support. Retain the brand unless a rename is approved.

Landing-page sequence:

1. Clear restaurant promise and primary Browse menu action, with truthful operating/delivery information.
2. Featured dishes drawn from the catalog; every featured action opens a dish or adds a real available item.
3. Category exploration and useful menu previews.
4. A concise three-step ordering explanation.
5. Restaurant story, quality details, and genuine trust information.
6. Real offers when configured; otherwise omit the section.
7. Mobile ordering/install section.
8. FAQs and a compact, functional footer.

Replace placeholder copy and unsupported delivery promises. Show reviews/ratings only when genuine data is available; seed/demo reviews must be visibly identified in preview. Do not fabricate customer counts, sales trends, or testimonials.

### Phone and store assets

- Replace the blurry phone raster with a generic device frame containing a crisp representation of the redesigned mobile interface, built in HTML/CSS or captured at sufficient resolution. Avoid fake platform UI or stretched source images.
- If native listings exist, use official Apple/Google badge artwork, correct aspect ratios/spacing, accessible links, and real listing URLs. Do not redraw badges or apply prohibited badge transforms.
- If native apps do not exist, make the section promote the installable web app, with supported install instructions and a QR code to the deployed site. Keep native-store assets out of public calls to action until valid listings are confirmed.
- Optimize used food/auth/hero imagery into appropriately sized WebP/AVIF with fallback as needed, responsive sources, dimensions, and lazy loading below the fold. Do not preload the entire catalog.

Completion: phone/UI text remains crisp on high-density displays; no image distortion or horizontal overflow; all calls to action work; no false store availability claims; materially lower transferred image bytes.

## 4. Menu, cart, and checkout

First-release features:

- Dedicated menu with URL-persisted search, categories, sorting, price/dietary filters where actual product data supports them, availability labels, clear empty/error states, and retry controls.
- Product details with descriptions, ingredient/allergen information supplied by the restaurant, portion sizes, valid options/add-ons, and item notes.
- Always-visible add-to-cart controls, a mini-cart, mobile cart summary, reliable quantity/removal controls, persistent cart, and explicit unavailable/changed-price handling.
- Delivery/pickup choice, delivery address, phone, instructions, configured service area/opening hours, and transparent fee breakdown.
- A proper checkout confirmation and order number; preserve the cart if order creation fails.
- Cash on delivery/pickup initially. Model payment status separately from fulfilment status, so an order is not falsely represented as paid revenue.
- Prevent accidental duplicate orders and enforce item option/quantity constraints on the backend.

Completion: an end-to-end test can browse, customize, add/remove, sign in, return to checkout, place an order, and view confirmation. Invalid addresses, unavailable items, forged totals, and repeated submissions are handled intentionally.

## 5. Customer account and retention

- Unified profile, saved delivery addresses, order history/details, reordering with current availability/prices, favorites, and password change.
- Order timeline: placed, confirmed, preparing, out for delivery or ready for pickup, completed; support rejected/cancelled states and an explicit cancellation policy.
- Refresh order status with bounded polling first; consider live server events only when operational needs justify them. Do not present a status timeline as GPS tracking.
- Password-reset flow with short-lived one-use tokens, neutral responses, and an email provider once credentials/domain configuration are approved. Email verification can use the same delivery integration.
- Save notification preferences and use a real transactional email channel for confirmations/reset links once connected.
- Replace browser alerts with inline field errors, notices, and accessible toast messages.
- Contact form with validation/rate limiting, persisted support messages, and an admin support queue; email forwarding is optional once configured.

Completion: auth changes update navigation immediately, accounts/orders remain isolated, errors preserve user input, and password-reset links cannot be reused.

## 6. Admin operations and settings

- Order queue with search, date/status filters, pagination, customer/delivery details, and validated state updates.
- Menu editing with image preview/upload validation, categories, descriptions, options, availability, featured flags, and safe archive/delete behavior. Historical orders retain their original item snapshots.
- Customer list/details with relevant order history; exclude password hashes and restrict exports. Any role management receives explicit authorization and safeguards against self-lockout.
- Settings for restaurant details, contact information, timezone/currency, opening hours, fulfilment methods, delivery zones/fees/minimums, and genuine app/social links. Keep secrets in hosting configuration, not browser settings.
- Dashboard metrics with explicit definitions: paid revenue, completed orders, pending queue, average order value, and best sellers. Use date ranges/timezone consistently. Replace invented growth/business insights with computed values or omit them.
- Support inbox and an audit history for meaningful administrative changes.

Completion: an authorized admin can manage an order from placement to completion, alter preview menu availability, update operational settings, and see accurately defined metrics. Unauthorized clients cannot call these operations directly.

## 7. Performance, accessibility, and release verification

- Fix the current lint errors and remove unused/stale code through the refactor.
- Triage dependency advisories; apply compatible upgrades and assess breaking upgrades separately.
- Use shared API/query utilities with deduplication, cancellation, deliberate retries, and cache invalidation rather than repeated ad hoc effects.
- Add per-page metadata, descriptive social preview assets, a lightweight favicon, and appropriate sitemap/robots configuration. Keep account/admin pages out of indexing; evaluate prerendering public pages if search acquisition becomes a requirement.
- Build an installable PWA with a manifest, appropriate icons, and an offline explanation. Do not cache authenticated responses or silently queue orders offline.
- Meaningful API tests for authentication, authorization, ownership, checkout totals, duplicate submissions, and order transitions; browser tests for signup/login, cart/checkout, admin operations, navigation, and deep-link refresh.
- Manually review mobile/tablet/desktop layouts and keyboard flows; check focus handling, field labels, icon-button names, contrast, touch targets, and reduced motion.
- Measure page weight and representative Lighthouse runs under documented conditions. Aim for good Core Web Vitals (LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1); actual field performance requires production monitoring and adequate traffic.
- Database-aware readiness checks, structured logs with secret/PII redaction, clear failure states, and CI build/lint/test checks.

Completion: build/lint/critical tests pass, the principal customer/admin journeys work at agreed screen sizes, no dead links remain, and image/performance improvements are measured.

## Execution and review order

1. Foundation/security and route skeleton. Review authentication and route behavior locally.
2. Design system plus homepage, menu, and mobile-install section. Review the visual direction before applying it to every page.
3. Checkout/account/admin features and missing content pages. Review a full order lifecycle in the preview database.
4. Quality, security regression tests, deployment configuration, and a concrete release report.
5. Request separate production-release approval. Plan compatible backend/frontend sequencing or a coordinated release if contracts change; preserve existing account roles/password hashes, back up data, validate migrations, and identify rollback commits/configuration. Do not merge to `main` during local review because connected services may auto-deploy.

## Features to evaluate after the core release

- Online payments through a provider chosen for the operating country, including sandbox testing, verified webhooks, idempotency, refunds, and separate payment state.
- Genuine Google sign-in with configured OAuth credentials; remove inactive social buttons until then.
- Promotions/coupons and meal bundles with server-enforced rules, followed by verified-purchase reviews and moderation.
- Loyalty rewards, referrals, notifications, scheduled delivery, Bangla/localization, and richer business reporting when operational needs are confirmed.
- Native apps, driver GPS/maps, multi-restaurant marketplaces, and AI recommendations are separate projects rather than first-release dependencies.

## Decisions and authorization

Approved scope: implement the core roadmap locally on a feature branch using the separate preview database. Production merge/deployment remains excluded. Interactive browser review and external-service configuration are recorded separately in RELEASE_NOTES.md.

Helpful owner choices: target country/currency and service area; whether native app listings exist; desired brand/name; delivery versus pickup rules; and whether the project remains single-restaurant. Proposed defaults allow local work to begin without waiting for external provider accounts.

External service activation, real payments/emails, production credential rotation, hosting changes, database migrations, and production release require concrete configuration and owner authorization when those steps are reached.

## Reference material

- Vercel Vite deep linking: https://vercel.com/docs/frameworks/frontend/vite
- OWASP REST security: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- Apple badge and product-image guidance: https://developer.apple.com/app-store/marketing/guidelines/
