import { useState, useRef, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { useNotifStore } from "../../store/notificationStore";
import { NotificationDropdown } from "./NotificationDropdown";
import { useTranslation } from "react-i18next";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const setUnread = useNotifStore(s => s.setUnreadCount);

  const { data, refetch } = trpc.notifications.list.useQuery(
    { unreadOnly: false, limit: 20 },
    { refetchInterval: 30_000 } // 30 saniyede bir polling
  );

  useEffect(() => {
    if (data) setUnread(data.unreadCount);
  }, [data]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-sm text-text-secondary hover:text-text-primary hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label={t("notification.title")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-color-food pulse-dot" />
        )}
      </button>
      {open && (
        <NotificationDropdown
          notifications={data?.items ?? []}
          unreadCount={unreadCount}
          onClose={() => setOpen(false)}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
