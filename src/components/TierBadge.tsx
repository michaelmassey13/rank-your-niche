import { tierFor } from "../utils/scoring";

export default function TierBadge({ score }: { score: number | null }) {
  const tier = tierFor(score);
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
      style={{ backgroundColor: tier.color }}
      title={`Tier ${tier.label}`}
    >
      {tier.label}
    </div>
  );
}
