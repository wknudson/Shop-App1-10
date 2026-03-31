function runMigrations(db) {
  const columns = db.pragma("table_info(orders)");
  const hasFulfilled = columns.some((col) => col.name === "fulfilled");

  if (!hasFulfilled) {
    db.exec(`ALTER TABLE orders ADD COLUMN fulfilled INTEGER NOT NULL DEFAULT 0`);
    db.exec(
      `UPDATE orders SET fulfilled = 1 WHERE order_id IN (SELECT order_id FROM shipments)`
    );
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_predictions (
      order_id              INTEGER PRIMARY KEY,
      late_delivery_probability REAL,
      predicted_late_delivery   INTEGER,
      prediction_timestamp      TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    )
  `);
}

module.exports = { runMigrations };
