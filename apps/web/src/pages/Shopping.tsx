import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { Skeleton } from "../components/ui/Skeleton";
import { useToastStore } from "../components/ui/Toast";
import { cn } from "../lib/utils";

const CATEGORIES = [
  "produce","meat_fish","dairy","bakery","frozen",
  "beverages","cleaning","personal_care","electronics","clothing","other"
] as const;

export function Shopping() {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();

  // Aktif alışveriş listesi (en son oluşturulan "shopping" tipi öğe)
  const lists = trpc.items.list.useQuery({ type: "shopping", page: 1, limit: 10 });
  const activeList = lists.data?.items[0] ?? null;

  const items = trpc.shopping.getItems.useQuery(
    { listId: activeList?.id ?? "" },
    { enabled: !!activeList }
  );

  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("other");
  const [barcodeInput, setBarcodeInput] = useState("");

  const createList = trpc.shopping.createList.useMutation({
    onSuccess: () => lists.refetch(),
  });

  const addItem = trpc.shopping.addItem.useMutation({
    onSuccess: () => { items.refetch(); setName(""); setQty("1"); setUnit(""); toast("success", t("toast.added")); },
    onError: (e) => toast("error", e.message),
  });

  const toggleItem = trpc.shopping.toggleItem.useMutation({
    onSuccess: () => items.refetch(),
  });

  const clearChecked = trpc.shopping.clearChecked.useMutation({
    onSuccess: () => { items.refetch(); toast("info", t("toast.deleted")); },
  });

  const barcodeSearch = trpc.shopping.barcodeSearch.useQuery(
    { barcode: barcodeInput },
    { enabled: barcodeInput.length >= 8 }
  );

  // Kategoriye göre grupla
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.data?.filter(i => i.category === cat) ?? [];
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, typeof items.data>);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 rounded-full" style={{ background: "var(--color-shop)" }} />
          <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            🛒 {t("nav.shopping")}
          </h1>
        </div>
        <div className="flex gap-2">
          {activeList && (
            <Button variant="ghost" size="sm" onClick={() => clearChecked.mutate({ listId: activeList.id })} className="cursor-pointer">
              {t("shopping.clearChecked")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => createList.mutate({ title: t("shopping.newList") })}
            style={{ background: "var(--color-shop)", color: "#0A0C10" }}
            className="cursor-pointer font-semibold"
          >
            + {t("shopping.newList")}
          </Button>
        </div>
      </div>

      {!activeList ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-text-secondary">{t("empty.shopping")}</p>
          <Button
            className="mt-6 cursor-pointer font-semibold"
            onClick={() => createList.mutate({ title: t("shopping.newList") })}
            style={{ background: "var(--color-shop)", color: "#0A0C10" }}
          >
            {t("shopping.newList")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol: Ürün Ekleme */}
          <div className="bg-slate-900 border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">{t("shopping.addItem")}</h3>

            {/* Barkod arama */}
            <Input
              placeholder={`${t("shopping.barcode")} (EAN/UPC)`}
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
            />
            {barcodeSearch.data && (
              <div
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-sm cursor-pointer border border-border-hover"
                onClick={() => { setName(barcodeSearch.data!.name); setBarcodeInput(""); }}
              >
                <span className="text-xs text-text-secondary">{barcodeSearch.data.name}</span>
                <span className="text-xs text-text-muted ml-auto">← {t("actions.add")}</span>
              </div>
            )}

            <Input
              placeholder={t("shopping.addItem")}
              value={name}
              onChange={e => setName(e.target.value)}
              label={t("shopping.addItem")}
            />
            <div className="flex gap-2">
              <Input
                placeholder={t("shopping.quantity")}
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-20"
              />
              <Input
                placeholder={t("shopping.unit")}
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-24"
              />
            </div>
            <Select
              label={t("shopping.categoryLabel")}
              value={category}
              onChange={v => setCategory(v as typeof CATEGORIES[number])}
              options={CATEGORIES.map(c => ({ value: c, label: t(`shopping.category.${c}`) }))}
            />
            <Button
              className="w-full cursor-pointer font-semibold"
              onClick={() => {
                if (!name.trim()) return;
                addItem.mutate({ listId: activeList.id, name: name.trim(), quantity: qty, unit: unit || undefined, category });
              }}
              loading={addItem.isPending}
              style={{ background: "var(--color-shop)", color: "#0A0C10" }}
            >
              {t("actions.add")}
            </Button>
          </div>

          {/* Sağ: Liste */}
          <div className="md:col-span-2 space-y-4">
            {items.isLoading && <Skeleton className="h-40 rounded-card" />}
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} className="bg-slate-900 border border-border rounded-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-slate-800">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t(`shopping.category.${cat}`)}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {catItems?.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-opacity",
                        item.checked ? "opacity-50" : ""
                      )}
                    >
                      <Checkbox
                        checked={item.checked}
                        onChange={v => toggleItem.mutate({ id: item.id, checked: v })}
                        color="var(--color-shop)"
                      />
                      <span className={cn("text-sm flex-1", item.checked ? "line-through text-text-muted" : "text-text-primary")}>
                        {item.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {items.data?.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">{t("empty.shopping")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
