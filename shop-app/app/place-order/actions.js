"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../../lib/db";

export async function placeOrder(formData) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  const itemsJson = formData.get("items");
  if (!itemsJson) throw new Error("No line items provided");

  const items = JSON.parse(itemsJson);
  if (!items.length) throw new Error("At least one line item is required");

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity < 1) {
      throw new Error("Each line item needs a valid product and quantity >= 1");
    }
  }

  const db = getDb();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      customer_id, order_datetime, billing_zip, shipping_zip, shipping_state,
      payment_method, device_type, ip_country, promo_used,
      order_subtotal, shipping_fee, tax_amount, order_total,
      risk_score, is_fraud, fulfilled
    ) VALUES (
      ?, datetime('now'), '', '', '',
      'card', 'web', 'US', 0,
      ?, ?, ?, ?,
      0.0, 0, 0
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?)
  `);

  const getProduct = db.prepare(`SELECT price FROM products WHERE product_id = ?`);

  const placeTransaction = db.transaction(() => {
    let subtotal = 0;
    const resolvedItems = items.map((item) => {
      const product = getProduct.get(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      return { ...item, unit_price: product.price, line_total: lineTotal };
    });

    const shippingFee = 9.99;
    const taxAmount = Math.round(subtotal * 0.07 * 100) / 100;
    const orderTotal = Math.round((subtotal + shippingFee + taxAmount) * 100) / 100;

    const result = insertOrder.run(
      customerId, subtotal, shippingFee, taxAmount, orderTotal
    );
    const orderId = result.lastInsertRowid;

    for (const item of resolvedItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.unit_price, item.line_total);
    }

    return orderId;
  });

  placeTransaction();
  redirect("/orders?placed=1");
}
