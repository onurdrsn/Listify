import { create } from "zustand";
import { cn } from "../../lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem { id: string; type: ToastType; message: string; }

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

const typeStyle: Record<ToastType, string> = {
  success: "border-color-shop/40  bg-color-shop/10  text-color-shop",
  error:   "border-color-food/40  bg-color-food/10  text-color-food",
  info:    "border-color-book/40  bg-color-book/10  text-color-book",
};

export function Toast() {
  const { toasts } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "anim-up px-4 py-3 rounded-card border text-sm font-medium shadow-card pointer-events-auto",
          "backdrop-blur-sm min-w-[240px] max-w-xs",
          typeStyle[t.type]
        )}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
