# FOOD

A restaurant ordering application with a React storefront, an Express API, MongoDB persistence, and an authenticated admin workspace.

## Live deployment

| Application | Link |
| --- | --- |
| Website | **[Open FOOD](https://food-delivery-app-smoky-sigma.vercel.app)** |
| Menu | https://food-delivery-app-smoky-sigma.vercel.app/menu |
| Admin workspace | https://food-delivery-app-smoky-sigma.vercel.app/admin |
| Backend API | https://fast-food-backend-v1.onrender.com |
| Database health check | https://fast-food-backend-v1.onrender.com/api/health |

**The deployed application runs in demo mode.** Orders are for testing; no food is delivered and no payment is collected. Delivery areas and pickup details are clearly labeled samples. The menu and existing accounts are retained from the original application.

The backend uses Render's free tier, so the first request after inactivity can take longer while the service starts.

## Features

### Ordering

- Search, category and vegetarian filters, price sorting, and shareable menu URLs.
- Dish details, allergen notes, optional add-ons, favorites, and a persistent shopping bag.
- Delivery or pickup checkout with contact details, instructions, and server-calculated totals.
- Duplicate-order protection, confirmation, status updates, pending-order cancellation, and reordering.
- Cash-payment workflow; in demo mode it represents a test payment only. Stripe is not integrated.

### Accounts

- Signup and login using HttpOnly sessions, with backend role and ownership checks.
- Profile editing, saved addresses, favorites, password changes, and order history.
- One-use password reset tokens. Real recovery emails require an email provider; see configuration below.

### Administration

- Paid-order reporting, best sellers, recent activity, and an order queue with search, status/date filters, and pagination.
- Controlled order-status transitions and cash-payment recording.
- Dish creation/editing, availability, featured items, add-ons, persistent image uploads (up to 4 MB), HTTPS image URLs, and archiving that preserves order history.
- Customer records, support-message inbox, and restaurant settings for fulfilment, fees, currency, hours, and demo mode.

### Interface

- Responsive storefront and dashboard, complete supporting pages, legacy URL redirects, and helpful error/empty states.
- Optimized food photography and a crisp mobile-menu preview built with HTML/CSS.
- Add-to-home-screen support and an offline explanation; orders and private API responses are not cached.

## Stack

React 19 · Vite 7 · React Router · Express 5 · Mongoose/MongoDB · Node.js 24

The frontend deploys to Vercel from `client/`. The API deploys to Render from `server/`. Browser requests use a same-origin `/api` proxy so authentication cookies remain on the website's origin.

## Run locally

Use Node.js 24 and a separate development MongoDB database.

```sh
git clone https://github.com/islamrakibul9274/food-delivery-app.git
cd food-delivery-app
npm run setup
cp -n server/.env.example server/.env
```

Set `MONGODB_URI` in `server/.env`, then start both applications:

```sh
npm run dev
```

Open **http://localhost:5173**. The API runs on port 5000. New databases start with ordering paused; an administrator can configure the restaurant before enabling ordering. Administrator roles are assigned in the database, never through public signup.

Environment files, private database snapshots, local mail previews, build output, and dependencies are ignored by Git. Never commit production credentials or connect local order tests to the production database.

The optional preview seed is deliberately restricted to the isolated development database named in `server/scripts/seed-preview.js`; it cannot seed production.

## Checks

```sh
npm run build
npm run lint
npm test
```

- 13 backend tests cover sessions, permissions, order ownership, forged prices, duplicate orders, status transitions, payment reporting, archive history, support privacy, password reset replay, and add-on pricing.
- 6 frontend component tests cover menu filtering, add-ons, bag removal, login redirects, admin-route protection, and checkout failure recovery.
- Full backend integration tests require the isolated development database configuration. They create and remove a uniquely named disposable test database.
- GitHub Actions runs build, lint, frontend tests, and database-independent backend tests with Node.js 24.

## Configuration

| Server variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string; required |
| `NODE_ENV` | Set to `production` on Render for Secure cookies |
| `NODE_VERSION` | `24` on Render |
| `APP_URL` | Public website URL used in recovery emails |
| `ALLOWED_ORIGINS` | Comma-separated allowed website origins |
| `PORT` | Optional locally; Render supplies its port |
| `RESEND_API_KEY`, `MAIL_FROM` | Optional recovery-email service and verified sender |

`VITE_API_URL` can override the frontend API address. Leave it unset for the existing same-origin `/api` proxy.

In development, recovery emails are saved privately in `server/.local-mail/`. In production, password recovery reports that it is unavailable until an email provider is configured. Uploaded menu images are stored persistently in MongoDB and served through public, cacheable `/api/media/:id` URLs. Repeated identical uploads reuse the same stored image. No separate image-host account is required. HTTPS image URLs also work. No payment provider or native-app store listing is configured.

Opening hours are displayed as text; the admin accepting-orders switch controls whether checkout is available. Before real commercial use, replace sample service details, confirm menu/allergen information, configure integrations, and review the business policies.

## Deployment and verification

The production branch is `main`. Vercel builds with `npm run build` from `client`; Render installs with `npm ci` and starts with `npm start` from `server`. Render checks `/api/health` before routing traffic to a new deployment. Its build filters watch `server/**` and `.node-version` so documentation-only commits do not restart the API.

Two existing Render services are connected to this repository and share the same database. The website uses `fast-food-backend-v1`; the secondary `food-delivery-api` service is retained and receives the same backend updates.

The release passed the production build, ESLint, 19 automated tests, GitHub Actions, both hosting deployments, and live HTTPS authentication, order, and persistent-image-upload smoke checks. Release checks and current integration limits are recorded in [release notes](docs/RELEASE_NOTES.md). Photo sources are documented in [ASSETS.md](docs/ASSETS.md).
