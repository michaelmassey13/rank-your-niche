import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${wide ? "max-w-xl" : "max-w-md"} overflow-y-auto border border-ink bg-paper p-7 font-body shadow-[8px_8px_0_0_var(--color-ink)] dark:border-ink-dark dark:bg-paper-dark dark:shadow-[8px_8px_0_0_var(--color-ink-dark)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-double border-ink pb-3 dark:border-ink-dark">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-ink-dark">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-xs uppercase tracking-widest text-rule hover:underline dark:text-rule-dark"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
