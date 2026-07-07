import { useState } from "react";
import type { List } from "../types";
import { useStore } from "../store";
import Modal from "./Modal";

export default function CriteriaManager({ list, onClose }: { list: List; onClose: () => void }) {
  const { addCriterion, removeCriterion, renameCriterion } = useStore();
  const [draft, setDraft] = useState("");

  function handleAdd() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addCriterion(list.id, trimmed);
    setDraft("");
  }

  return (
    <Modal title={`Criteria for "${list.name}"`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          Removing a criterion drops it from every item's score. Adding one gives existing
          items a default of 5 until you edit them.
        </p>
        <div className="flex flex-col gap-2">
          {list.criteria.length === 0 && (
            <p className="text-sm text-stone-400">No criteria yet.</p>
          )}
          {list.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                value={c.name}
                onChange={(e) => renameCriterion(list.id, c.id, e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
              />
              <button
                type="button"
                onClick={() => removeCriterion(list.id, c.id)}
                className="rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-900/20"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="New criterion name"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
