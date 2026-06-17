import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { Skeleton } from "../components/ui/Skeleton";

export function Stats() {
  const { t } = useTranslation();
  const { data: s, isLoading } = trpc.stats.overview.useQuery();

  const totalCompleted = s
    ? Object.values(s.byType).reduce((acc, v) => acc + (v.completed ?? 0), 0)
    : 0;

  const totalPending = s
    ? Object.values(s.byType).reduce((acc, v) => acc + (v.pending ?? 0), 0)
    : 0;

  const typeColor: Record<string, string> = {
    movie: "var(--color-film)",
    series: "var(--color-series)",
    book: "var(--color-book)",
    food_restaurant: "var(--color-food)",
    food_recipe: "var(--color-food)",
    shopping: "var(--color-shop)",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="w-1 h-8 rounded-full bg-text-muted" />
        <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          ◈ {t("stats.title")}
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : s ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-border rounded-card p-5">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t("stats.totalItems")}</p>
              <p className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {s.total}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {totalPending} aktif takip ediliyor
              </p>
            </div>
            <div className="bg-slate-900 border border-border rounded-card p-5">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t("stats.completed")}</p>
              <p className="text-3xl font-extrabold text-[#4BE8A8]" style={{ fontFamily: "var(--font-display)" }}>
                {totalCompleted}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Genel tamamlanma oranı: {s.total > 0 ? Math.round((totalCompleted / s.total) * 100) : 0}%
              </p>
            </div>
            <div className="bg-slate-900 border border-border rounded-card p-5">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t("stats.averageRating")}</p>
              <p className="text-3xl font-extrabold text-[#E8B04B]" style={{ fontFamily: "var(--font-display)" }}>
                {s.averageRating ? `${s.averageRating}/5` : "—"}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Puanlanan tüm listeler
              </p>
            </div>
          </div>

          {/* Section: By Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-border rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("stats.byType")}</h3>
              <div className="space-y-3">
                {Object.entries(s.byType).map(([type, counts]) => {
                  const typeTotal = Object.values(counts).reduce((a, b) => a + b, 0);
                  const completedRatio = typeTotal > 0 ? (counts.completed / typeTotal) * 100 : 0;
                  if (typeTotal === 0) return null;

                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-primary font-medium">{t(`listType.${type}`)}</span>
                        <span className="text-text-muted">{counts.completed} / {typeTotal}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${completedRatio}%`,
                            background: typeColor[type],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {s.total === 0 && (
                  <p className="text-xs text-text-muted text-center py-8">Henüz istatistik yok.</p>
                )}
              </div>
            </div>

            {/* Section: Monthly Completed */}
            <div className="bg-slate-900 border border-border rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("stats.byMonth")}</h3>
              <div className="flex items-end justify-between h-44 pt-4 border-b border-border px-2">
                {Object.entries(s.byMonth).length === 0 ? (
                  <p className="text-xs text-text-muted text-center w-full pb-16">Tamamlanan öge bulunmuyor.</p>
                ) : (
                  Object.entries(s.byMonth).slice(-6).map(([month, count]) => {
                    const maxVal = Math.max(...Object.values(s.byMonth), 1);
                    const pct = (count / maxVal) * 90; // scale to max 90% height
                    return (
                      <div key={month} className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-8 bg-color-shop rounded-t-sm flex items-center justify-center relative group" style={{ height: `${pct}%`, minHeight: "4px" }}>
                          <span className="absolute -top-6 text-[10px] text-text-primary bg-slate-800 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {count}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted transform -rotate-12 mt-1">
                          {month.slice(5)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default Stats;
