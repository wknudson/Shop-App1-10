"use server";

function extractErrorDetail(data) {
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((x) => x.msg || JSON.stringify(x)).join("; ");
  }
  return null;
}

export async function runScoring() {
  const base = process.env.SCORING_SERVICE_URL;
  const secret = process.env.SCORING_SECRET;
  const ts = new Date().toISOString();

  if (!base || !secret) {
    return {
      success: false,
      message: "SCORING_SERVICE_URL or SCORING_SECRET is not configured on the server.",
      count: null,
      stdout: "",
      stderr: "",
      timestamp: ts,
    };
  }

  const url = `${base.replace(/\/$/, "")}/score`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Scoring-Secret": secret,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      const detail = extractErrorDetail(data) || text || res.statusText;
      return {
        success: false,
        message: detail,
        count: null,
        stdout: text,
        stderr: "",
        timestamp: ts,
      };
    }

    const count = typeof data.scored === "number" ? data.scored : null;

    return {
      success: true,
      message: data.message || "Scoring completed successfully.",
      count,
      stdout: text,
      stderr: "",
      timestamp: ts,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Request to scoring service failed.",
      count: null,
      stdout: "",
      stderr: "",
      timestamp: ts,
    };
  }
}
