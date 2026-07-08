import { useState } from "react";
import { useAuth } from "../auth";
import { useStore } from "../store";

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
  onNewList: (categoryId: string) => void;
  onNewCategory: () => void;
  onListDeleted: (listId: string) => void;
}

export default function Sidebar({
  selectedListId,
  onSelectList,
  onNewList,
  onNewCategory,
  onListDeleted,
}: SidebarProps) {
  const { categories, listsByCategory, deleteList, renameCategory, deleteCategory } = useStore();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameDraft, setCategoryNameDraft] = useState("");

  function commitCategoryName(categoryId: string) {
    setEditingCategoryId(null);
    if (categoryNameDraft.trim()) {
      renameCategory(categoryId, categoryNameDraft.trim());
    }
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-ink/30 bg-paper font-body dark:border-ink-dark/30 dark:bg-paper-dark">
      <div className="border-b-4 border-double border-ink px-5 pb-4 pt-6 dark:border-ink-dark">
        <div className="text-center">
          <div className="font-display text-3xl font-black uppercase tracking-tight text-ink dark:text-ink-dark">
            Rank Your Niche
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50 dark:text-ink-dark/50">
            A Reader's Ranking Almanac
          </div>
        </div>
      </div>

      <div className="border-b border-ink/20 px-4 py-2.5 dark:border-ink-dark/20">
        <button
          type="button"
          onClick={onNewCategory}
          className="w-full border border-dashed border-ink/40 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink/60 hover:border-rule hover:text-rule dark:border-ink-dark/40 dark:text-ink-dark/60 dark:hover:text-rule-dark"
        >
          + New Section
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {categories.length === 0 && (
          <div className="px-1 py-4 font-body italic text-sm text-ink/40 dark:text-ink-dark/40">
            No sections yet. Start one to begin your almanac.
          </div>
        )}

        {categories.map((category) => {
          const lists = listsByCategory(category.id);
          const isCollapsed = collapsed[category.id];
          const isEditing = editingCategoryId === category.id;
          return (
            <div key={category.id} className="mb-5">
              <div className="group flex items-center justify-between gap-2 border-b border-ink/25 pb-1 dark:border-ink-dark/25">
                {isEditing ? (
                  <input
                    autoFocus
                    value={categoryNameDraft}
                    onChange={(e) => setCategoryNameDraft(e.target.value)}
                    onBlur={() => commitCategoryName(category.id)}
                    onKeyDown={(e) => e.key === "Enter" && commitCategoryName(category.id)}
                    className="field-underline flex-1 font-mono text-xs uppercase tracking-widest text-ink dark:text-ink-dark"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((c) => ({ ...c, [category.id]: !c[category.id] }))
                    }
                    onDoubleClick={() => {
                      setEditingCategoryId(category.id);
                      setCategoryNameDraft(category.name);
                    }}
                    title="Click to expand/collapse, double-click to rename"
                    className="flex min-w-0 items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-ink hover:text-rule dark:text-ink-dark dark:hover:text-rule-dark"
                  >
                    <span className={`shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>
                      ▾
                    </span>
                    <span className="truncate">{category.name}</span>
                  </button>
                )}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNewList(category.id)}
                    title={`New list in ${category.name}`}
                    className="font-mono text-xs text-ink/50 hover:text-rule dark:text-ink-dark/50 dark:hover:text-rule-dark"
                  >
                    +add
                  </button>
                  <button
                    type="button"
                    title="Delete category"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete "${category.name}" and all ${lists.length} list(s) inside it?`
                        )
                      ) {
                        if (lists.some((l) => l.id === selectedListId)) {
                          onListDeleted(selectedListId!);
                        }
                        deleteCategory(category.id);
                      }
                    }}
                    className="hidden font-mono text-xs text-ink/40 hover:text-rule group-hover:inline dark:text-ink-dark/40 dark:hover:text-rule-dark"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="mt-1.5 flex flex-col">
                  {lists.length === 0 && (
                    <div className="px-1 py-1.5 font-body text-xs italic text-ink/35 dark:text-ink-dark/35">
                      No entries yet
                    </div>
                  )}
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className={`group flex items-baseline gap-0 px-1 py-1.5 text-sm cursor-pointer ${
                        selectedListId === list.id
                          ? "text-rule dark:text-rule-dark"
                          : "text-ink/80 hover:text-rule dark:text-ink-dark/80 dark:hover:text-rule-dark"
                      }`}
                      onClick={() => onSelectList(list.id)}
                    >
                      <span className="truncate font-body italic">{list.name}</span>
                      <span className="toc-leader" />
                      <button
                        type="button"
                        title="Delete list"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${list.name}" and all its items?`)) {
                            deleteList(list.id);
                            onListDeleted(list.id);
                          }
                        }}
                        className="ml-1 hidden shrink-0 font-mono text-xs text-ink/40 hover:text-rule group-hover:block dark:text-ink-dark/40 dark:hover:text-rule-dark"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ink/25 px-4 py-3 dark:border-ink-dark/25">
        <div className="flex min-w-0 items-center gap-2">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-6 w-6 shrink-0 border border-ink/40 object-cover grayscale dark:border-ink-dark/40"
            />
          )}
          <span className="truncate font-mono text-[11px] text-ink/50 dark:text-ink-dark/50">
            {user?.email}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-rule hover:underline dark:text-rule-dark"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
