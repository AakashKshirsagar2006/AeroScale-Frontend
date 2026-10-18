# What the buyer UI needs from the backend

The buyer dashboard was built against your current backend plus the items below. Everything here is already implemented by the in-browser mock (`src/shared/mock/mockApi.js`, run with `npm run dev:mock`), so **the mock is a working example of every response shape in this file.**

All endpoints need `Authorization: Bearer <access token>` and a BUYER role. Money is a JSON number in rupees (`49999.00`). Times are ISO-8601 UTC (`2026-10-11T12:14:36Z`). IDs are UUID strings.

| # | What | Kind | Needed for |
|---|------|------|------------|
| 1 | `GET /api/v1/catalog/flash-sales` | **new endpoint** | Live / upcoming sales on Home and the Flash Sales page |
| 2 | `GET /api/v1/orders` | **new endpoint** | Orders page, paying a pending order later |
| 3 | `GET /api/buyer/profile` | **new endpoint** | Name in the menu, account page, wallet and points |
| 4 | `GET /api/v1/catalog/products` | extend existing | Search, filters, sorting, regular vs sale products |
| 5 | `GET /api/v1/catalog/products/{id}` | extend existing | Product page |
| 6 | `GET /api/cart/getCart` | extend existing | Flash price, per-user limit, image in the cart |
| 7 | `POST /api/v1/orders/checkout` | extend existing | Product names in the order, payment hold timer |
| 8 | Sale price is what gets charged | behaviour change | Correct totals |
| 9 | Flash sale status changes by itself | behaviour change | Purchases are accepted only while a sale is ACTIVE |
| 10 | `imageUrl` on products | data change | Product photos |

---

## 1. `GET /api/v1/catalog/flash-sales` (new)

Products that currently have a flash sale, one page at a time.

**Query parameters**

| name | type | default | notes |
|------|------|---------|-------|
| `page` | int >= 0 | 0 | zero based |
| `size` | int 1..50 | 8 | |
| `state` | `LIVE` or `UPCOMING` | `LIVE` | `LIVE`: started and not ended, sorted by `endTime` ascending (ends soonest first). `UPCOMING`: not started yet, sorted by `startTime` ascending |

**Response `200`**: a Spring `Page` whose `content` items are *catalog items* (see section 4 for the item shape). Here `flashSale` is **never null**.

```json
{
  "content": [
    {
      "id": "7f1c...", "name": "iPhone 15 (128GB)", "description": "…", "price": 69900.00,
      "status": "ACTIVE", "imageUrl": "https://cdn.example.com/iphone15.jpg", "availableStock": 18,
      "flashSale": {
        "id": "a2d9...", "state": "LIVE",
        "startTime": "2026-10-11T10:00:00Z", "endTime": "2026-10-11T12:14:36Z",
        "maxItemsPerUser": 2, "salePrice": 49999.00, "discountPercent": 28,
        "totalQuantity": 100, "soldQuantity": 82
      }
    }
  ],
  "totalElements": 14, "totalPages": 2, "number": 0, "size": 8, "first": true, "last": false
}
```

The UI only needs `last` (or `number` and `totalPages`) to know whether to ask for the next page.

**`flashSale` fields**

| field | type | meaning |
|-------|------|---------|
| `id` | uuid | the FlashSale row |
| `state` | `LIVE` / `UPCOMING` | `LIVE` when `status == ACTIVE` and `startTime <= now < endTime`. The UI re-checks this against the times, so a stale value is harmless |
| `startTime`, `endTime` | instant | drive the countdowns |
| `maxItemsPerUser` | int | already exists on `FlashSale` |
| `salePrice` | decimal | **new column** on `FlashSale`, must be below the product `price` |
| `discountPercent` | int | `round((price - salePrice) / price * 100)` |
| `totalQuantity` | int | **new column**: units set aside for this sale (not more than inventory `totalStock`) |
| `soldQuantity` | int | **new column** (or computed): units confirmed sold during the sale. Increment it inside `InventoryService.confirmStock` while the sale is ACTIVE. Used for the "82% claimed" bar |

`ScheduleFlashSaleRequest` therefore also needs `salePrice` (decimal, required, > 0) and `totalQuantity` (int, required, >= 1).

**Errors**: `400` for a bad `state`, `size` > 50.

---

## 2. `GET /api/v1/orders` (new)

The signed-in buyer's own orders, newest first.

**Query**: `page` (default 0), `size` (default 8, max 50).

**Response `200`**: `Page<OrderResponse>` where `OrderResponse` is your existing record with these additions:

```json
{
  "content": [
    {
      "orderId": "4c1e...", "buyerId": "9b0a...", "status": "PENDING",
      "totalAmount": 129998.00, "createdAt": "2026-10-11T11:52:03Z",
      "holdExpiresAt": "2026-10-11T11:57:03Z",
      "shippingAddress": { "recipientName": "Rahul Sharma", "recipientPhoneNo": "+919876543210", "addressLine1": "12 MG Road", "addressLine2": "", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "country": "India" },
      "items": [
        { "productId": "7f1c...", "productName": "iPhone 15 (128GB)", "imageUrl": "https://…", "quantity": 1, "unitPrice": 49999.00, "subTotal": 49999.00 }
      ],
      "razorPayOrderid": "order_Nx3…", "rzpKey": "rzp_test_…"
    }
  ],
  "totalElements": 1, "totalPages": 1, "number": 0, "size": 8, "first": true, "last": true
}
```

| new / changed field | rule |
|---------------------|------|
| `items[].productName` | new, product name at purchase time |
| `items[].imageUrl` | new, nullable |
| `holdExpiresAt` | new, `InventoryReservation.expiresAt` for a PENDING order, otherwise `null` |
| `razorPayOrderid`, `rzpKey` | filled **only for PENDING orders** (so the buyer can pay later), otherwise `null`. Use `paymentService.getRazorPayOrderId(orderId)` |

---

## 3. `GET /api/buyer/profile` (new)

```json
{ "id": "9b0a...", "fullName": "Rahul Sharma", "email": "rahul@example.com", "dob": "1998-05-14T00:00:00Z", "walletBalance": 1250.00, "loyaltyPoint": 340 }
```

`email` comes from `Users`, the rest from `Buyer`. No input.

---

## 4. `GET /api/v1/catalog/products` (extend)

**Query parameters** (everything except paging is optional):

| name | type | default | rule |
|------|------|---------|------|
| `page`, `size` | int | 0, 12 | `size` max 50 |
| `sort` | string | `createdAt,desc` | allowed: `createdAt,desc` · `price,asc` · `price,desc` · `name,asc`. Reject anything else with `400` |
| `q` | string | none | case-insensitive "contains" on name and description |
| `minPrice`, `maxPrice` | decimal | none | on the price the buyer pays now. Using plain `price` is fine to start |
| `inStock` | boolean | false | `true` = only `availableStock > 0` |
| `type` | `ALL` / `REGULAR` | `ALL` | `REGULAR` = products with **no** LIVE or UPCOMING flash sale. The Home page uses it so sale products are not shown twice |

Only `status = ACTIVE` products, as today.

**Response `200`**: `Page<CatalogItem>`:

```json
{
  "id": "3d52...", "name": "Sony WH-1000XM5 Headphones", "description": "…", "price": 29990.00,
  "status": "ACTIVE", "imageUrl": "https://… or null", "availableStock": 12,
  "flashSale": null
}
```

New fields on today's `CatalogResponse`: `imageUrl`, `availableStock` (`Inventory.getAvailableStock()`), `flashSale` (the object from section 1, or `null` when the product has no LIVE/UPCOMING sale).

## 5. `GET /api/v1/catalog/products/{id}` (extend)

Same `CatalogItem` shape as above. `flashSale` is `null` when the sale is ended or cancelled. Keep returning `404` (ProblemDetail) for unknown or non-ACTIVE products; the UI shows "This product is not available".

## 6. `GET /api/cart/getCart` (extend `CartResponse`)

Keep every current field. Add:

| field | type | rule |
|-------|------|------|
| `imageUrl` | string or null | product image |
| `originalPrice` | decimal or null | the regular price **only while a flash sale is LIVE**, else `null` |
| `maxItemsPerUser` | int or null | the sale's limit while LIVE, else `null` |
| `saleEndsAt` | instant or null | the sale's `endTime` while LIVE, else `null` |

And `pricePerItem` must be the **price the buyer will pay** (sale price while LIVE), see section 8.

## 7. `POST /api/v1/orders/checkout` (extend response)

Request is unchanged: `{ "shippingAddressId": "uuid", "idempotencyKey": "string (a UUID from the browser)" }`. The response is the same `OrderResponse` as section 2 (`productName`, `imageUrl`, `holdExpiresAt`) with `razorPayOrderid` and `rzpKey` filled, as today.

---

## 8. Charge the sale price (behaviour)

`CartServiceImp` and `OrderServiceImpl.createOrder` use `product.getPrice()`. While a sale is LIVE for the product they must use `flashSale.salePrice` instead, and `OrderItem.unitPriceAtPurchase` must store what was charged. A buyer is shown the sale price everywhere in the UI, so charging the regular price would be a visible mismatch.

## 9. Make the sale status change on its own (behaviour)

Nothing sets a `FlashSale` to `ACTIVE` or `ENDED` today, but `validateFlashSalePurchase` rejects anything that is not `ACTIVE`. Add a `@Scheduled` job (every 30 to 60 seconds): `SCHEDULED -> ACTIVE` when `startTime <= now`, `ACTIVE -> ENDED` when `endTime <= now`. The UI already judges LIVE / UPCOMING / ENDED from the times, so it will not flicker, but purchases will only work once the status follows.

## 10. Product images (data)

Add `imageUrl` (nullable string) to `Product` and to `ProductRequest`. Until a product has one, the UI draws a tinted tile with an icon, so nothing breaks.

---

## Optional, but worth knowing

- **`GET` endpoints answer `201`.** `getCart`, `getAllAddress` return `HttpStatus.CREATED`. The UI accepts any 2xx, so this works, but `200` is the correct code.
- **`addToCart` sets the quantity, it does not add to it.** The UI reads the current count and sends `current + n`, so nothing to change; just do not "fix" it to add without telling the frontend.
- **The cart is emptied when the order is created**, even if payment never completes. If the buyer cancels or lets the hold expire, the cart stays empty. A friendlier flow clears the cart when payment is confirmed instead.
- **One sale per product ever.** `existsByProductId` blocks scheduling a second sale for a product after the first has ended. Probably you want `existsByProductIdAndStatusIn(productId, [SCHEDULED, ACTIVE])`.
- **Dates**: the UI keeps countdowns correct even if the phone clock is wrong by reading the standard HTTP `Date` header of any response. No work needed, just do not strip that header in a proxy.
- **CORS**: still not configured (see the README). Needed once the frontend is served from a different origin than the API.

## JSON names the UI sends for existing endpoints (FYI)

Because of Lombok and Jackson naming, these are what actually travel on the wire. The UI already uses them; they are listed so you are not surprised in logs.

| DTO field | JSON key |
|-----------|----------|
| `AddAddressRequest.PhoneNo` | `phoneNo` |
| `AddAddressRequest.isDefault` and `AddAddressResponse.isDefault` | `default` |
| `UpdateCartItemRequest.Cartid` | `cartid` |
| `CartResponse.CurrentStockOfProduct` | `currentStockOfProduct` |
| `BuyerProfileUpdateRequest.Dob` | `dob` |
