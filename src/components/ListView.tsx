import { useState } from "react";
import type { Item, List } from "../types";
import { useStore } from "../store";
import { rankItems } from "../utils/scoring";
import TierBadge from "./TierBadge";
import ItemModal from "./ItemModal";
import CriteriaManager from "./CriteriaManager";

export default function ListView({ list }: { list: List }) {
  const { renameList, addItem, updateItem, deleteItem } = useStore();
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [nameDraft, setNameDraft] = useState(list.name);
  const [editingName, setEditingName] = useState(false);
  const [managingCriteria, setManagingCriteria] = useState(false);

  const ranked = rankItems(list.items, list.criteria);

  function commitName() {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft.trim() !== list.name) {
      renameList(list.id, nameDraft.trim());
    } else {
      setNameDraft(list.name);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => e.key === "Enter" && commitName()}
              className="w-full rounded-lg border border-stone-300 px-2 py-1 text-2xl font-bold outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
            />
          ) : (
            <h1
              className="cursor-text text-2xl font-bold text-stone-800 dark:text-stone-100"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {list.name}
            </h1>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {list.criteria.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400"
              >
                {c.name}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setManagingCriteria(true)}
              className="text-xs text-amber-700 hover:underline dark:text-amber-400"
            >
              Edit criteria
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddingItem(true)}
          className="shrink-0 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          + Add item
        </button>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center text-stone-400 dark:border-stone-700">
          No items yet. Add your first one to start ranking.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranked.map(({ item, score }, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
            >
              <span className="w-6 shrink-0 text-center text-sm font-medium text-stone-400">
                {index + 1}
              </span>
              <TierBadge score={score} />
              {item.photo ? (
                <img
                  src={item.photo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg dark:bg-stone-800">
                  ☕
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-stone-800 dark:text-stone-100">
                    {item.name}
                  </span>
                  {score !== null && (
                    <span className="shrink-0 text-xs font-semibold text-stone-400">
                      {score.toFixed(1)}/10
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="truncate text-sm text-stone-500 dark:text-stone-400">
                    {item.notes}
                  </p>
                )}
                {item.dateTried && (
                  <p className="text-xs text-stone-400 dark:text-stone-600">{item.dateTried}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove "${item.name}" from this list?`)) {
                      deleteItem(list.id, item.id);
                    }
                  }}
                  className="rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {addingItem && (
        <ItemModal
          list={list}
          onClose={() => setAddingItem(false)}
          onSave={(item) => {
            addItem(list.id, item);
            setAddingItem(false);
          }}
        />
      )}

      {editingItem && (
        <ItemModal
          list={list}
          existingItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(item) => {
            updateItem(list.id, editingItem.id, item);
            setEditingItem(null);
          }}
        />
      )}

      {managingCriteria && (
        <CriteriaManager list={list} onClose={() => setManagingCriteria(false)} />
      )}
    </div>
  );
}
