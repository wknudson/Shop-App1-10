"use client";

import { useState } from "react";
import { placeOrder } from "./actions";

export default function OrderForm({ products }) {
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addRow() {
    setItems([...items, { product_id: "", quantity: 1 }]);
  }

  function removeRow(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function getLineTotal(item) {
    const product = products.find((p) => p.product_id === Number(item.product_id));
    if (!product || !item.quantity) return 0;
    return product.price * item.quantity;
  }

  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const shipping = 9.99;
  const tax = Math.round(subtotal * 0.07 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validItems = items.filter((item) => item.product_id && item.quantity >= 1);
    if (validItems.length === 0) {
      setError("Add at least one line item with a product and quantity.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("items", JSON.stringify(validItems.map((i) => ({
        product_id: Number(i.product_id),
        quantity: Number(i.quantity),
      }))));
      await placeOrder(fd);
    } catch (err) {
      setError(err.message || "Failed to place order.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="msg-error">{error}</div>}

      <table className="line-items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style={{ width: 100 }}>Qty</th>
            <th style={{ width: 120 }} className="text-right">Line Total</th>
            <th style={{ width: 50 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(i, "product_id", e.target.value)}
                  required
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} — ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                  style={{ width: 80 }}
                />
              </td>
              <td className="text-right">${getLineTotal(item).toFixed(2)}</td>
              <td>
                {items.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeRow(i)}>
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="btn btn-primary mb-3" onClick={addRow}>
        + Add Item
      </button>

      <div className="card">
        <table style={{ border: "none" }}>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td className="text-right">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td className="text-right">${shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (7%)</td>
              <td className="text-right">${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td className="text-right"><strong>${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button type="submit" className="btn btn-success" disabled={submitting}>
        {submitting ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}
