import { useState } from "react";
import { useStore } from "../store";
import Modal from "./Modal";

interface NewCategoryModalProps {
  onClose: () => void;
  onCreated: (categoryId: string) => void;
}

export default function NewCategoryModal({ onClose, onCreated }: NewCategoryModalProps) {
  const { createCategory } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("Give your category a name.");
      return;
    }
    const id = createCategory(name);
    onCreated(id);
  }

  return (
    <Modal onClose={onClose} title="New section">
      <div className="flex flex-col gap-5 font-body text-ink dark:text-ink-dark">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
            Section name
          </span>
          <p className="font-body italic text-xs text-ink/50 dark:text-ink-dark/50">
            A section is whatever you want to rank things about — hobbies, gear, food,
            anything. You'll create lists inside it next.
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Board Games, Hiking Trails, Sneakers"
            className="field-underline mt-1 border-ink/40 text-sm focus:border-rule dark:border-ink-dark/40 dark:focus:border-rule-dark"
          />
        </label>

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
            Create section
          </button>
        </div>
      </div>
    </Modal>
  );
}
