-- ============================================================
-- Supabase (PostgreSQL) schema for the Shop App
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- 1. Customers
CREATE TABLE customers (
  customer_id      SERIAL PRIMARY KEY,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  gender           TEXT NOT NULL,
  birthdate        TEXT NOT NULL,
  created_at       TEXT NOT NULL,
  city             TEXT,
  state            TEXT,
  zip_code         TEXT,
  customer_segment TEXT,
  loyalty_tier     TEXT,
  is_active        INTEGER NOT NULL DEFAULT 1
);

-- 2. Products
CREATE TABLE products (
  product_id   SERIAL PRIMARY KEY,
  sku          TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  category     TEXT NOT NULL,
  price        REAL NOT NULL,
  cost         REAL NOT NULL,
  is_active    INTEGER NOT NULL DEFAULT 1
);

-- 3. Orders
CREATE TABLE orders (
  order_id           SERIAL PRIMARY KEY,
  customer_id        INTEGER NOT NULL,
  order_datetime     TEXT NOT NULL,
  billing_zip        TEXT,
  shipping_zip       TEXT,
  shipping_state     TEXT,
  payment_method     TEXT NOT NULL,
  device_type        TEXT NOT NULL,
  ip_country         TEXT NOT NULL,
  promo_used         INTEGER NOT NULL DEFAULT 0,
  promo_code         TEXT,
  order_subtotal     REAL NOT NULL,
  shipping_fee       REAL NOT NULL,
  tax_amount         REAL NOT NULL,
  order_total        REAL NOT NULL,
  risk_score         REAL NOT NULL,
  is_fraud           INTEGER NOT NULL DEFAULT 0,
  fulfilled          INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- 4. Order Items
CREATE TABLE order_items (
  order_item_id  SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL,
  product_id     INTEGER NOT NULL,
  quantity       INTEGER NOT NULL,
  unit_price     REAL NOT NULL,
  line_total     REAL NOT NULL,

  FOREIGN KEY (order_id)   REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 5. Shipments
CREATE TABLE shipments (
  shipment_id        SERIAL PRIMARY KEY,
  order_id           INTEGER NOT NULL UNIQUE,
  ship_datetime      TEXT NOT NULL,
  carrier            TEXT NOT NULL,
  shipping_method    TEXT NOT NULL,
  distance_band      TEXT NOT NULL,
  promised_days      INTEGER NOT NULL,
  actual_days        INTEGER NOT NULL,
  late_delivery      INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 6. Product Reviews
CREATE TABLE product_reviews (
  review_id       SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL,
  product_id      INTEGER NOT NULL,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_datetime TEXT NOT NULL,
  review_text     TEXT,

  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (product_id)  REFERENCES products(product_id),

  UNIQUE(customer_id, product_id)
);

-- 7. Order Predictions (ML scoring results)
CREATE TABLE order_predictions (
  order_id                  INTEGER PRIMARY KEY,
  late_delivery_probability REAL,
  predicted_late_delivery   INTEGER,
  prediction_timestamp      TEXT,

  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ============================================================
-- Indexes (for faster queries)
-- ============================================================
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_datetime   ON orders(order_datetime);
CREATE INDEX idx_items_order       ON order_items(order_id);
CREATE INDEX idx_items_product     ON order_items(product_id);
CREATE INDEX idx_shipments_late    ON shipments(late_delivery);
CREATE INDEX idx_reviews_product   ON product_reviews(product_id);
CREATE INDEX idx_reviews_customer  ON product_reviews(customer_id);
