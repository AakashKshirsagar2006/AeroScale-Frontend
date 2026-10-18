# What the seller UI needs from the backend

Everything the seller module calls, with the exact JSON names it sends and expects. Section A is what already exists in your backend (nothing to change). Sections B and C are what to add. The in-browser mock (`npm run dev:mock`, log in as `seller@aeroscale.com`) returns exactly these shapes, so `src/shared/mock/sellerMock.js` is a working example of every response.

All endpoints need `Authorization: Bearer <access token>` and the SELLER role (`@PreAuthorize("hasRole('SELLER')")`). Money is a JSON number in rupees. Times are ISO-8601 UTC (`2026-10-11T12:14:36Z`). IDs are UUID strings. Pages are Spring's `Page` (`content`, `totalElements`, `totalPages`, `number`, `size`, `first`, `last`).

| # | Endpoint | Kind | Used by |
|---|----------|------|---------|
| A1 | `PUT /api/seller/updateProfile` | exists | Settings |
| A2 | `POST /api/v1/seller/products` (multipart) | exists | Add product |
| A3 | `PUT /api/v1/seller/products/{id}` (multipart) | exists | Edit product |
| A4 | `GET /api/v1/seller/products/{id}` | exists | Edit product |
| A5 | `PATCH /api/v1/seller/products/{id}/stock` | exists | Add stock |
| A6 | `DELETE /api/v1/seller/products/{id}` | exists | Archive |
| A7 | `POST /api/v1/flash-sales` | exists | Schedule sale |
| B1 | `GET /api/seller/profile` | **new** | Dashboard, menu, settings |
| B2 | `GET /api/v1/seller/products` | **extend** | Products page |
| B3 | `GET /api/v1/seller/orders` | **new** | Orders page, dashboard (returns a plain `List`) |
| B4 | `PATCH /api/v1/seller/orders/{orderId}/status` (`orderId` = order ITEM id) | **new** | Ship / deliver |
| B5 | `GET /api/v1/seller/analytics?days=` | **new** | Analytics page, dashboard chart |
| B6 | `GET /api/v1/flash-sales` | **new** | Flash sales page |
| B7 | `DELETE /api/v1/flash-sales/{id}` | **new** | Cancel a sale |
| C | Seller entity and order bookkeeping | data change | Revenue and order counters |

---

## A. Existing endpoints (no change needed)

### A1. `PUT /api/seller/updateProfile` -> `201`, empty body
```json
{ "bussinessName": "Rahul Electronics", "dob": "1990-03-22T00:00:00Z", "DOB": "1990-03-22T00:00:00Z",
  "bussinessAddress": "12 MG Road, Mumbai", "wareHousePincode": "400001" }
```
Spellings are the ones in `UpdateProfileRequest` (`bussinessName`, `bussinessAddress`, and `wareHousePincode` with a lower-case c). `dob` is sent twice (`dob` and `DOB`) because Lombok/Jackson naming for `DOB` is ambiguous; trim it to one after your first real call. `bussinessName` and `dob` are required, the other two optional. Errors are the usual Spring validation text, which the UI already parses.

### A2 / A3. `POST /api/v1/seller/products` and `PUT /api/v1/seller/products/{id}`
`Content-Type: multipart/form-data` with two parts:

| part | type | content |
|------|------|---------|
| `product` | `application/json` | `{ "name": "...", "description": "...", "price": 29990.00, "status": "ACTIVE" }` |
| `image` | file, optional | JPG/PNG/WebP, max 5 MB. On update, leave it out to keep the current photo |

`status` is `DRAFT`, `ACTIVE` or `ARCHIVED`. Response `201` (create) / `200` (update): `ProductResponse` (see B2). Validation errors are your ProblemDetail with an `errors` map (`{ "name": "...", "price": "..." }`); the UI puts each message under its field.

The create form also has "Units in stock". There is no stock in `ProductRequest`, so the UI makes **two calls**: create, then A5 with that quantity. Nothing to add.

### A4. `GET /api/v1/seller/products/{id}` -> `ProductResponse`. `404` ProblemDetail when it is not the caller's.

### A5. `PATCH /api/v1/seller/products/{id}/stock`
Request `{ "quantity": 50 }` (integer >= 1). Adds to `Inventory.totalStock`. Response `200`, no body.

### A6. `DELETE /api/v1/seller/products/{id}` -> `204`. Soft delete (status becomes `ARCHIVED`). The UI calls this "Archive" and lets the seller bring it back by editing the product and setting it to `ACTIVE`.

### A7. `POST /api/v1/flash-sales` -> `201`, empty body
```json
{ "productId": "7f1c...", "startTime": "2026-10-20T10:00:00Z", "endTime": "2026-10-21T10:00:00Z",
  "maxItemsPerUser": 2, "salePrice": 49999.00, "totalQuantity": 40 }
```
Same as `ScheduleFlashSaleRequest`. The UI already checks: start in the future, end after start, sale price below the product price, quantity not above available stock, per-user limit not above quantity.

---

## B. New and extended endpoints

### B1. `GET /api/seller/profile` (new)
No input. One call powers the dashboard, the top-bar menu and Settings. Build it from the `Seller` row plus the email from `Users`. **Do not return the entity**; return this DTO:

```json
{
  "id": "9b0a...",
  "email": "rahul@shop.com",
  "bussinessName": "Rahul Electronics",
  "bussinessAddress": "12 MG Road, Mumbai",
  "wareHousePinCode": "400001",
  "dob": "1990-03-22T00:00:00Z",
  "verificationStatus": "VERIFIED",
  "rating": 4.6,
  "totalOrdersFullFilled": 128,
  "totalRevenue": 1843250.00,
  "maxConcurrentFlashSaleSlots": 5,
  "createdAt": "2026-03-01T09:00:00Z"
}
```

| field | type | source |
|-------|------|--------|
| `id` | uuid | `Seller.id` |
| `email` | string | `Users.email` |
| `bussinessName`, `bussinessAddress`, `wareHousePinCode` | string, last two nullable | same-named `Seller` fields (note the entity field is `wareHousePinCode` with a capital C here) |
| `dob` | instant | `Seller.DateOfBirth`; the key must be `dob` |
| `verificationStatus` | `PENDING` / `VERIFIED` / `REJECTED` / `SUSPENDED` | `Seller.sellerVerificationStatus` |
| `rating` | number | `Seller.rating` |
| `totalOrdersFullFilled` | integer | `Seller.totalOrdersFullFilled`. The UI labels it "Total orders" |
| `totalRevenue` | number | **new** `Seller.totalRevenue` (section C) |
| `maxConcurrentFlashSaleSlots` | integer | `Seller.maxConcurrentFlashSaleSlots` |
| `createdAt` | instant | `Seller.createdAt` |

Bank fields (`gstin`, account number, IFSC) are deliberately not in this DTO and not used anywhere in the UI.

### B2. `GET /api/v1/seller/products` (extend) and `ProductResponse`

**New optional query params** (existing `page`, `size`, `sort` stay):

| name | type | rule |
|------|------|------|
| `status` | `DRAFT` / `ACTIVE` / `ARCHIVED` | omit = all three |
| `q` | string | case-insensitive "contains" on name |
| `sort` | string | `createdAt,desc` (default), `price,asc`, `price,desc`, `name,asc`. Reject anything else with `400` |

The UI sends `page`, `size` (12), `sort`, and `status` / `q` only when set.

**`ProductResponse` gains two fields** (everything else stays):
```json
{ "id": "3d52...", "sellerId": "9b0a...", "name": "Sony WH-1000XM5", "description": "...", "price": 29990.00,
  "imageUrl": "https://res.cloudinary.com/...", "status": "ACTIVE",
  "createdAt": "2026-09-01T08:00:00Z", "updatedAt": "2026-10-10T08:00:00Z",
  "totalStock": 55, "availableStock": 42 }
```
`totalStock` = `Inventory.totalStock`, `availableStock` = `Inventory.getAvailableStock()` (total minus locked). Load inventory for the whole page in one query (`findAllByProductIdIn`) to avoid N+1. If you skip these two fields the UI still works but shows "Stock not available".

### B3. `GET /api/v1/seller/orders` (new)
**One row = one order item** (one product, one status). The status lives on `OrderItem`, so a seller only ever sees and changes their own lines, even when an order holds items from several sellers.

Query: `status` optional: `CONFIRMED` / `SHIPPED` / `DELIVERED` / `CANCELLED` (the status of the item). No paging params: the endpoint answers a plain `List`. Newest first (order by the parent order's `createdAt` descending) because the UI shows the list in the order it receives it.

Which rows: `OrderItem` where `sellerId = <caller>`, and whose parent order is paid (no unpaid items).

Response: `List<SellerOrderResponse>`
```json
[
  {
    "orderId": "4c1e...",
    "status": "CONFIRMED",
    "shippingAddress": { "recipientName": "Rahul Sharma", "recipientPhoneNo": "+919876543210", "addressLine1": "12 MG Road",
                         "addressLine2": "", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "country": "India" },
    "item": { "productId": "7f1c...", "productName": "iPhone 15", "imageUrl": "https://...", "quantity": 1,
              "unitPrice": 49999.00, "subTotal": 49999.00 },
    "sellerTotal": 49999.00
  }
]
```

| field | meaning |
|-------|---------|
| `orderId` | **the order item's id** (this is the id the UI sends to B4) |
| `status` | the item's own status |
| `shippingAddress` | the order's `OrderAddress` snapshot |
| `item` | a single `ProductDetails` object (not a list): `productId`, `productName`, `imageUrl`, `quantity`, `unitPrice`, `subTotal` |
| `sellerTotal` | what the seller earns from this row (= `item.subTotal`) |

`createdAt` is **not** in the DTO, so the UI hides the "Received on" date. If you add `createdAt` (Instant) later, the card shows it automatically.

The UI downloads this list once per tab and pages it on the client (8 per scroll). That is fine for hundreds of rows. If it grows into thousands, return a Spring `Page` instead: only `src/features/seller-orders/api/sellerOrderApi.js` changes.

### B4. `PATCH /api/v1/seller/orders/{orderId}/status` (new)
`{orderId}` is the **order item id** (the `orderId` value from B3). Request `{ "status": "SHIPPED" }` or `{ "status": "DELIVERED" }`. Response `204`.

Rules: load the item by id and check `item.sellerId == caller` (else `404`). Allowed moves: `CONFIRMED -> SHIPPED -> DELIVERED`. Anything else: `409` ProblemDetail with a readable `detail`. Only that one item changes, so other sellers are never affected.

### B5. `GET /api/v1/seller/analytics?days=30` (new)
`days` is `7`, `30` or `90` (default 30). One call feeds every chart.

```json
{
  "rangeDays": 30, "from": "2026-09-17", "to": "2026-10-16",
  "summary": { "revenue": 412300.00, "orders": 96, "unitsSold": 131,
               "previousRevenue": 350100.00, "previousOrders": 80, "previousUnitsSold": 109 },
  "daily": [ { "date": "2026-10-15", "revenue": 18200.00, "orders": 4, "unitsSold": 5 } ],
  "statusBreakdown": [ { "status": "DELIVERED", "count": 70 }, { "status": "SHIPPED", "count": 12 },
                       { "status": "CONFIRMED", "count": 14 }, { "status": "CANCELLED", "count": 5 } ],
  "topProducts": [ { "productId": "7f1c...", "name": "iPhone 15", "imageUrl": "https://...", "unitsSold": 22, "revenue": 1099978.00 } ],
  "revenueBySource": { "flashSale": 150000.00, "regular": 262300.00 }
}
```

| field | rule |
|-------|------|
| `summary.*` | Paid items only (`CONFIRMED`, `SHIPPED`, `DELIVERED`) where `sellerId` is the caller. `orders` counts items, the same unit as the Orders page. `previous*` is the same measure for the `days` days just before `from` (the UI shows the percent change) |
| `daily` | One row per calendar day with sales, keyed `yyyy-MM-dd`. Days with no sales **may be left out**: the UI fills them with zeros. Day = the parent order's `createdAt` (it is not in the B3 DTO, but you have it in the same service). Use one fixed zone (for example UTC or IST) for the day boundary and for `from` / `to` |
| `statusBreakdown` | Items received in the range for each status, **including** `CANCELLED` |
| `topProducts` | Top 5 by revenue |
| `revenueBySource` | Revenue from items bought at a flash price vs the regular price. Needs one new column, see section C |

"Profit": the system has no cost price, so the UI shows **revenue** and its trend. If you later add `Product.costPrice` the same endpoint can return `profit` per day and the chart can switch to it.

### B6. `GET /api/v1/flash-sales` (new)
The caller's own sales, newest first. Query: `page`, `size` (8), `status` optional (`SCHEDULED` / `ACTIVE` / `ENDED` / `CANCELLED`). Response `Page<SellerFlashSaleResponse>`:

```json
{ "id": "a2d9...", "productId": "7f1c...", "productName": "iPhone 15", "imageUrl": "https://...",
  "productPrice": 69900.00, "salePrice": 49999.00, "discountPercent": 28,
  "startTime": "2026-10-20T10:00:00Z", "endTime": "2026-10-21T10:00:00Z",
  "maxItemsPerUser": 2, "totalQuantity": 100, "soldQuantity": 82, "status": "ACTIVE" }
```
`status` is `FlashSale.status`. The UI shows Live / Scheduled / Ended from the times and the server clock, and shows Cancelled when `status` is `CANCELLED`.

### B7. `DELETE /api/v1/flash-sales/{id}` (new)
`204` on success. Only a sale that has not started (`SCHEDULED`) can be cancelled: set it to `CANCELLED`. Otherwise `409` ProblemDetail. Not the caller's sale: `404`.

---

## C. Data and bookkeeping changes

1. **`Seller.totalRevenue`**: `@Column(nullable = false, precision = 14, scale = 2) private BigDecimal totalRevenue = BigDecimal.ZERO;` (`@Builder.Default`).
2. **Keep the counters current when payment is confirmed**: for each item of the order, add `subTotal` to that item's seller `totalRevenue` and add 1 to `totalOrdersFullFilled` (one per item, the same unit the seller sees in the Orders list). If `Seller` lives in a different service from orders, publish an event with `sellerId` and the amount and let the seller service apply it with an atomic update (`totalRevenue = totalRevenue + :amount`), **idempotently** (a retried event must not count twice). Doing it at payment (not at delivery) keeps "Total revenue" and the analytics page telling the same story. If you want it at delivery instead, B5 must then count only `DELIVERED`.
3. **Existing sellers and orders**: backfill `totalRevenue` once from confirmed `OrderItem`s. Old items also need `sellerId`, `productName` and `imageUrl` filled once (ask the product service per distinct `productId`).
4. **`OrderItem.flashSale` (boolean, default false)**: set to true at checkout when the unit price was the flash price. Only used by `revenueBySource`; if you skip it, return `{ "flashSale": 0, "regular": <all revenue> }`.
5. **`OrderItem` carries what the seller screens need** (copied at checkout, because orders and products can be separate services): `sellerId` (index it together with the order id), `productName`, `imageUrl`, its own `status`, and the `flashSale` flag from point 4. The buyer's order status can then be derived from its items (all delivered = delivered).

## Small things noticed in the current seller code
- `SellerServiceImpl.updateProfile` uses `findById(id).get()`; use `orElseThrow` so a missing row is a clean 404.
- `updateProfile` answers `201`; `200` or `204` is the correct code (the UI accepts any 2xx).
- Nothing blocks an unverified seller from publishing. The UI shows their verification badge but does not restrict them; enforce it in `createProduct` if you want it.
