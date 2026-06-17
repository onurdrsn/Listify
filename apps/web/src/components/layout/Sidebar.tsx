import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

const LIST_COLOR: Record<string, string> = {
  "/filmler":   "var(--color-film)",
  "/diziler":   "var(--color-series)",
  "/kitaplar":  "var(--color-book)",
  "/yemek":     "var(--color-food)",
  "/alisveris": "var(--color-shop)",
};

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore(s => s.clearAuth);
  const user = useAuthStore(s => s.user);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { clearAuth(); navigate("/"); },
  });

  const NAV = [
    { to: "/dashboard",     icon: "⊞",  label: t("nav.dashboard")  },
    { to: "/filmler",       icon: "🎬", label: t("nav.movies")      },
    { to: "/diziler",       icon: "📺", label: t("nav.series")      },
    { to: "/kitaplar",      icon: "📖", label: t("nav.books")       },
    { to: "/yemek",         icon: "🍽️", label: t("nav.food")        },
    { to: "/alisveris",     icon: "🛒", label: t("nav.shopping")    },
    { to: "/hatirlatmalar", icon: "🔔", label: t("nav.reminders")   },
    { to: "/istatistikler", icon: "◈",  label: t("nav.stats")       },
  ];

  return (
    <aside className="w-56 flex flex-col border-r border-border bg-slate-900 shrink-0">
      {/* Logo + spiral dekorasyon */}
      <div className="px-5 py-5 border-b border-border">
        <div className="notebook-spiral mb-3 -mx-5" />
        <span className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
          Listify
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm transition-colors relative",
              isActive
                ? "bg-slate-800 text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-slate-800/60"
            )}
          >
            {({ isActive }) => (
              <>
                {/* Aktif sol şerit — liste rengi */}
                {isActive && LIST_COLOR[item.to] && (
                  <span
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                    style={{ background: LIST_COLOR[item.to] }}
                  />
                )}
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
        <NavLink
          to="/ayarlar"
          className={({ isActive }) => cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm transition-colors",
            isActive ? "bg-slate-800 text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-slate-800/60"
          )}
        >
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-text-primary">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="truncate text-sm">{user?.name}</span>
        </NavLink>
        <button
          onClick={() => logout.mutate()}
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-color-error rounded-sm transition-colors cursor-pointer"
        >
          <span className="w-5 text-center">↩</span>
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
