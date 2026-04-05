"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "../../lib/db";

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

  await sql.begin(async (tx) => {
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const [product] = await tx.unsafe(
        `SELECT price FROM products WHERE product_id = $1`,
        [item.product_id]
      );
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      resolvedItems.push({ ...item, unit_price: product.price, line_total: lineTotal });
    }

    const shippingFee = 9.99;
    const taxAmount = Math.round(subtotal * 0.07 * 100) / 100;
    const orderTotal = Math.round((subtotal + shippingFee + taxAmount) * 100) / 100;

    const [inserted] = await tx.unsafe(`
      INSERT INTO orders (
        customer_id, order_datetime, billing_zip, shipping_zip, shipping_state,
        payment_method, device_type, ip_country, promo_used,
        order_subtotal, shipping_fee, tax_amount, order_total,
        risk_score, is_fraud, fulfilled
      ) VALUES (
        $1, NOW(), '', '', '',
        'card', 'web', 'US', 0,
        $2, $3, $4, $5,
        0.0, 0, 0
      ) RETURNING order_id
    `, [customerId, subtotal, shippingFee, taxAmount, orderTotal]);

    for (const item of resolvedItems) {
      await tx.unsafe(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
        VALUES ($1, $2, $3, $4, $5)
      `, [inserted.order_id, item.product_id, item.quantity, item.unit_price, item.line_total]);
    }

    await tx.unsafe(`
      INSERT INTO shipments (order_id, ship_datetime, carrier, shipping_method, 
      distance_band, promised_days, actual_days, late_delivery)
      VALUES ($1, NOW(), 'UPS', 'ground', 'medium', 5, 4, 0)
    `, [inserted.order_id]);
  });

  redirect("/orders?placed=1");
}
