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
      <div className="flex flex-col gap-5 font-body text-ink dark:text-ink-dark">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-ink/40 font-display text-2xl text-ink/30 dark:border-ink-dark/40 dark:text-ink-dark/30"
              onClick={() => fileInputRef.current?.click()}
              role="button"
            >
              {photo ? (
                <img src={photo} alt="" className="h-full w-full object-cover grayscale" />
              ) : uploading ? (
                "…"
              ) : (
                "§"
              )}
            </div>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="font-mono text-[10px] uppercase tracking-widest text-ink/40 hover:text-rule dark:text-ink-dark/40 dark:hover:text-rule-dark"
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
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
                Name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-underline border-ink/40 text-sm focus:border-rule dark:border-ink-dark/40 dark:focus:border-rule-dark"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
                Date tried
              </span>
              <input
                type="date"
                value={dateTried ?? ""}
                onChange={(e) => setDateTried(e.target.value)}
                className="field-underline border-ink/40 text-sm focus:border-rule dark:border-ink-dark/40 dark:focus:border-rule-dark"
              />
            </label>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="field-underline resize-none border-ink/40 font-body italic text-sm focus:border-rule dark:border-ink-dark/40 dark:focus:border-rule-dark"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/60 dark:text-ink-dark/60">
            Scores
          </span>
          {list.criteria.length === 0 && (
            <p className="font-body italic text-xs text-ink/40 dark:text-ink-dark/40">
              This list has no criteria yet. Add some from the list header first.
            </p>
          )}
          {list.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate font-body italic text-sm text-ink/70 dark:text-ink-dark/70">
                {c.name}
              </span>
              <input
                type="range"
                min={SCORE_MIN}
                max={SCORE_MAX}
                step={0.1}
                value={scores[c.id] ?? DEFAULT_SCORE}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [c.id]: Number(e.target.value) }))
                }
                className="flex-1 accent-rule dark:accent-rule-dark"
              />
              <span className="w-8 shrink-0 text-right font-mono text-sm font-bold text-rule dark:text-rule-dark">
                {(scores[c.id] ?? DEFAULT_SCORE).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {error && <p className="font-mono text-xs text-rule dark:text-rule-dark">{error}</p>}

        <div className="mt-2 flex justify-end gap-4 border-t border-ink/20 pt-4 font-mono text-xs uppercase tracking-widest dark:border-ink-dark/20">
          <button
            type="button"
            onClick={onClose}
            className="text-ink/50 hover:text-rule dark:text-ink-dark/50 dark:hover:text-rule-dark"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-paper dark:border-ink-dark dark:text-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
          >
            {existingItem ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
