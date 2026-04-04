import Link from "next/link";
import ScoringButton from "./ScoringButton";

export const dynamic = "force-dynamic";

export default function ScoringPage() {
  return (
    <>
      <h1>Run Scoring</h1>
      <p className="text-muted mb-3">
        This calls the Render scoring API (<code>POST /score</code>). It scores unfulfilled
        orders that are not yet in <code>order_predictions</code> and writes fraud
        probabilities. Then open the{" "}
        <Link href="/warehouse/priority">priority queue</Link> to review and label orders.
      </p>
      <ScoringButton />
    </>
  );
}
