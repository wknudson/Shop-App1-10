import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { get, all } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  const { orderId } = await params;

  const order = get(
    `SELECT order_id, customer_id, order_datetime, fulfilled, order_subtotal,
            shipping_fee, tax_amount, order_total
     FROM orders WHERE order_id = ? AND customer_id = ?`,
    [orderId, customerId]
  );

  if (!order) notFound();

  const items = all(
    `SELECT oi.quantity, oi.unit_price, oi.line_total, p.product_name
     FROM order_items oi
     JOIN products p ON p.product_id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return (
    <>
      <h1>Order #{order.order_id}</h1>
      <p>
        <Link href="/orders">&larr; Back to Order History</Link>
      </p>

      <div className="card mb-3">
        <p><strong>Date:</strong> {order.order_datetime}</p>
        <p>
          <strong>Fulfilled:</strong>{" "}
          <span className={`badge ${order.fulfilled ? "badge-yes" : "badge-no"}`}>
            {order.fulfilled ? "Yes" : "No"}
          </span>
        </p>
      </div>

      <h2 className="mb-2">Line Items</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th className="text-right">Unit Price</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.product_name}</td>
              <td className="text-right">${item.unit_price.toFixed(2)}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">${item.line_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card mt-2">
        <table style={{ border: "none" }}>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td className="text-right">${order.order_subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td className="text-right">${order.shipping_fee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td className="text-right">${order.tax_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Order Total</strong></td>
              <td className="text-right"><strong>${order.order_total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
