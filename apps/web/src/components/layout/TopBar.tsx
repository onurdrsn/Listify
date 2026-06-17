import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { NotificationBell } from "../notifications/NotificationBell";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-end px-6 gap-3 shrink-0 bg-slate-900">
      <LanguageSwitcher />
      <NotificationBell />
    </header>
  );
}
