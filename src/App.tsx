import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import Sidebar from "./components/Sidebar";
import ListView from "./components/ListView";
import NewListModal from "./components/NewListModal";
import type { CategoryId } from "./types";

function AppShell() {
  const { getList } = useStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListCategory, setNewListCategory] = useState<CategoryId | null>(null);

  const selectedList = selectedListId ? getList(selectedListId) : undefined;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Sidebar
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
        onNewList={(categoryId) => setNewListCategory(categoryId)}
        onListDeleted={(deletedId) => {
          if (deletedId === selectedListId) setSelectedListId(null);
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {selectedList ? (
          <ListView list={selectedList} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="text-5xl">☕</div>
            <h1 className="text-xl font-semibold text-stone-700 dark:text-stone-200">
              Pick a list, or start a new one
            </h1>
            <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
              Create lists for coffee shops, beans, or orders in the sidebar, define what
              matters to you, and rank away.
            </p>
          </div>
        )}
      </main>

      {newListCategory && (
        <NewListModal
          categoryId={newListCategory}
          onClose={() => setNewListCategory(null)}
          onCreated={(listId) => {
            setSelectedListId(listId);
            setNewListCategory(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
