import { useState } from "react";
import { useStore } from "../store";
import Modal from "./Modal";

interface NewListModalProps {
  categoryId: string;
  onClose: () => void;
  onCreated: (listId: string) => void;
}

export default function NewListModal({ categoryId, onClose, onCreated }: NewListModalProps) {
  const { getCategory, createList } = useStore();
  const category = getCategory(categoryId);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState<string[]>([]);
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
    <Modal onClose={onClose} title={`New list in "${category?.name ?? ""}"`}>
      <div className="flex flex-col gap-5 font-body text-ink dark:text-ink-dark">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
            List name
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Top Picks"
            className="field-underline border-ink/40 text-sm focus:border-rule dark:border-ink-dark/40 dark:focus:border-rule-dark"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
            Scoring criteria
          </span>
          <p className="font-body italic text-xs text-ink/50 dark:text-ink-dark/50">
            What should this list score items on? Each item you add gets rated 1–10 on
            these.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {criteria.map((c, i) => (
              <span
                key={c + i}
                className="flex items-center gap-1.5 border border-ink/40 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink dark:border-ink-dark/40 dark:text-ink-dark"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeCriterion(i)}
                  className="text-ink/40 hover:text-rule dark:text-ink-dark/40 dark:hover:text-rule-dark"
                >
                  ✕
                </button>
              </span>
            ))}
            {criteria.length === 0 && (
              <span className="font-body italic text-xs text-ink/35 dark:text-ink-dark/35">
                No criteria added yet
              </span>
            )}
          </div>
          <div className="mt-2 flex gap-3 border-b border-ink/40 pb-1 dark:border-ink-dark/40">
            <input
              value={criterionDraft}
              onChange={(e) => setCriterionDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCriterion();
                }
              }}
              placeholder="Add a criterion (e.g. Quality, Price, Fun Factor)"
              className="flex-1 border-none bg-transparent text-sm outline-none placeholder:italic"
            />
            <button
              type="button"
              onClick={addCriterion}
              className="font-mono text-xs uppercase tracking-widest text-rule hover:underline dark:text-rule-dark"
            >
              Add
            </button>
          </div>
        </div>

        {error && <p className="font-mono text-xs text-rule dark:text-rule-dark">{error}</p>}

        <div className="mt-2 flex justify-end gap-4 border-t border-ink/20 pt-4 font-mono text-xs uppercase tracking-widest dark:border-ink-dark/20">
          <button
            type="button"
            onClick={onClose}
            className="text-ink/50 hover:text-rule dark:text-ink-dark/50 dark:hover:text-rule-dark"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-paper dark:border-ink-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
          >
            Create list
          </button>
        </div>
      </div>
    </Modal>
  );
}
