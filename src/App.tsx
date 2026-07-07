import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import Sidebar from "./components/Sidebar";
import ListView from "./components/ListView";
import NewListModal from "./components/NewListModal";
import NewCategoryModal from "./components/NewCategoryModal";

function AppShell() {
  const { getList } = useStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListCategoryId, setNewListCategoryId] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const selectedList = selectedListId ? getList(selectedListId) : undefined;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Sidebar
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
        onNewList={(categoryId) => setNewListCategoryId(categoryId)}
        onNewCategory={() => setCreatingCategory(true)}
        onListDeleted={(deletedId) => {
          if (deletedId === selectedListId) setSelectedListId(null);
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {selectedList ? (
          <ListView list={selectedList} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="text-5xl">🏆</div>
            <h1 className="text-xl font-semibold text-stone-700 dark:text-stone-200">
              Pick a list, or start a new one
            </h1>
            <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
              Create a category for whatever you want to rank, add a list inside it,
              define what matters to you, and rank away.
            </p>
          </div>
        )}
      </main>

      {newListCategoryId && (
        <NewListModal
          categoryId={newListCategoryId}
          onClose={() => setNewListCategoryId(null)}
          onCreated={(listId) => {
            setSelectedListId(listId);
            setNewListCategoryId(null);
          }}
        />
      )}

      {creatingCategory && (
        <NewCategoryModal
          onClose={() => setCreatingCategory(false)}
          onCreated={() => setCreatingCategory(false)}
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
