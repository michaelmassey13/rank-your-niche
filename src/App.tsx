import { useState } from "react";
import { AuthProvider, useAuth } from "./auth";
import { StoreProvider, useStore } from "./store";
import Login from "./components/Login";
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
    <div className="flex h-screen w-screen overflow-hidden bg-paper font-body text-ink dark:bg-paper-dark dark:text-ink-dark">
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
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="font-display text-5xl italic text-ink/20 dark:text-ink-dark/20">§</div>
            <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark">
              Pick a report to read, or file a new one
            </h1>
            <p className="max-w-sm font-body italic text-sm text-ink/60 dark:text-ink-dark/60">
              Start a section for whatever you want to rank, add a list inside it, define
              what matters to you, and file your standings.
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

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper font-display text-lg italic text-ink/40 dark:bg-paper-dark dark:text-ink-dark/40">
        <span className="animate-pulse">Typesetting…</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <StoreProvider userId={user.uid}>
      <AppShell />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
