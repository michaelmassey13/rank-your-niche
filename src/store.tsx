import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type { Category, CategoryId, Criterion, Item, List } from "./types";

export const CATEGORIES: Category[] = [
  { id: "shops", label: "Coffee Shops", singular: "shop" },
  { id: "beans", label: "Coffee Beans", singular: "bean" },
  { id: "orders", label: "Coffee Orders", singular: "order" },
];

const STORAGE_KEY = "coffee-tier-app:v1";

interface StoreState {
  lists: List[];
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lists: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.lists)) return { lists: [] };
    return parsed;
  } catch {
    return { lists: [] };
  }
}

interface StoreApi {
  lists: List[];
  listsByCategory: (categoryId: CategoryId) => List[];
  getList: (listId: string) => List | undefined;
  createList: (categoryId: CategoryId, name: string, criteriaNames: string[]) => string;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const listsByCategory = useCallback(
    (categoryId: CategoryId) => state.lists.filter((l) => l.categoryId === categoryId),
    [state.lists]
  );

  const getList = useCallback(
    (listId: string) => state.lists.find((l) => l.id === listId),
    [state.lists]
  );

  const createList = useCallback((categoryId: CategoryId, name: string, criteriaNames: string[]) => {
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
    setState((s) => ({ lists: [...s.lists, list] }));
    return id;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setState((s) => ({ lists: s.lists.filter((l) => l.id !== listId) }));
  }, []);

  const renameList = useCallback((listId: string, name: string) => {
    setState((s) => ({
      lists: s.lists.map((l) => (l.id === listId ? { ...l, name: name.trim() } : l)),
    }));
  }, []);

  const addCriterion = useCallback((listId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, criteria: [...l.criteria, { id: uuid(), name: trimmed }] }
          : l
      ),
    }));
  }, []);

  const removeCriterion = useCallback((listId: string, criterionId: string) => {
    setState((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, criteria: l.criteria.filter((c) => c.id !== criterionId) }
          : l
      ),
    }));
  }, []);

  const renameCriterion = useCallback((listId: string, criterionId: string, name: string) => {
    setState((s) => ({
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
      lists: s.lists.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
      ),
    }));
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      lists: state.lists,
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
      state.lists,
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

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
