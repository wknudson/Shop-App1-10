"use client";

import { useTransition } from "react";
import { labelOrder } from "./actions";

export default function LabelButton({ orderId, disabled = false }) {
  const [pending, startTransition] = useTransition();

  function onLegit() {
    startTransition(async () => {
      await labelOrder(orderId, 0);
    });
  }

  function onFraud() {
    startTransition(async () => {
      await labelOrder(orderId, 1);
    });
  }

  return (
    <div className="label-actions" style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn"
        style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
        disabled={disabled || pending}
        onClick={onLegit}
      >
        ✓ Legit
      </button>
      <button
        type="button"
        className="btn btn-danger"
        style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
        disabled={disabled || pending}
        onClick={onFraud}
      >
        ✗ Fraud
      </button>
    </div>
  );
}
