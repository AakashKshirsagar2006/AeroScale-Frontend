import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Built on the native <dialog>: focus trap, Esc to close and backdrop come from the browser. */
export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[90dvh] w-[min(34rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm open:animate-enter"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg text-slate-500 outline-none hover:bg-slate-100 hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/30">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
