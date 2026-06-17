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
    <aside className="w-64 flex flex-col bg-slate-950/50 backdrop-blur-3xl shrink-0 shadow-2xl z-50">
      {/* Logo */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(45,212,191,0.5)] flex items-center justify-center">
          <span className="text-white text-lg leading-none">✓</span>
        </div>
        <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Listify
        </span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative group overflow-hidden",
              isActive
                ? "bg-white/10 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                {/* Active glow background */}
                {isActive && LIST_COLOR[item.to] && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: `linear-gradient(90deg, ${LIST_COLOR[item.to]} 0%, transparent 100%)` }}
                  />
                )}
                {/* Active dot */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                    style={{ background: LIST_COLOR[item.to] || "var(--color-film)", boxShadow: `0 0 10px ${LIST_COLOR[item.to] || "var(--color-film)"}` }}
                  />
                )}
                <span className={cn(
                  "text-lg w-6 text-center transition-transform duration-300 group-hover:scale-110 relative z-10",
                  isActive ? "drop-shadow-md" : ""
                )}>{item.icon}</span>
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-6 pt-4 space-y-2">
        <NavLink
          to="/ayarlar"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
            isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white shadow-inner border border-white/10">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="truncate">{user?.name}</span>
        </NavLink>
        <button
          onClick={() => logout.mutate()}
          className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-400 rounded-2xl transition-all duration-300 cursor-pointer hover:bg-red-500/10"
        >
          <span className="w-6 text-center text-lg">↩</span>
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
