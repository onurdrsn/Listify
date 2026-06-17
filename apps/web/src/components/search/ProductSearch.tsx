import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";

interface ProductSearchProps {
  onSelect: (data: any) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");

  const { data: result, isLoading, isFetched } = trpc.shopping.barcodeSearch.useQuery(
    { barcode: searchBarcode },
    { enabled: searchBarcode.length >= 8 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      setSearchBarcode(barcode.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={`${t("shopping.barcode")} (EAN/UPC)`}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
        <Button type="submit" style={{ background: "var(--color-shop)", color: "#0A0C10" }}>
          {t("actions.search")}
        </Button>
      </form>

      {isLoading && <Skeleton className="h-16 w-full" />}

      {isFetched && result && (
        <div
          onClick={() => onSelect(result)}
          className="flex items-center gap-3 p-3 hover:bg-slate-800 border border-border-hover rounded-sm cursor-pointer transition-colors"
        >
          {result.imageUrl ? (
            <img
              src={result.imageUrl}
              alt={result.name}
              className="w-10 h-10 object-cover rounded-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-800 flex items-center justify-center text-xs">
              🛒
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-primary">{result.name}</p>
            {result.brand && <p className="text-[10px] text-text-muted">{result.brand}</p>}
          </div>
          <span className="text-xs text-text-muted">→ {t("actions.add")}</span>
        </div>
      )}

      {isFetched && !result && searchBarcode && (
        <p className="text-xs text-text-muted text-center py-2">{t("errors.notFound")}</p>
      )}
    </div>
  );
}
