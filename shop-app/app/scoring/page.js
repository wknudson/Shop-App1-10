import Link from "next/link";
import ScoringButton from "./ScoringButton";

export const dynamic = "force-dynamic";

export default function ScoringPage() {
  return (
    <>
      <h1>Run Scoring</h1>
      <p className="text-muted mb-3">
        Click the button below to run the ML inference script. It will score all
        unfulfilled orders that do not yet have predictions, writing results into the{" "}
        <code>order_predictions</code> table. After scoring, visit the{" "}
        <Link href="/warehouse/priority">Priority Queue</Link> to see updated results.
      </p>
      <ScoringButton />
    </>
  );
}
