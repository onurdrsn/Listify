import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { AddItemPanel } from "../panels/AddItemPanel";
import { DetailPanel } from "../panels/DetailPanel";
import { cn } from "../../lib/utils";
import type { ListType, ItemStatus, ListItem } from "../../types/index";

interface GenericListPageProps {
  type: ListType;
  icon: string;
  color: string;
}

const STATUS_KEYS: ItemStatus[] = ["pending", "in_progress", "completed", "skipped"];

export function GenericListPage({ type, icon, color }: GenericListPageProps) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<ListItem | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ItemStatus | "all">("all");

  const { data, isLoading, refetch } = trpc.items.list.useQuery({
    type,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page: 1,
    limit: 48,
  });

  const typeLabel = t(`listType.${type}`);
  const emptyMsg  = t(`empty.${type}`);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Dikey renkli şerit - Premium glow ile */}
          <span className="w-1.5 h-10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ background: color, boxShadow: `0 0 15px ${color}80` }} />
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-md" style={{ fontFamily: "var(--font-display)" }}>
              {icon} {typeLabel}
            </h1>
            <p className="text-sm font-medium text-slate-400/80 tracking-wide mt-0.5">{data?.total ?? 0} {typeLabel.toLowerCase()}</p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} style={{ background: color, color: "#0A0C10" }}>
          + {t("actions.add")}
        </Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={`${typeLabel} ${t("actions.search").toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 bg-slate-900 border border-border rounded-sm p-1">
          <button
            onClick={() => setStatus("all")}
            className={cn("px-3 py-1.5 text-xs rounded-sm transition-colors cursor-pointer",
              status === "all" ? "bg-slate-700 text-text-primary" : "text-text-muted hover:text-text-secondary")}
          >
            {t("actions.filter")} ∙ Tümü
          </button>
          {STATUS_KEYS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn("px-3 py-1.5 text-xs rounded-sm transition-colors cursor-pointer",
                status === s ? "bg-slate-700 text-text-primary" : "text-text-muted hover:text-text-secondary")}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-card" />)
          : data?.items.map(item => (
              <ItemCard
                key={item.id}
                item={item as ListItem}
                color={color}
                onClick={() => setSelected(item as ListItem)}
                onComplete={refetch}
              />
            ))
        }
      </div>

      {/* Boş durum */}
      {!isLoading && data?.items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{icon}</p>
          <p className="text-text-secondary">{emptyMsg}</p>
          {!search && (
            <Button className="mt-6" onClick={() => setAddOpen(true)} style={{ background: color, color: "#0A0C10" }}>
              {t("actions.add")}
            </Button>
          )}
        </div>
      )}

      <AddItemPanel open={addOpen} onClose={() => setAddOpen(false)} type={type} onSuccess={refetch} />
      <DetailPanel item={selected} onClose={() => setSelected(null)} onUpdate={() => { refetch(); setSelected(null); }} color={color} />
    </div>
  );
}

/* Evrensel kart */
function ItemCard({ item, color, onClick, onComplete }: {
  item: ListItem; color: string; onClick: () => void; onComplete: () => void;
}) {
  const { t } = useTranslation();
  const markComplete = trpc.items.markComplete.useMutation({ onSuccess: onComplete });

  const coverSrc = item.posterUrl ?? item.coverUrl ?? (item.meta?.imageUrl as string) ?? null;
  const typeEmoji: Record<string, string> = {
    movie:"🎬",series:"📺",book:"📖",food_restaurant:"🍽️",food_recipe:"👨‍🍳",shopping:"🛒"
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-card overflow-hidden cursor-pointer bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl anim-up"
    >
      {/* Premium Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Durum şeridi — sol (Subtle gradient) */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1 opacity-80 z-20"
        style={{ background: item.status === "completed" ? `linear-gradient(to bottom, ${color}, transparent)` : "transparent" }}
      />

      <div className="aspect-[2/3] bg-slate-800/50 flex items-center justify-center overflow-hidden relative">
        {coverSrc ? (
          <img src={coverSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <span className="text-4xl">{typeEmoji[item.type]}</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1 z-20 relative bg-gradient-to-b from-transparent to-slate-950/80">
        <p className="text-sm font-semibold text-white line-clamp-2 leading-snug drop-shadow-md">{item.title}</p>
        {item.author && <p className="text-xs text-slate-300 font-medium">{item.author}</p>}
        {item.year && <p className="text-xs text-slate-400">{item.year}</p>}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm backdrop-blur-md"
            style={item.status === "completed"
              ? { color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }
              : { color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {t(`status.${item.status}`)}
          </span>
          {item.status !== "completed" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); markComplete.mutate({ id: item.id }); }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-all cursor-pointer shadow-sm"
              title="Tamamla"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
