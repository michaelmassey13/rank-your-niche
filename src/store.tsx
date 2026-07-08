import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { db } from "./firebase";
import type { Category, Criterion, Item, List } from "./types";

interface StoreState {
  categories: Category[];
  lists: List[];
}

function createSeedState(): StoreState {
  const categoryId = uuid();
  const listId = uuid();
  const qualityId = uuid();
  const valueId = uuid();
  const vibeId = uuid();
  const now = Date.now();

  return {
    categories: [{ id: categoryId, name: "Example: Coffee Shops", createdAt: now }],
    lists: [
      {
        id: listId,
        categoryId,
        name: "Local Favorites",
        criteria: [
          { id: qualityId, name: "Coffee Quality" },
          { id: valueId, name: "Value" },
          { id: vibeId, name: "Vibe" },
        ],
        items: [
          {
            id: uuid(),
            name: "Blue Bottle",
            notes: "Reliable pour-over, a bit pricey.",
            dateTried: null,
            photo: null,
            scores: { [qualityId]: 8.5, [valueId]: 6, [vibeId]: 8 },
            createdAt: now,
          },
          {
            id: uuid(),
            name: "Corner Diner Coffee",
            notes: "Cheap and fine for a quick cup.",
            dateTried: null,
            photo: null,
            scores: { [qualityId]: 4, [valueId]: 9, [vibeId]: 5 },
            createdAt: now,
          },
        ],
        createdAt: now,
      },
    ],
  };
}

function parseState(data: unknown): StoreState {
  const parsed = (data ?? {}) as Partial<StoreState>;
  return {
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    lists: Array.isArray(parsed.lists) ? parsed.lists : [],
  };
}

interface StoreApi {
  categories: Category[];
  lists: List[];
  getCategory: (categoryId: string) => Category | undefined;
  createCategory: (name: string) => string;
  renameCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;
  listsByCategory: (categoryId: string) => List[];
  getList: (listId: string) => List | undefined;
  createList: (categoryId: string, name: string, criteriaNames: string[]) => string;
  deleteList: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  addCriterion: (listId: string, name: string) => void;
  removeCriterion: (listId: string, criterionId: string) => void;
  renameCriterion: (listId: string, criterionId: string, name: string) => void;
  addItem: (listId: string, item: Omit<Item, "id" | "createdAt">) => void;
  updateItem: (listId: string, itemId: string, item: Omit<Item, "id" | "createdAt">) => void;
  deleteItem: (listId: string, itemId: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<StoreState>({ categories: [], lists: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const ref = doc(db, "users", userId);
    let receivedFirstSnapshot = false;
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setState(parseState(snapshot.data()));
      } else if (!receivedFirstSnapshot) {
        const seed = createSeedState();
        setDoc(ref, seed);
        setState(seed);
      }
      receivedFirstSnapshot = true;
      setLoaded(true);
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    setDoc(doc(db, "users", userId), state);
  }, [userId, loaded, state]);

  const getCategory = useCallback(
    (categoryId: string) => state.categories.find((c) => c.id === categoryId),
    [state.categories]
  );

  const createCategory = useCallback((name: string) => {
    const id = uuid();
    setState((s) => ({
      ...s,
      categories: [...s.categories, { id, name: name.trim(), createdAt: Date.now() }],
    }));
    return id;
  }, []);

  const renameCategory = useCallback((categoryId: string, name: string) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) =>
        c.id === categoryId ? { ...c, name: name.trim() } : c
      ),
    }));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setState((s) => ({
      categories: s.categories.filter((c) => c.id !== categoryId),
      lists: s.lists.filter((l) => l.categoryId !== categoryId),
    }));
  }, []);

  const listsByCategory = useCallback(
    (categoryId: string) => state.lists.filter((l) => l.categoryId === categoryId),
    [state.lists]
  );

  const getList = useCallback(
    (listId: string) => state.lists.find((l) => l.id === listId),
    [state.lists]
  );

  const createList = useCallback((categoryId: string, name: string, criteriaNames: string[]) => {
    const id = uuid();
    const criteria: Criterion[] = criteriaNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: uuid(), name: n }));
    const list: List = {
      id,
      categoryId,
      name: name.trim(),
      criteria,
      items: [],
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, lists: [...s.lists, list] }));
    return id;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== listId) }));
  }, []);

  const renameList = useCallback((listId: string, name: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === listId ? { ...l, name: name.trim() } : l)),
    }));
  }, []);

  const addCriterion = useCallback((listId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, criteria: [...l.criteria, { id: uuid(), name: trimmed }] }
          : l
      ),
    }));
  }, []);

  const removeCriterion = useCallback((listId: string, criterionId: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, criteria: l.criteria.filter((c) => c.id !== criterionId) }
          : l
      ),
    }));
  }, []);

  const renameCriterion = useCallback((listId: string, criterionId: string, name: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              criteria: l.criteria.map((c) =>
                c.id === criterionId ? { ...c, name: name.trim() } : c
              ),
            }
          : l
      ),
    }));
  }, []);

  const addItem = useCallback((listId: string, item: Omit<Item, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, items: [...l.items, { ...item, id: uuid(), createdAt: Date.now() }] }
          : l
      ),
    }));
  }, []);

  const updateItem = useCallback(
    (listId: string, itemId: string, item: Omit<Item, "id" | "createdAt">) => {
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((existing) =>
                  existing.id === itemId ? { ...existing, ...item } : existing
                ),
              }
            : l
        ),
      }));
    },
    []
  );

  const deleteItem = useCallback((listId: string, itemId: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
      ),
    }));
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      categories: state.categories,
      lists: state.lists,
      getCategory,
      createCategory,
      renameCategory,
      deleteCategory,
      listsByCategory,
      getList,
      createList,
      deleteList,
      renameList,
      addCriterion,
      removeCriterion,
      renameCriterion,
      addItem,
      updateItem,
      deleteItem,
    }),
    [
      state.categories,
      state.lists,
      getCategory,
      createCategory,
      renameCategory,
      deleteCategory,
      listsByCategory,
      getList,
      createList,
      deleteList,
      renameList,
      addCriterion,
      removeCriterion,
      renameCriterion,
      addItem,
      updateItem,
      deleteItem,
    ]
  );

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper font-display text-lg italic text-ink/40 dark:bg-paper-dark dark:text-ink-dark/40">
        <span className="animate-pulse">Pulling your archive…</span>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
