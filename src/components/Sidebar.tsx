import { useState } from "react";
import { CATEGORIES, useStore } from "../store";
import type { CategoryId } from "../types";

const CATEGORY_ICON: Record<CategoryId, string> = {
  shops: "🏠",
  beans: "🫘",
  orders: "🥤",
};

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
  onNewList: (categoryId: CategoryId) => void;
  onListDeleted: (listId: string) => void;
}

export default function Sidebar({
  selectedListId,
  onSelectList,
  onNewList,
  onListDeleted,
}: SidebarProps) {
  const { listsByCategory, deleteList } = useStore();
  const [collapsed, setCollapsed] = useState<Record<CategoryId, boolean>>({
    shops: false,
    beans: false,
    orders: false,
  });

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-4 dark:border-stone-800">
        <span className="text-2xl">☕</span>
        <span className="text-lg font-semibold tracking-tight">Coffee Tier</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {CATEGORIES.map((category) => {
          const lists = listsByCategory(category.id);
          const isCollapsed = collapsed[category.id];
          return (
            <div key={category.id} className="mb-4">
              <div className="flex items-center justify-between px-1 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [category.id]: !c[category.id] }))
                  }
                  className="flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  <span className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>
                    ▾
                  </span>
                  <span>{CATEGORY_ICON[category.id]}</span>
                  <span>{category.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNewList(category.id)}
                  title={`New ${category.singular} list`}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 hover:bg-amber-100 hover:text-amber-800 dark:text-stone-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                >
                  +
                </button>
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
