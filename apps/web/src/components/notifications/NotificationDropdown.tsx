import { trpc } from "../../lib/trpc";
import { useTranslation } from "react-i18next";
import { useToastStore } from "../ui/Toast";
import { cn } from "../../lib/utils";
import { formatRelative } from "../../lib/utils";

interface NotifItem {
  id: string; title: string; body: string;
  isRead: boolean; createdAt: string;
}

interface Props {
  notifications: NotifItem[];
  unreadCount: number;
  onClose: () => void;
  onRefetch: () => void;
}

export function NotificationDropdown({ notifications, unreadCount, onClose, onRefetch }: Props) {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: onRefetch,
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { onRefetch(); toast("success", t("notification.markAllRead")); },
  });

  return (
    <div className={cn(
      "absolute right-0 top-11 w-80 bg-slate-900 border border-border rounded-card shadow-card z-50",
      "anim-r overflow-hidden"
    )}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">{t("notification.title")}</span>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            {t("notification.markAllRead")}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">{t("notification.noNotifications")}</p>
        ) : notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => { if (!notif.isRead) markRead.mutate({ id: notif.id }); }}
            className={cn(
              "px-4 py-3 cursor-pointer transition-colors",
              notif.isRead
                ? "hover:bg-slate-800/40"
                : "bg-slate-800/60 hover:bg-slate-800"
            )}
          >
            <div className="flex items-start gap-2">
              {!notif.isRead && (
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-color-food shrink-0" />
              )}
              <div className={!notif.isRead ? "" : "pl-3.5"}>
                <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{notif.body}</p>
                <p className="text-xs text-text-muted mt-1">{formatRelative(notif.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
