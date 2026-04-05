import Link from "next/link";
import { all } from "../../../lib/db";
import LabelButton from "./LabelButton";

export const dynamic = "force-dynamic";

function formatPct(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function formatAdminLabel(v) {
  if (v == null) return <span className="text-muted">Unreviewed</span>;
  const n = Number(v);
  if (n === 0) return <span className="badge badge-yes">Legit</span>;
  if (n === 1) return <span className="badge badge-danger">Fraud</span>;
  return <span className="text-muted">Unreviewed</span>;
}

export default async function PriorityQueuePage() {
  const queue = await all(`
    SELECT
      o.order_id,
      o.order_datetime,
      o.order_total,
      o.fulfilled,
      o.admin_fraud_label,
      c.customer_id,
      c.full_name AS customer_name,
      p.predicted_late_delivery,
      p.prediction_timestamp,
      p.fraud_probability
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    JOIN order_predictions p ON p.order_id = o.order_id
    WHERE o.fulfilled = 0
    ORDER BY COALESCE(p.fraud_probability, p.late_delivery_probability) DESC NULLS LAST,
             o.order_datetime ASC
    LIMIT 50
  `);

  return (
    <>
      <h1>Fraud and fulfillment priority queue</h1>
      <div className="msg-info mb-3">
        Unfulfilled orders with ML scores, ranked by <strong>fraud probability</strong>. Label orders to build training data for the
        daily model retrain. Run <Link href="/scoring">scoring</Link> to score new orders.
      </div>

      {queue.length === 0 ? (
        <p className="text-muted">
          No predictions available yet. <Link href="/scoring">Run scoring</Link> to generate
          predictions for unfulfilled orders.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th className="text-right">Total</th>
              <th className="text-right">Fraud prob</th>
              <th>Predicted late</th>
              <th>Admin label</th>
              <th>Review</th>
              <th>Scored At</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((row) => (
              <tr key={row.order_id}>
                <td>
                  <Link href={`/orders/${row.order_id}`}>#{row.order_id}</Link>
                </td>
                <td>{row.customer_name}</td>
                <td>{row.order_datetime}</td>
                <td className="text-right">${Number(row.order_total).toFixed(2)}</td>
                <td className="text-right">{formatPct(row.fraud_probability)}</td>
                <td>
                  {row.predicted_late_delivery == null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span
                      className={`badge ${Number(row.predicted_late_delivery) === 1 ? "badge-danger" : "badge-yes"}`}
                    >
                      {Number(row.predicted_late_delivery) === 1 ? "Late" : "On time"}
                    </span>
                  )}
                </td>
                <td>{formatAdminLabel(row.admin_fraud_label)}</td>
                <td>
                  <LabelButton orderId={row.order_id} />
                </td>
                <td className="text-muted">{row.prediction_timestamp ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
