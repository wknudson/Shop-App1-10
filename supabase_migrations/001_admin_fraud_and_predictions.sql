-- Run in Supabase SQL Editor if the database was created before these columns existed.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_fraud_label INTEGER DEFAULT NULL;

ALTER TABLE order_predictions ADD COLUMN IF NOT EXISTS fraud_probability REAL;
