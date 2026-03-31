import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { all } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  const params = await searchParams;
  const justPlaced = params?.placed === "1";

  const orders = all(
    `SELECT order_id, order_datetime, fulfilled, order_total
     FROM orders WHERE customer_id = ?
     ORDER BY order_datetime DESC`,
    [customerId]
  );

  return (
    <>
      <h1>Order History</h1>
      {justPlaced && (
        <div className="msg-success">Order placed successfully!</div>
      )}
      {orders.length === 0 ? (
        <p className="text-muted">No orders yet. <Link href="/place-order">Place your first order.</Link></p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Fulfilled</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>
                  <Link href={`/orders/${o.order_id}`}>#{o.order_id}</Link>
                </td>
                <td>{o.order_datetime}</td>
                <td>
                  <span className={`badge ${o.fulfilled ? "badge-yes" : "badge-no"}`}>
                    {o.fulfilled ? "Yes" : "No"}
                  </span>
                </td>
                <td className="text-right">${o.order_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
