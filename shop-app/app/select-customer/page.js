import { all } from "../../lib/db";
import CustomerList from "./CustomerList";

export const dynamic = "force-dynamic";

export default function SelectCustomerPage() {
  const customers = all(
    `SELECT customer_id, full_name, email FROM customers ORDER BY full_name`
  );

  return (
    <>
      <h1>Select Customer</h1>
      <p className="text-muted mb-3">
        Choose a customer to act as. No login required — just pick one.
      </p>
      <CustomerList customers={customers} />
    </>
  );
}
