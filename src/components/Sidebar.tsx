import { useState } from "react";
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
    <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-4 dark:border-stone-800">
        <span className="text-2xl">🏆</span>
        <span className="text-lg font-semibold tracking-tight">Rank Your Niche</span>
      </div>

      <div className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">
        <button
          type="button"
          onClick={onNewCategory}
          className="w-full rounded-lg border border-dashed border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-500 hover:border-amber-500 hover:text-amber-700 dark:border-stone-700 dark:text-stone-400 dark:hover:text-amber-400"
        >
          + New category
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {categories.length === 0 && (
          <div className="px-2 py-4 text-sm text-stone-400 dark:text-stone-600">
            No categories yet. Create one to start ranking.
          </div>
        )}

        {categories.map((category) => {
          const lists = listsByCategory(category.id);
          const isCollapsed = collapsed[category.id];
          const isEditing = editingCategoryId === category.id;
          return (
            <div key={category.id} className="mb-4">
              <div className="group flex items-center justify-between px-1 py-1">
                {isEditing ? (
                  <input
                    autoFocus
                    value={categoryNameDraft}
                    onChange={(e) => setCategoryNameDraft(e.target.value)}
                    onBlur={() => commitCategoryName(category.id)}
                    onKeyDown={(e) => e.key === "Enter" && commitCategoryName(category.id)}
                    className="flex-1 rounded-md border border-stone-300 px-1.5 py-0.5 text-sm font-semibold outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
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
                    className="flex min-w-0 items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  >
                    <span className={`shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>
                      ▾
                    </span>
                    <span className="truncate">{category.name}</span>
                  </button>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onNewList(category.id)}
                    title={`New list in ${category.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 hover:bg-amber-100 hover:text-amber-800 dark:text-stone-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                  >
                    +
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
                    className="hidden h-6 w-6 items-center justify-center rounded-md text-stone-400 hover:bg-red-50 hover:text-red-600 group-hover:flex dark:hover:bg-red-900/20"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {lists.length === 0 && (
                    <div className="px-3 py-1.5 text-xs text-stone-400 dark:text-stone-600">
                      No lists yet
                    </div>
                  )}
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className={`group flex items-center justify-between rounded-md px-3 py-1.5 text-sm cursor-pointer ${
                        selectedListId === list.id
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                          : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                      }`}
                      onClick={() => onSelectList(list.id)}
                    >
                      <span className="truncate">{list.name}</span>
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
                        className="ml-2 hidden shrink-0 text-stone-400 hover:text-red-500 group-hover:block"
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
    </aside>
  );
}
