import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Skeleton } from "../components/ui/Skeleton";

const QUICK_LINKS = [
  { to: "/filmler",   icon: "🎬", color: "var(--color-film)",   tk: "nav.movies"   },
  { to: "/diziler",   icon: "📺", color: "var(--color-series)", tk: "nav.series"   },
  { to: "/kitaplar",  icon: "📖", color: "var(--color-book)",   tk: "nav.books"    },
  { to: "/yemek",     icon: "🍽️", color: "var(--color-food)",   tk: "nav.food"     },
  { to: "/alisveris", icon: "🛒", color: "var(--color-shop)",   tk: "nav.shopping" },
];

export function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const stats = trpc.stats.overview.useQuery();
  const recent = trpc.items.list.useQuery({ limit: 12, page: 1 });

  const s = stats.data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

      {/* Karşılama */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          {user?.locale === "en" ? `Hello, ${user.name?.split(" ")[0]} 👋` : `Merhaba, ${user?.name?.split(" ")[0]} 👋`}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          {t("app.tagline")}
        </p>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {QUICK_LINKS.map(ql => {
          const typeKey = ql.to.replace("/","") as string;
          const pending = s ? (
            typeKey === "filmler" ? s.byType["movie"]?.pending :
            typeKey === "diziler" ? s.byType["series"]?.pending :
            typeKey === "kitaplar" ? s.byType["book"]?.pending :
            typeKey === "yemek" ? (s.byType["food_restaurant"]?.pending ?? 0) + (s.byType["food_recipe"]?.pending ?? 0) :
            typeKey === "alisveris" ? s.byType["shopping"]?.pending : 0
          ) : null;

          return (
            <Link key={ql.to} to={ql.to}
              className="bg-slate-900 border border-border rounded-card p-4 hover:border-border-hover transition-all hover:-translate-y-0.5 group"
            >
              <div className="text-2xl mb-3">{ql.icon}</div>
              <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {t(ql.tk)}
              </p>
              {pending !== null && pending !== undefined && (
                <p className="text-xs mt-1" style={{ color: ql.color }}>
                  {pending} {t("status.pending").toLowerCase()}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Özet İstatistikler */}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("stats.totalItems"),    value: s.total,                              color: "text-text-primary" },
            { label: t("status.completed"),    value: Object.values(s.byType).reduce((acc, v) => acc + (v.completed ?? 0), 0), color: "var(--color-shop)" },
            { label: t("stats.averageRating"), value: s.averageRating ? `${s.averageRating}/5` : "—", color: "var(--color-film)" },
            { label: t("reminder.title"),      value: "→", color: "var(--color-series)", link: "/hatirlatmalar" },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-border rounded-card p-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">{stat.label}</p>
              {"link" in stat ? (
                <Link to={stat.link!} className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </Link>
              ) : (
                <p className="text-2xl font-bold" style={{ color: typeof stat.color === "string" && stat.color.startsWith("var") ? stat.color : undefined, fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Son Eklenenler */}
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {user?.locale === "en" ? "Recently Added" : "Son Eklenenler"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {recent.isLoading
            ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-card" />)
            : recent.data?.items.map(item => (
                <div key={item.id} className="bg-slate-900 border border-border rounded-card p-3 text-sm">
                  <div className="text-lg mb-1">
                    {item.type === "movie" ? "🎬" : item.type === "series" ? "📺" : item.type === "book" ? "📖" : item.type === "food_restaurant" ? "🍽️" : item.type === "food_recipe" ? "👨‍🍳" : "🛒"}
                  </div>
                  <p className="text-text-primary font-medium line-clamp-2 text-xs">{item.title}</p>
                </div>
              ))
          }
        </div>
      </section>
    </div>
  );
}
