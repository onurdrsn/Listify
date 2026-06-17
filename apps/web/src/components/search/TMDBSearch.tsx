import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";

interface TMDBSearchProps {
  type: "movie" | "series";
  onSelect: (data: any) => void;
}

export function TMDBSearch({ type, onSelect }: TMDBSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results, isLoading } = trpc.items.tmdbSearch.useQuery(
    { query: searchQuery, type },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={t("actions.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" style={{ background: "var(--color-film)", color: "#0A0C10" }}>
          {t("actions.search")}
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      <div className="max-h-60 overflow-y-auto divide-y divide-border border border-border rounded-sm bg-slate-950/40">
        {results?.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 p-2 hover:bg-slate-800/60 cursor-pointer transition-colors"
          >
            {item.posterUrl ? (
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-10 h-14 object-cover rounded-sm"
              />
            ) : (
              <div className="w-10 h-14 bg-slate-800 flex items-center justify-center text-xs text-text-muted">
                🎬
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{item.title}</p>
              <p className="text-[10px] text-text-muted">
                {item.year} {item.originalTitle && `· ${item.originalTitle}`}
              </p>
            </div>
          </div>
        ))}
        {results?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">{t("errors.notFound")}</p>
        )}
      </div>
    </div>
  );
}
