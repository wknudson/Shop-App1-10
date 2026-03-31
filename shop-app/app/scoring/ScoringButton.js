"use client";

import { useState } from "react";
import { runScoring } from "./actions";

export default function ScoringButton() {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const res = await runScoring();
      setResult(res);
    } catch (err) {
      setResult({ success: false, message: err.message, timestamp: new Date().toISOString() });
    }
    setRunning(false);
  }

  return (
    <>
      <button className="btn btn-primary mb-3" onClick={handleRun} disabled={running}>
        {running ? "Running Inference..." : "Run Scoring"}
      </button>

      {result && (
        <div className={result.success ? "msg-success" : "msg-error"}>
          <p><strong>{result.success ? "Success" : "Error"}:</strong> {result.message}</p>
          {result.count !== null && result.count !== undefined && (
            <p>Orders scored: <strong>{result.count}</strong></p>
          )}
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Timestamp: {result.timestamp}
          </p>
          {result.stdout && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary>stdout</summary>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>{result.stdout}</pre>
            </details>
          )}
          {result.stderr && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary>stderr</summary>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>{result.stderr}</pre>
            </details>
          )}
        </div>
      )}
    </>
  );
}
