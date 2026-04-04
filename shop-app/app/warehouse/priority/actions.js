"use server";

import { revalidatePath } from "next/cache";
import { run } from "../../../lib/db";

export async function labelOrder(orderId, label) {
  const id = Number(orderId);
  const lbl = Number(label);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Invalid order id");
  }
  if (lbl !== 0 && lbl !== 1) {
    throw new Error("Label must be 0 (legit) or 1 (fraud)");
  }

  await run(`UPDATE orders SET admin_fraud_label = ? WHERE order_id = ?`, [lbl, id]);
  revalidatePath("/warehouse/priority");
}
