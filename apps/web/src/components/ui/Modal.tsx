import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    // Fallback for click outside (light dismiss) on Safari
    const handleOutsideClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isInside) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", handleOutsideClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "bg-slate-900 border border-border text-text-primary rounded-card p-6 shadow-card focus:outline-none mx-auto my-auto",
        "backdrop:bg-slate-950/85 backdrop:backdrop-blur-xs",
        "anim-up",
        size === "sm" && "max-w-sm w-full",
        size === "md" && "max-w-md w-full",
        size === "lg" && "max-w-lg w-full"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl"
        >
          &times;
        </button>
      </div>
      <div className="text-sm">{children}</div>
    </dialog>
  );
}
