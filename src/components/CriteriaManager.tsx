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
      <div className="flex flex-col gap-4 font-body text-ink dark:text-ink-dark">
        <p className="font-body italic text-xs text-ink/50 dark:text-ink-dark/50">
          Removing a criterion drops it from every item's score. Adding one gives existing
          items a default of 5 until you edit them.
        </p>
        <div className="flex flex-col gap-2">
          {list.criteria.length === 0 && (
            <p className="font-body italic text-sm text-ink/40 dark:text-ink-dark/40">
              No criteria yet.
            </p>
          )}
          {list.criteria.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 border-b border-ink/20 pb-2 dark:border-ink-dark/20"
            >
              <input
                value={c.name}
                onChange={(e) => renameCriterion(list.id, c.id, e.target.value)}
                className="field-underline flex-1 border-none text-sm"
              />
              <button
                type="button"
                onClick={() => removeCriterion(list.id, c.id)}
                className="font-mono text-[11px] uppercase tracking-widest text-ink/40 hover:text-rule dark:text-ink-dark/40 dark:hover:text-rule-dark"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-3 border-b border-ink/40 pb-1 dark:border-ink-dark/40">
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
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder:italic"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="font-mono text-xs uppercase tracking-widest text-rule hover:underline dark:text-rule-dark"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex justify-end font-mono text-xs uppercase tracking-widest">
          <button
            type="button"
            onClick={onClose}
            className="border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-paper dark:border-ink-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
