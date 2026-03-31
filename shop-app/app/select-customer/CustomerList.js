"use client";

import { useState } from "react";
import { selectCustomer } from "./actions";

export default function CustomerList({ customers }) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      String(c.customer_id).includes(term)
    );
  });

  function handleSelect(customer) {
    selectCustomer(customer.customer_id, customer.full_name);
  }

  return (
    <>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>
      <p className="text-muted mb-2">{filtered.length} customers</p>
      <ul className="customer-list">
        {filtered.map((c) => (
          <li key={c.customer_id}>
            <button onClick={() => handleSelect(c)}>
              <strong>{c.full_name}</strong>
              <span className="customer-email">{c.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
