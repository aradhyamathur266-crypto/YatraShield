import { useEffect, useRef } from "react";
import { getLenis } from "../utils/smooth-scroll.js";

/** Native <dialog>: focus trap, Esc handling and top-layer stacking for free. */
export default function Dialog({ open, onClose, label, className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return undefined;
    getLenis()?.stop();
    return () => getLenis()?.start();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}
