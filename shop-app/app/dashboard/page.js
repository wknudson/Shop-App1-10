import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { get, all } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  const customer = get(
    `SELECT full_name, email FROM customers WHERE customer_id = ?`,
    [customerId]
  );

  if (!customer) redirect("/select-customer");

  const stats = get(
    `SELECT COUNT(*) AS order_count, COALESCE(SUM(order_total), 0) AS total_spend
     FROM orders WHERE customer_id = ?`,
    [customerId]
  );

  const recentOrders = all(
    `SELECT order_id, order_datetime, fulfilled, order_total
     FROM orders WHERE customer_id = ?
     ORDER BY order_datetime DESC LIMIT 5`,
    [customerId]
  );

  return (
    <>
      <h1>Dashboard</h1>
      <div className="card mb-3">
        <h3>{customer.full_name}</h3>
        <p className="text-muted">{customer.email}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.order_count}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${stats.total_spend.toFixed(2)}</div>
          <div className="stat-label">Total Spend</div>
        </div>
      </div>

      <h2 className="mb-2">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
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
            {recentOrders.map((o) => (
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
