# E-commerce Application – Architecture

## 1. Database schema (Supabase / PostgreSQL)

```
products
  id (uuid, PK)
  name, description, category (text)
  retail_price, wholesale_price (numeric)
  images (text[] or jsonb)
  created_at (timestamptz)

product_variants
  id (uuid, PK)
  product_id (uuid, FK → products.id, ON DELETE CASCADE)
  size, color (text)
  stock (integer, CHECK (stock >= 0))
  created_at (timestamptz)
  UNIQUE(product_id, size, color)

orders
  id (uuid, PK)
  order_number (text, UNIQUE)
  customer_phone (text)
  total_price (numeric)
  status (text: 'pending' | 'confirmed' | 'delivered' | 'cancelled')
  created_at (timestamptz)

order_items
  id (uuid, PK)
  order_id (uuid, FK → orders.id, ON DELETE CASCADE)
  product_id (uuid, FK → products.id)
  variant_id (uuid, FK → product_variants.id)
  quantity (integer, > 0)
  price (numeric)

suppliers
  id (uuid, PK)
  name, phone, email, address, notes (text)
```

**Stock safety:** Stock is decremented only after order and order_items are inserted. Decrement uses `UPDATE ... SET stock = stock - quantity WHERE id = ? AND stock >= quantity`; if any row is not updated (race / insufficient stock), the order is rolled back (compensation: delete order + order_items) and the client receives an error. For stronger consistency, use a Postgres function (single transaction) as documented in the codebase.

---

## 2. Folder structure

```
app/
  layout.tsx, page.tsx (home), globals.css
  products/page.tsx
  product/[id]/page.tsx
  admin/
    layout.tsx (optional: shared admin layout)
    dashboard/page.tsx
    products/page.tsx
    orders/page.tsx
    suppliers/page.tsx
    settings/page.tsx
  api/
    orders/route.ts (POST create order)

components/
  ui/           # shared UI components
    Navbar, CartDrawer, CartItem
    ProductCard, ProductGrid, ProductFilters, ProductGallery
    AdminSidebar, DashboardStats
  admin/        # admin-only components (optional)
    ProductForm, OrderStatusSelect, SupplierForm

lib/
  types.ts      # shared TypeScript types
  constants.ts  # order status, low-stock threshold, cart key
  supabase.ts   # Supabase client
  api.ts        # Supabase data access (products, variants, orders, suppliers)
  order.ts      # order creation + stock validation + atomic decrement
  cart.ts       # client cart (localStorage), order number, WhatsApp message
  utils.ts

hooks/
  use-toast.ts
```

---

## 3. Main components

| Component      | Role |
|----------------|------|
| **Navbar**     | Logo, search placeholder, links (Inicio, Productos), cart icon + count, CartDrawer. |
| **CartDrawer** | Cart list, phone input, “Guardar y WhatsApp”: validates stock → creates order via API → opens WhatsApp → clears cart. |
| **ProductGrid**| Grid of ProductCards (home + products page). |
| **ProductCard**| Image, name, price, link to `/product/[id]`. |
| **ProductGallery** | Main image + thumbnails on product detail. |
| **ProductFilters** | Category, price range, search; not used on home (only on /products). |
| **AdminSidebar** | Navigation for dashboard, products, orders, suppliers, settings. |
| **DashboardStats** | Cards: total products, orders, low stock, suppliers. |

---

## 4. Data flow

- **Home:** Server or client fetches featured products (e.g. `getProducts()` limit 4) → ProductGrid.
- **Products list:** Fetches all products (and optionally variants for stock) → ProductGrid + ProductFilters (client filter or server params).
- **Product detail:** Fetches product + variants by id → ProductGallery + variant selector → Add to cart writes to localStorage and dispatches `cartUpdated`.
- **Cart:** Read from localStorage; “Guardar y WhatsApp” → validate stock (API) → POST /api/orders → on success open WhatsApp and clear cart.
- **Admin:** All data from Supabase via `lib/api.ts` (getProducts, getOrders, getSuppliers, CRUD). Dashboard stats derived from these; orders table with status update; products/suppliers tables with add/edit/delete.

---

## 5. API logic

- **Reads:** `lib/api.ts` – getProducts, getProductById, getProductVariants, getOrders, getSuppliers. Used by pages and admin.
- **Writes (admin):** Same file – createProduct, updateProduct, deleteProduct, createProductVariant, updateProductVariant, updateOrderStatus, createSupplier, updateSupplier, deleteSupplier.
- **Order creation:** Only via **POST /api/orders** (Next.js route). Route:
  1. Parses body (customer_phone, items: { product_id, variant_id, quantity }).
  2. Calls `validateAndCreateOrder()` from `lib/order.ts`.
  3. `validateAndCreateOrder()`: calls a Supabase Postgres RPC (`create_order_and_decrement_stock`) that atomically:
     - valida stock,
     - crea `orders` + `order_items` (precio calculado en el backend),
     - descuenta stock en una sola transacción.

---

## 6. Stock management logic

- **Storage:** Stock lives in `product_variants.stock`.
- **Reservation:** No reservation table; stock is decremented at order creation only.
- **Atomicity:** The critical flow is executed inside Postgres via RPC so we avoid race conditions (overselling) under concurrent checkouts.

---

## 7. Order creation logic

1. Client: Cart + phone → POST /api/orders with `{ customer_phone, items }`.
2. API: Parse and validate body.
3. `validateAndCreateOrder(phone, items)`:
   - Calls Supabase RPC `create_order_and_decrement_stock(p_customer_phone, p_items)`.
   - Postgres validates stock, creates `orders` + `order_items`, computes prices from `products.retail_price`, and decrements stock atomically.
4. Return created order (and order_number) to client.
5. Client: show success, open WhatsApp, clear cart.

---

## 8. Admin dashboard modules

| Module       | Purpose |
|-------------|---------|
| **Dashboard** | Stats (products, orders, low stock, suppliers) + recent orders table. Data from Supabase. |
| **Productos** | Table: image, name, category, prices, stock (by variant), low-stock badge. Add / Edit / Delete product and variants. |
| **Pedidos**   | Table: order number, customer, total, status, date. Status dropdown updates via `updateOrderStatus`. Optional: view order detail (items). |
| **Proveedores** | Table: name, phone, email, address. Add / Edit / Delete. |
| **Configuración** | Save WhatsApp number and low-stock threshold (stored in `store_settings`). |

---

## 9. Production readiness

- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optional service role for admin-only ops).
- Stock: Validated + decremented atomically inside Postgres via RPC (`create_order_and_decrement_stock`).
- Orders: Created only via API; pricing computed in backend; order persisted before opening WhatsApp.
- UI: Loading and error states on list/detail and checkout; toasts for success/error.
- Admin: All modules wired to real data; no mock data in production path.
