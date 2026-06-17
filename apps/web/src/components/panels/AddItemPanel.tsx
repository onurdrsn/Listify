import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { TMDBSearch } from "../search/TMDBSearch";
import { OpenLibrarySearch } from "../search/OpenLibrarySearch";
import { useToastStore } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface AddItemPanelProps {
  open: boolean;
  onClose: () => void;
  type: any;
  onSuccess: () => void;
}

export function AddItemPanel({ open, onClose, type, onSuccess }: AddItemPanelProps) {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();
  const trpcUtils = trpc.useUtils();

  const [overrideType, setOverrideType] = useState<any>(null);
  const [pendingSelection, setPendingSelection] = useState<any>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ open: boolean; message: string; targetType: any }>({ open: false, message: "", targetType: null });
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");

  // Type specific fields
  const [year, setYear] = useState<number | undefined>(undefined);
  const [genre, setGenre] = useState<string[]>([]);
  const [seasonCount, setSeasonCount] = useState<number | undefined>(undefined);
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState<number>(1);
  const [mapsUrl, setMapsUrl] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [cookTimeMin, setCookTimeMin] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<number>(1);

  const [searchMode, setSearchMode] = useState(true);

  const addMutation = trpc.items.add.useMutation({
    onSuccess: () => {
      toast("success", t("toast.added"));
      resetForm();
      onSuccess();
      onClose();
    },
    onError: (e) => toast("error", e.message),
  });

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setCoverUrl("");
    setStatus("pending");
    setYear(undefined);
    setGenre([]);
    setSeasonCount(undefined);
    setAuthor("");
    setIsbn("");
    setPageCount(undefined);
    setRestaurantName("");
    setCuisine("");
    setLocation("");
    setPriceRange(1);
    setMapsUrl("");
    setRecipeUrl("");
    setCookTimeMin(undefined);
    setDifficulty(1);
    setSearchMode(true);
    setOverrideType(null);
  };

  const handleSelectTMDB = async (data: any) => {
    if (type === "movie" && data.mediaType === "series") {
      setPendingSelection(data);
      setConfirmConfig({ open: true, message: "Filmler sayfasındasınız ancak seçtiğiniz bir dizi. Bunu Diziler listesine eklemek ister misiniz?", targetType: "series" });
      return;
    } else if (type === "series" && data.mediaType === "movie") {
      setPendingSelection(data);
      setConfirmConfig({ open: true, message: "Diziler sayfasındasınız ancak seçtiğiniz bir film. Bunu Filmler listesine eklemek ister misiniz?", targetType: "movie" });
      return;
    }

    await processTMDBSelection(data, type);
  };

  const processTMDBSelection = async (data: any, targetType: string) => {
    if (targetType !== type) {
      setOverrideType(targetType);
    } else {
      setOverrideType(null);
    }

    setTitle(data.title);
    setCoverUrl(data.posterUrl || "");
    setYear(parseInt(data.year) || undefined);
    setGenre(data.genre);
    setSearchMode(false);

    if (data.mediaType === "series" || targetType === "series") {
      try {
        const details = await trpcUtils.items.tmdbDetails.fetch({ id: data.id, type: "series" });
        if (details.seasonCount) setSeasonCount(details.seasonCount);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleConfirmSelect = () => {
    if (pendingSelection) {
      processTMDBSelection(pendingSelection, confirmConfig.targetType);
    }
    setConfirmConfig({ open: false, message: "", targetType: null });
    setPendingSelection(null);
  };

  const handleCancelSelect = () => {
    setConfirmConfig({ open: false, message: "", targetType: null });
    setPendingSelection(null);
  };

  const handleSelectOpenLibrary = (data: any) => {
    setTitle(data.title);
    setCoverUrl(data.coverUrl || "");
    setAuthor(data.author);
    setIsbn(data.isbn || "");
    setPageCount(data.pageCount || undefined);
    setYear(data.year || undefined);
    setSearchMode(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast("error", "Başlık zorunludur");
      return;
    }
    const finalType = overrideType || type;
    addMutation.mutate({
      type: finalType,
      title,
      notes: notes || undefined,
      coverUrl: coverUrl || undefined,
      status,
      year,
      genre,
      seasonCount,
      author: author || undefined,
      isbn: isbn || undefined,
      pageCount,
      restaurantName: restaurantName || undefined,
      cuisine: cuisine || undefined,
      location: location || undefined,
      priceRange: finalType === "food_restaurant" ? priceRange : undefined,
      mapsUrl: mapsUrl || undefined,
      recipeUrl: recipeUrl || undefined,
      cookTimeMin,
      difficulty: finalType === "food_recipe" ? difficulty : undefined,
    });
  };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} title={`${t(`listType.${type}`)} ${t("actions.add").toLowerCase()}`} size="lg">
      <div className="space-y-4">
        {(type === "movie" || type === "series") && searchMode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-text-secondary">Arama Yap veya Manuel Ekle</label>
              <Button size="sm" variant="ghost" onClick={() => setSearchMode(false)} className="cursor-pointer">Manuel Form</Button>
            </div>
            <TMDBSearch onSelect={handleSelectTMDB} />
          </div>
        )}

        {type === "book" && searchMode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-text-secondary">Kitap Ara veya Manuel Ekle</label>
              <Button size="sm" variant="ghost" onClick={() => setSearchMode(false)} className="cursor-pointer">Manuel Form</Button>
            </div>
            <OpenLibrarySearch onSelect={handleSelectOpenLibrary} />
          </div>
        )}

        {(!searchMode || (type !== "movie" && type !== "series" && type !== "book")) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs text-text-secondary">Öğe Detayları</h4>
              {(type === "movie" || type === "series" || type === "book") && (
                <Button size="sm" variant="ghost" onClick={() => setSearchMode(true)} className="cursor-pointer">Arama Modu</Button>
              )}
            </div>
            <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Kapak Görseli URL'si" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />

            {/* Type-specific inputs */}
            {(type === "movie" || type === "series") && (
              <>
                <div className="flex gap-2">
                  <Input type="number" label="Yıl" value={year || ""} onChange={(e) => setYear(parseInt(e.target.value) || undefined)} />
                  {type === "series" && (
                    <Input type="number" label="Sezon Sayısı" value={seasonCount || ""} onChange={(e) => setSeasonCount(parseInt(e.target.value) || undefined)} />
                  )}
                </div>
                <Input label="Kategoriler (virgülle ayırın)" value={genre.join(", ")} onChange={(e) => setGenre(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
              </>
            )}

            {type === "book" && (
              <>
                <Input label="Yazar" value={author} onChange={(e) => setAuthor(e.target.value)} />
                <div className="flex gap-2">
                  <Input label="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                  <Input type="number" label="Sayfa Sayısı" value={pageCount || ""} onChange={(e) => setPageCount(parseInt(e.target.value) || undefined)} />
                </div>
              </>
            )}

            {type === "food_restaurant" && (
              <>
                <Input label="Mutfak Türü" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Örn. İtalyan, Kebap" />
                <Input label="Konum / Adres" value={location} onChange={(e) => setLocation(e.target.value)} />
                <div className="flex gap-2">
                  <Select
                    label="Fiyat Aralığı"
                    value={priceRange.toString()}
                    onChange={(v) => setPriceRange(parseInt(v))}
                    options={[
                      { value: "1", label: "₺" },
                      { value: "2", label: "₺₺" },
                      { value: "3", label: "₺₺₺" },
                      { value: "4", label: "₺₺₺₺" },
                    ]}
                  />
                  <Input label="Google Haritalar URL'si" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                </div>
              </>
            )}

            {type === "food_recipe" && (
              <>
                <Input label="Tarif Bağlantısı (URL)" value={recipeUrl} onChange={(e) => setRecipeUrl(e.target.value)} />
                <div className="flex gap-2">
                  <Input type="number" label="Pişirme Süresi (dk)" value={cookTimeMin || ""} onChange={(e) => setCookTimeMin(parseInt(e.target.value) || undefined)} />
                  <Select
                    label="Zorluk Derecesi"
                    value={difficulty.toString()}
                    onChange={(v) => setDifficulty(parseInt(v))}
                    options={[
                      { value: "1", label: "Kolay" },
                      { value: "2", label: "Orta" },
                      { value: "3", label: "Zor" },
                    ]}
                  />
                </div>
              </>
            )}

            <Select
              label="Durum"
              value={status}
              onChange={(v) => setStatus(v as any)}
              options={[
                { value: "pending", label: t("status.pending") },
                { value: "in_progress", label: t("status.in_progress") },
                { value: "completed", label: t("status.completed") },
              ]}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs text-text-secondary">Notlar</label>
              <textarea
                className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-color-film/40 transition-colors w-full h-20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              className="w-full mt-2 cursor-pointer"
              onClick={handleSubmit}
              loading={addMutation.isPending}
              style={{ background: `var(--color-${type.startsWith("food") ? "food" : type === "movie" ? "film" : type === "series" ? "series" : type === "book" ? "book" : "shop"})`, color: "#0A0C10" }}
            >
              {t("actions.add")}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        message={confirmConfig.message}
        onConfirm={handleConfirmSelect}
        onCancel={handleCancelSelect}
      />
    </Modal>
  );
}
