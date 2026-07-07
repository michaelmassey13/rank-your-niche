import type { Criterion, Item, Tier } from "../types";

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

export const TIERS: Tier[] = [
  { label: "S", min: 9, color: "#f43f5e" },
  { label: "A", min: 7.5, color: "#f97316" },
  { label: "B", min: 6, color: "#eab308" },
  { label: "C", min: 4.5, color: "#22c55e" },
  { label: "D", min: 0, color: "#64748b" },
];

export function overallScore(item: Item, criteria: Criterion[]): number | null {
  if (criteria.length === 0) return null;
  const values = criteria
    .map((c) => item.scores[c.id])
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export function tierFor(score: number | null): Tier {
  if (score === null) return TIERS[TIERS.length - 1];
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

export function rankItems(items: Item[], criteria: Criterion[]) {
  return [...items]
    .map((item) => ({ item, score: overallScore(item, criteria) }))
    .sort((a, b) => {
      if (a.score === null && b.score === null) return b.item.createdAt - a.item.createdAt;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
}
