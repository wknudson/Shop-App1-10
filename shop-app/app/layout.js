import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Shop App",
  description: "In-Class CH 17 — ML Pipeline Web App",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  const customerName = cookieStore.get("customer_name")?.value;

  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <aside className="sidebar">
            <h2>Shop App</h2>
            <nav>
              <Link href="/select-customer">Select Customer</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/place-order">Place Order</Link>
              <Link href="/orders">Order History</Link>
              <Link href="/warehouse/priority">Priority Queue</Link>
              <Link href="/scoring">Run Scoring</Link>
              <Link href="/debug/schema">DB Schema</Link>
            </nav>
            {customerId && (
              <div className="customer-banner">
                Acting as
                <strong>{decodeURIComponent(customerName || `Customer #${customerId}`)}</strong>
              </div>
            )}
          </aside>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
