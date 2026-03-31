"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectCustomer(customerId, customerName) {
  const cookieStore = await cookies();
  cookieStore.set("customer_id", String(customerId), { path: "/" });
  cookieStore.set("customer_name", encodeURIComponent(customerName), { path: "/" });
  redirect("/dashboard");
}
