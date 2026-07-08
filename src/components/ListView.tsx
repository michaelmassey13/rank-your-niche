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
    <div className="mx-auto max-w-3xl px-8 py-10 font-body text-ink dark:text-ink-dark">
      <div className="mb-8 border-b-4 border-double border-ink pb-4 dark:border-ink-dark">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 dark:text-ink-dark/40">
              The Standings
            </div>
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === "Enter" && commitName()}
                className="field-underline mt-1 w-full font-display text-3xl font-bold text-ink dark:text-ink-dark"
              />
            ) : (
              <h1
                className="mt-1 cursor-text font-display text-3xl font-bold text-ink dark:text-ink-dark"
                onClick={() => setEditingName(true)}
                title="Click to rename"
              >
                {list.name}
              </h1>
            )}
            <div className="mt-2 font-body italic text-sm text-ink/60 dark:text-ink-dark/60">
              Filed under:{" "}
              {list.criteria.length === 0
                ? "nothing yet"
                : list.criteria.map((c) => c.name).join(" · ")}{" "}
              <button
                type="button"
                onClick={() => setManagingCriteria(true)}
                className="not-italic font-mono text-[11px] uppercase tracking-widest text-rule hover:underline dark:text-rule-dark"
              >
                edit
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddingItem(true)}
            className="shrink-0 border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink hover:bg-ink hover:text-paper dark:border-ink-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
          >
            + Add entry
          </button>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="border border-dashed border-ink/30 py-16 text-center font-body italic text-ink/40 dark:border-ink-dark/30 dark:text-ink-dark/40">
          This report has no entries yet. Add your first one to start ranking.
        </div>
      ) : (
        <ol className="flex flex-col">
          {ranked.map(({ item, score }, index) => (
            <li
              key={item.id}
              className="flex items-center gap-4 border-b border-ink/20 py-4 dark:border-ink-dark/20"
            >
              <span className="w-10 shrink-0 text-center font-display text-xl italic text-ink/30 dark:text-ink-dark/30">
                {index + 1}
              </span>
              <TierBadge score={score} />
              {item.photo ? (
                <img
                  src={item.photo}
                  alt=""
                  className="h-14 w-14 shrink-0 border border-ink/40 object-cover grayscale dark:border-ink-dark/40"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-ink/20 font-display text-lg italic text-ink/20 dark:border-ink-dark/20 dark:text-ink-dark/20">
                  §
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-display text-lg font-bold text-ink dark:text-ink-dark">
                    {item.name}
                  </span>
                  {score !== null && (
                    <span className="shrink-0 font-mono text-xs font-bold text-rule dark:text-rule-dark">
                      {score.toFixed(1)}/10
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="truncate font-body italic text-sm text-ink/60 dark:text-ink-dark/60">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
                {item.dateTried && (
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/35 dark:text-ink-dark/35">
                    Filed {item.dateTried}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="text-ink/50 hover:text-rule dark:text-ink-dark/50 dark:hover:text-rule-dark"
                >
                  Edit
                </button>
                <span className="text-ink/20 dark:text-ink-dark/20">·</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove "${item.name}" from this list?`)) {
                      deleteItem(list.id, item.id);
                    }
                  }}
                  className="text-ink/50 hover:text-rule dark:text-ink-dark/50 dark:hover:text-rule-dark"
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
