import { tierFor } from "../utils/scoring";

export default function TierBadge({ score }: { score: number | null }) {
  const tier = tierFor(score);
  return (
    <div
      className="flex h-10 w-10 shrink-0 -rotate-6 items-center justify-center rounded-full border-2 font-display text-base font-bold"
      style={{ borderColor: tier.color, color: tier.color }}
      title={`Tier ${tier.label}`}
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full border border-dashed"
        style={{ borderColor: tier.color }}
      >
        {tier.label}
      </span>
    </div>
  );
}
