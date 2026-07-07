export type CategoryId = "shops" | "beans" | "orders";

export interface Category {
  id: CategoryId;
  label: string;
  singular: string;
}

export interface Criterion {
  id: string;
  name: string;
}

export interface Scores {
  [criterionId: string]: number;
}

export interface Item {
  id: string;
  name: string;
  notes: string;
  dateTried: string | null;
  photo: string | null;
  scores: Scores;
  createdAt: number;
}

export interface List {
  id: string;
  categoryId: CategoryId;
  name: string;
  criteria: Criterion[];
  items: Item[];
  createdAt: number;
}

export interface Tier {
  label: string;
  min: number;
  color: string;
}
