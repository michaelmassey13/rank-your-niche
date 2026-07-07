import { useRef, useState } from "react";
import type { Item, List } from "../types";
import { SCORE_MAX, SCORE_MIN } from "../utils/scoring";
import { compressImage } from "../utils/image";
import Modal from "./Modal";

interface ItemModalProps {
  list: List;
  existingItem?: Item;
  onClose: () => void;
  onSave: (item: Omit<Item, "id" | "createdAt">) => void;
}

const DEFAULT_SCORE = 5;

export default function ItemModal({ list, existingItem, onClose, onSave }: ItemModalProps) {
  const [name, setName] = useState(existingItem?.name ?? "");
  const [notes, setNotes] = useState(existingItem?.notes ?? "");
  const [dateTried, setDateTried] = useState(existingItem?.dateTried ?? "");
  const [photo, setPhoto] = useState<string | null>(existingItem?.photo ?? null);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const c of list.criteria) {
      initial[c.id] = existingItem?.scores[c.id] ?? DEFAULT_SCORE;
    }
    return initial;
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
    } catch {
      setError("Couldn't process that image.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Give it a name.");
      return;
    }
    onSave({
      name: name.trim(),
      notes: notes.trim(),
      dateTried: dateTried || null,
      photo,
      scores,
    });
  }

  return (
    <Modal
      title={existingItem ? `Edit "${existingItem.name}"` : `Add to ${list.name}`}
      onClose={onClose}
      wide
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 text-2xl text-stone-300 dark:border-stone-700 dark:bg-stone-800"
              onClick={() => fileInputRef.current?.click()}
              role="button"
            >
              {photo ? (
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : uploading ? (
                "…"
              ) : (
                "📷"
              )}
            </div>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-xs text-stone-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Date tried
              </span>
              <input
                type="date"
                value={dateTried ?? ""}
                onChange={(e) => setDateTried(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
              />
            </label>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Scores</span>
          {list.criteria.length === 0 && (
            <p className="text-xs text-stone-400">
              This list has no criteria yet. Add some from the list header first.
            </p>
          )}
          {list.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-stone-600 dark:text-stone-300">
                {c.name}
              </span>
              <input
                type="range"
                min={SCORE_MIN}
                max={SCORE_MAX}
                step={0.5}
                value={scores[c.id] ?? DEFAULT_SCORE}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [c.id]: Number(e.target.value) }))
                }
                className="flex-1 accent-amber-700"
              />
              <span className="w-8 shrink-0 text-right text-sm font-semibold text-amber-800 dark:text-amber-300">
                {(scores[c.id] ?? DEFAULT_SCORE).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            {existingItem ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
