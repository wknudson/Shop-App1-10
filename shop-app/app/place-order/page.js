import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { all } from "../../lib/db";
import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function PlaceOrderPage() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("customer_id")?.value;
  if (!customerId) redirect("/select-customer");

  const products = all(
    `SELECT product_id, product_name, price FROM products WHERE is_active = 1 ORDER BY product_name`
  );

  return (
    <>
      <h1>Place Order</h1>
      <p className="text-muted mb-3">
        Add products and quantities, then submit to create a new order.
      </p>
      <OrderForm products={products} />
    </>
  );
}
