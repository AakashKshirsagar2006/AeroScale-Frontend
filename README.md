# AeroScale Frontend

React 18 + Vite + Tailwind v4. Two parts so far:

- **Auth**: login, 3-step sign-up (buyer / seller), silent session restore, automatic token refresh, role-based routing.
- **Seller module**: dashboard, product create / edit / archive with photo upload and live preview, stock top-ups, orders (ship and deliver), analytics charts, flash-sale scheduling, business settings. Spec of its endpoints: **[BACKEND_SELLER.md](./BACKEND_SELLER.md)**. Try it with `npm run dev:mock` and log in as `seller@aeroscale.com`.
- **Buyer dashboard**: home with live flash sales and an infinitely scrolling catalogue, flash-sales page, product page, cart, checkout with Razorpay, orders, account (profile and addresses).

## Run it

```bash
npm install
cp .env.example .env      # set VITE_PROXY_TARGET if your backend is not on :8080
npm run dev               # http://localhost:5173
```

The backend has no CORS config, so in dev Vite proxies `/api` to Spring. Nothing to change on the backend to run locally.

### See the buyer dashboard without the new endpoints

```bash
npm run dev:mock          # fake backend in the browser: 28 products, 14 flash sales, cart, orders, addresses
```

Log in with any email (for example `buyer@aeroscale.com`) and any valid password (for example `Passw0rd!`). Payments are simulated. Data survives reloads; the mock's responses are the exact shapes listed in **[BACKEND_REQUIRED.md](./BACKEND_REQUIRED.md)**, which is the list of endpoints and fields your backend still needs.

| script | what it does |
|--------|--------------|
| `npm run dev` | real backend through the Vite proxy |
| `npm run dev:mock` | everything served from the browser |
| `npm run build` | production build (mock code is not included) |

Set `VITE_SIMULATE_PAYMENT=true` in `.env` to skip Razorpay against a real backend (it calls `POST /api/v1/orders/{id}/simulate-payment`).

## How it is organised

```
src/
  app/                 route table, buyer layout (navbar, bottom nav), pages. The only place features meet
    pages/             Home, FlashSales, ProductDetail, Cart, Checkout, Orders, Account
    components/        InfiniteProductGrid (loads a page, then the next as you scroll)
  shared/              things every feature can use
    http/              axios client: token, one-shot refresh, error parsing, server clock (sale timers follow the SERVER time)
    lib/               useInfiniteList, useNow (one timer for every countdown), createStore, format helpers
    mock/              the in-browser fake backend (dev:mock only)
    storage/           tokenStorage.js: the only file that knows where tokens live
    config/            env + feature flags (features.js)
    ui/                Button, Input, PasswordInput, Alert, Logo...
  features/
    auth/              sign-in, sign-up, session, route guards
    catalog/           products and flash sales: api, sale rules (LIVE / UPCOMING / ENDED), cards, timers
    cart/              cart store with optimistic updates and per-product limits
    orders/            checkout, orders list, Razorpay popup, stock-hold timer
    account/           profile and delivery addresses
    seller/            seller profile store, verification badge, business details form
    seller-products/   create / edit form, photo picker, live preview, stock, cards
    seller-orders/     seller order cards, ship / deliver
    seller-analytics/  analytics api, insights, top products
    seller-flash-sales/ schedule form, sale cards
  shared/charts/       AreaChart, BarChart, DonutChart, Sparkline (pure SVG, no chart library)
  app/seller/          seller layout, pages and routes
```

Rules that keep it loosely coupled:

- A feature imports other features only through their `index.js`, and everything else from `shared/`.
- `shared/` never imports a feature. The auth feature plugs its refresh logic into the HTTP client (`configureHttp`).
- Only `authMapper.js` knows the backend's field names (`bussinessAdress`, `wareHousePinCode`, `DOB`...). If the DTOs change, that is the one file to edit.

## Adding the next module (catalog, cart, seller tools...)

1. Create `src/features/catalog/` with its own `api/`, `components/`, `pages/` and an `index.js`.
2. Call the backend with `import { http } from '@/shared/http/client'`. The Bearer token and the expired-token refresh come for free.
3. Add its routes in `src/app/routes.jsx`, wrapped in `<ProtectedRoute roles={['BUYER']}>`.
4. Need the current user? `const { user } = useAuth()` from `@/features/auth`.

Replace the placeholder pages in `src/app/pages/DashboardStub.jsx` with the real ones as you build them.

## Switching on Google / GitHub / Forgot password

All three are already in the UI, disabled with a "Soon" tag. When the backend supports them, flip the flag in `src/shared/config/features.js` and pass an `onSelect` handler to `SocialButtons`.

## Backend notes (nothing was changed on the backend)

| # | What | Why it matters | Suggested fix |
|---|------|----------------|---------------|
| 1 | **Locked accounts never unlock.** `login()` only checks `isAccountNotLocked()`, and that flag is reset only by a successful login, which a locked user cannot do. `accountLockedUntil` is saved but never read. | After 5 wrong passwords a user stays locked forever, while the message says "try again after some time". | In `login()`, if `accountLockedUntil` is in the past, set `accountNotLocked = true` and `failedLoginAttempt = 0`, then continue; otherwise throw `AccountLockedException`. Also `Users.isAccountCurrentlyLocked()` compares with `isBefore(now)`, which is inverted (it is true once the lock has ended). |
| 2 | **No CORS configuration.** | Fine in dev (proxy). In production a browser on another origin is blocked. | Serve the frontend and API from the same origin behind a reverse proxy, or add `.cors(...)` in `Configurations`. |
| 3 | **JSON key spelling** (`dob`, `uuid`, `expiresInSec`) is inferred from Lombok + Jackson, not from a real response. | A wrong guess breaks sign-up or login immediately. | The mapper accepts either casing on responses and sends both `dob` and `DOB`. After the first real call, check the network tab and trim `authMapper.js`. |
| 4 | Errors are mostly plain text, not JSON. | Already handled by `parseApiError()`. | Optional: return `{ message }` JSON everywhere for consistency. |

## How the dashboard behaves

- **Two kinds of product.** Regular products come from `GET /catalog/products?type=REGULAR`, flash-sale products from `GET /catalog/flash-sales`. A sale card shows the discount, a live countdown and a "claimed" bar; when its timer reaches zero the card flips to "Sale ended" by itself.
- **Never everything at once.** Home loads 8 sales and 12 products. The next 12 are requested only when the end of the list nears the screen. Changing a filter restarts from page 0.
- **Cart limits are enforced in the UI** (stock and the per-customer sale cap) so the buyer is told before the server has to refuse.
- **Checkout is retry-safe.** One idempotency key per attempt: a double click or a retry after a network drop cannot create two orders. Closing the Razorpay popup leaves the order PENDING with a hold timer, and the buyer can pay again or cancel.

## What is verified

`npm run build` is clean. The auth and buyer flows were exercised end to end in a simulated browser (24 automated checks) and in a real headless Chrome with screenshots: validation, sign-up, session refresh, page-by-page loading, add to cart and the sale limit, search and filters, checkout through the Razorpay path (success, popup closed, retry, cancel), pending orders, profile and addresses. It has **not** been run against your live backend, and the Razorpay popup itself was replaced by a stand-in, so please test one real payment.
