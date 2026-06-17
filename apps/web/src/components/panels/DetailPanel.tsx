import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { StarRating } from "../ui/StarRating";
import { useToastStore } from "../ui/Toast";
import { ReminderPanel } from "./ReminderPanel";
import type { ListItem } from "../../types/index";

interface DetailPanelProps {
  item: ListItem | null;
  onClose: () => void;
  onUpdate: () => void;
  color: string;
}

export function DetailPanel({ item, onClose, onUpdate, color }: DetailPanelProps) {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();
  const [status, setStatus] = useState<any>("pending");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setRating(item.rating ?? null);
      setNotes(item.notes ?? "");
      setTitle(item.title);
    }
  }, [item]);

  const updateMutation = trpc.items.update.useMutation({
    onSuccess: () => {
      toast("success", t("toast.updated"));
      onUpdate();
    },
    onError: (e) => toast("error", e.message),
  });

  const deleteMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      toast("info", t("toast.deleted"));
      onUpdate();
    },
    onError: (e) => toast("error", e.message),
  });

  if (!item) return null;

  const handleSave = () => {
    updateMutation.mutate({
      id: item.id,
      status,
      rating,
      notes: notes || undefined,
      title: title || undefined,
    });
  };

  const handleDelete = () => {
    if (confirm("Bu öğeyi silmek istediğinize emin misiniz?")) {
      deleteMutation.mutate({ id: item.id });
    }
  };

  return (
    <Modal open={!!item} onClose={onClose} title={item.title} size="md">
      <div className="space-y-4">
        {item.posterUrl || item.coverUrl || item.meta?.imageUrl ? (
          <div className="aspect-[16/9] w-full bg-slate-800 rounded-card overflow-hidden">
            <img
              src={(item.posterUrl ?? item.coverUrl ?? item.meta?.imageUrl) as string}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Select
            label="Durum"
            value={status}
            onChange={(v) => setStatus(v as any)}
            options={[
              { value: "pending", label: t("status.pending") },
              { value: "in_progress", label: t("status.in_progress") },
              { value: "completed", label: t("status.completed") },
              { value: "skipped", label: t("status.skipped") },
            ]}
          />

          <div className="space-y-1">
            <label className="text-xs text-text-secondary block">Değerlendirme</label>
            <StarRating rating={rating || 0} onChange={setRating} />
          </div>

          {item.author && <p className="text-xs text-text-secondary">Yazar: {item.author}</p>}
          {item.year && <p className="text-xs text-text-secondary">Yıl: {item.year}</p>}
          {item.genre && item.genre.length > 0 && (
            <p className="text-xs text-text-secondary">Kategoriler: {item.genre.join(", ")}</p>
          )}

          {item.cuisine && <p className="text-xs text-text-secondary">Mutfak: {item.cuisine}</p>}
          {item.location && <p className="text-xs text-text-secondary">Konum: {item.location}</p>}
          {item.mapsUrl && (
            <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-color-book hover:underline block">
              🗺️ Haritada Gör
            </a>
          )}
          {item.recipeUrl && (
            <a href={item.recipeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-color-book hover:underline block">
              🍳 Tarife Git
            </a>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs text-text-secondary">Notlar</label>
            <textarea
              className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-color-film/40 transition-colors w-full h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 cursor-pointer"
              onClick={handleSave}
              loading={updateMutation.isPending}
              style={{ background: color, color: color === "var(--color-series)" ? "#fff" : "#0A0C10" }}
            >
              {t("actions.save")}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setReminderOpen(true)}
            >
              🔔 Hatırlatıcı Ekle
            </Button>
            <Button
              variant="danger"
              className="cursor-pointer"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      <ReminderPanel
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        itemId={item.id}
        wittyKey={item.type}
      />
    </Modal>
  );
}
