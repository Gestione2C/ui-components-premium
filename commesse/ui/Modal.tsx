import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Finestra modale accessibile: ESC e click sullo sfondo chiudono, il focus entra nel dialogo. */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 720,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn("relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-cm-line2 bg-cm-surface p-5 shadow-2xl outline-none")}
            style={{ maxWidth: width }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute right-3 top-3 z-[2] cursor-pointer rounded-md p-1 text-cm-faint transition-colors hover:text-cm-bad"
            >
              <X size={18} />
            </button>
            <h2 className="mb-4 pr-8 font-cmmono text-[13px] font-semibold text-cm-accent">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const MSec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <div className="mb-2.5 border-b border-cm-line pb-1.5 font-cmmono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-cm-faint">{title}</div>
    {children}
  </div>
);
export const Fg = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <label className={cn("flex flex-col gap-1", full && "col-span-full")}>
    <span className="font-cmmono text-[10.5px] text-cm-muted">{label}</span>
    {children}
  </label>
);
