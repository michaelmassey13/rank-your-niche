import { useState } from "react";
import { CATEGORIES, useStore } from "../store";
import type { CategoryId } from "../types";
import Modal from "./Modal";

const DEFAULT_CRITERIA: Record<CategoryId, string[]> = {
  shops: ["Coffee Quality", "Ambiance", "Service", "Price"],
  beans: ["Aroma", "Flavor", "Freshness", "Value"],
  orders: ["Taste", "Temperature", "Presentation", "Worth It"],
};

interface NewListModalProps {
  categoryId: CategoryId;
  onClose: () => void;
  onCreated: (listId: string) => void;
}

export default function NewListModal({ categoryId, onClose, onCreated }: NewListModalProps) {
  const { createList } = useStore();
  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState<string[]>(DEFAULT_CRITERIA[categoryId]);
  const [criterionDraft, setCriterionDraft] = useState("");
  const [error, setError] = useState("");

  function addCriterion() {
    const trimmed = criterionDraft.trim();
    if (!trimmed) return;
    if (criteria.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCriterionDraft("");
      return;
    }
    setCriteria((c) => [...c, trimmed]);
    setCriterionDraft("");
  }

  function removeCriterion(index: number) {
    setCriteria((c) => c.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Give your list a name.");
      return;
    }
    if (criteria.length === 0) {
      setError("Add at least one criterion to score items on.");
      return;
    }
    const id = createList(categoryId, name, criteria);
    onCreated(id);
  }

  return (
    <Modal onClose={onClose} title={`New ${category.singular} list`}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
            List name
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g. ${
              categoryId === "shops"
                ? "Downtown Shops"
                : categoryId === "beans"
                  ? "Single Origin Beans"
                  : "Cold Brew Orders"
            }`}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
            Scoring criteria
          </span>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            What should this list score items on? Each item you add gets rated 1–10 on
            these.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {criteria.map((c, i) => (
              <span
                key={c + i}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeCriterion(i)}
                  className="text-amber-700 hover:text-red-600 dark:text-amber-300"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={criterionDraft}
              onChange={(e) => setCriterionDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCriterion();
                }
              }}
              placeholder="Add a criterion (e.g. Crema)"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
            />
            <button
              type="button"
              onClick={addCriterion}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              Add
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            Create list
          </button>
        </div>
      </div>
    </Modal>
  );
}
