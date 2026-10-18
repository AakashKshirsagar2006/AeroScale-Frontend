import { Button } from './Button';
import { Modal } from './Modal';

/** "Are you sure?" built on Modal. Pass `open`, text, and the two handlers. `busy` shows a spinner on the confirm button. */
export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirm', cancelLabel = 'Keep it', busy = false, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-slate-700">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
        <Button onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
