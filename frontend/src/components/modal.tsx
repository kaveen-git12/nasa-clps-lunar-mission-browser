import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-popover/80 p-6"
      >
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
