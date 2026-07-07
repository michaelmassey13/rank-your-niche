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
    <Modal onClose={onClose} title="New category">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
            Category name
          </span>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            A category is whatever you want to rank things about — hobbies, gear, food,
            anything. You'll create lists inside it next.
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Board Games, Hiking Trails, Sneakers"
            className="mt-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
          />
        </label>

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
            Create category
          </button>
        </div>
      </div>
    </Modal>
  );
}
