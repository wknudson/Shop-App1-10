"use server";

import { execFile } from "child_process";
import path from "path";

export async function runScoring() {
  const scriptPath = path.join(process.cwd(), "..", "jobs", "run_inference.py");

  return new Promise((resolve) => {
    execFile(
      "python3",
      [scriptPath],
      { timeout: 60000, cwd: path.join(process.cwd(), "..") },
      (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            message: error.message,
            stderr: stderr || "",
            stdout: stdout || "",
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const countMatch = stdout.match(/scored\s+(\d+)/i);
        const count = countMatch ? parseInt(countMatch[1]) : null;

        resolve({
          success: true,
          message: "Scoring completed successfully.",
          count,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          timestamp: new Date().toISOString(),
        });
      }
    );
  });
}
