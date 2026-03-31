"""
Placeholder inference script for the Shop App.

Finds unfulfilled orders that do not yet have predictions in order_predictions,
generates random late-delivery probabilities, and writes them to the database.

In a real pipeline, this would load a trained model artifact and compute
actual predictions based on order features.
"""

import sqlite3
import random
from datetime import datetime, timezone
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "shop.db")


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT o.order_id
        FROM orders o
        LEFT JOIN order_predictions p ON p.order_id = o.order_id
        WHERE o.fulfilled = 0 AND p.order_id IS NULL
    """)
    order_ids = [row[0] for row in cursor.fetchall()]

    if not order_ids:
        print("Scored 0 orders (all unfulfilled orders already have predictions).")
        conn.close()
        return

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    rows = []
    for order_id in order_ids:
        prob = round(random.random(), 4)
        predicted_late = 1 if prob > 0.5 else 0
        rows.append((order_id, prob, predicted_late, timestamp))

    cursor.executemany("""
        INSERT OR REPLACE INTO order_predictions
            (order_id, late_delivery_probability, predicted_late_delivery, prediction_timestamp)
        VALUES (?, ?, ?, ?)
    """, rows)

    conn.commit()
    conn.close()

    print(f"Scored {len(rows)} orders with placeholder predictions.")


if __name__ == "__main__":
    main()
