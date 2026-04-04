"""
FastAPI scoring + training service for Render.
Uses MLPipeline and SQL from run_inference.py (fraud pipeline).
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import joblib
import pandas as pd
import psycopg2
from fastapi import FastAPI, Header, HTTPException

from run_inference import MLPipeline, QUERY_SCORING_BATCH, QUERY_TRAINING_LABELED

app = FastAPI(title="Shop Fraud Scoring")

_JOBS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_JOBS_DIR, "fraud_model.joblib")


def _require_secret(x_scoring_secret: Optional[str]) -> None:
    expected = os.environ.get("SCORING_SECRET")
    if not expected:
        raise HTTPException(status_code=500, detail="SCORING_SECRET is not configured")
    if not x_scoring_secret or x_scoring_secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _connect():
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured")
    # Supabase often needs SSL; connection string usually includes sslmode=require
    return psycopg2.connect(url)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score")
def score(x_scoring_secret: Optional[str] = Header(None, alias="X-Scoring-Secret")):
    _require_secret(x_scoring_secret)
    if not os.path.isfile(MODEL_PATH):
        raise HTTPException(
            status_code=503,
            detail="Model not found. Run POST /train first or wait for the training job.",
        )

    pipeline = joblib.load(MODEL_PATH)
    conn = _connect()
    try:
        df = pd.read_sql_query(QUERY_SCORING_BATCH, conn)
    finally:
        conn.close()

    if df.empty:
        return {"scored": 0, "message": "No unfulfilled orders without predictions."}

    order_ids = df["order_id"].astype(int).tolist()
    X = df.drop(columns=["order_id"])
    proba = pipeline.predict_proba(X)[:, 1]
    ts = datetime.now(timezone.utc).isoformat()

    conn = _connect()
    try:
        cur = conn.cursor()
        for oid, p in zip(order_ids, proba):
            cur.execute(
                """
                INSERT INTO order_predictions (
                  order_id,
                  late_delivery_probability,
                  predicted_late_delivery,
                  prediction_timestamp,
                  fraud_probability
                ) VALUES (%s, NULL, NULL, %s, %s)
                ON CONFLICT (order_id) DO UPDATE SET
                  prediction_timestamp = EXCLUDED.prediction_timestamp,
                  fraud_probability = EXCLUDED.fraud_probability
                """,
                (int(oid), ts, float(p)),
            )
        conn.commit()
    finally:
        conn.close()

    print(f"scored {len(order_ids)} orders")
    return {"scored": len(order_ids), "message": "OK"}


@app.post("/train")
def train(x_scoring_secret: Optional[str] = Header(None, alias="X-Scoring-Secret")):
    _require_secret(x_scoring_secret)

    os.chdir(_JOBS_DIR)

    conn = _connect()
    try:
        df = pd.read_sql_query(QUERY_TRAINING_LABELED, conn)
    finally:
        conn.close()

    if df.empty or len(df) < 4:
        raise HTTPException(
            status_code=400,
            detail="Not enough labeled orders (need admin_fraud_label set on multiple rows).",
        )

    y = df["admin_fraud_label"]
    if y.nunique() < 2:
        raise HTTPException(
            status_code=400,
            detail="Training requires at least one legit (0) and one fraud (1) labeled order.",
        )

    try:
        pipe = MLPipeline(
            df=df,
            target="admin_fraud_label",
            models=["lr", "rf", "gb"],
            tune=True,
            output_path=MODEL_PATH,
            drop_cols=["order_id"],
            cat_strategy="onehot",
            scale=True,
            test_size=0.2,
            random_state=42,
            cv_folds=5,
            verbose=False,
        )
        pipe.run()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return {"status": "ok", "trained_rows": len(df), "model_path": MODEL_PATH}
