import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { DateTimePicker } from "../components/ui/DateTimePicker";
import { Checkbox } from "../components/ui/Checkbox";
import { useToastStore } from "../components/ui/Toast";
import { cn } from "../lib/utils";
import { formatDate } from "../lib/utils";

const TYPES    = ["manual","weekly_digest","smart_idle"] as const;
const CHANNELS = ["both","in_app","email"] as const;

export function Reminders() {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();
  const [addOpen, setAddOpen] = useState(false);
  const [type, setType] = useState<typeof TYPES[number]>("manual");
  const [channel, setChannel] = useState<typeof CHANNELS[number]>("both");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState(7);
  const [title, setTitle] = useState("");

  const { data: reminders, refetch } = trpc.reminders.list.useQuery({});

  const create = trpc.reminders.create.useMutation({
    onSuccess: () => {
      toast("success", t("toast.reminderSet"));
      refetch();
      setAddOpen(false);
      setTitle(""); setScheduledAt(""); setRecurring(false);
    },
    onError: (e) => toast("error", e.message),
  });

  const update = trpc.reminders.update.useMutation({ onSuccess: () => { refetch(); } });
  const del    = trpc.reminders.delete.useMutation({
    onSuccess: () => { toast("info", t("toast.deleted")); refetch(); },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 rounded-full" style={{ background: "var(--color-series)" }} />
          <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            🔔 {t("reminder.title")}
          </h1>
        </div>
        <Button onClick={() => setAddOpen(true)} style={{ background: "var(--color-series)", color: "#fff" }} className="cursor-pointer">
          + {t("reminder.create")}
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {reminders?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">{t("reminder.noReminders")}</p>
        )}
        {reminders?.map(r => (
          <div key={r.id} className={cn(
            "bg-slate-900 border rounded-card px-5 py-4 flex items-start gap-4",
            r.isActive ? "border-border" : "border-border opacity-60"
          )}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-primary">{r.title ?? t(`reminder.type.${r.type}`)}</p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-sm border",
                  r.isActive
                    ? "text-color-series border-color-series/30 bg-color-series/10"
                    : "text-text-muted border-border"
                )}>
                  {r.isActive ? t("reminder.active") : t("reminder.inactive")}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {t(`reminder.type.${r.type}`)} · {t(`reminder.channel.${r.channel}`)}
              </p>
              {r.scheduledAt && (
                <p className="text-xs text-text-muted">{formatDate(r.scheduledAt.toString())}</p>
              )}
              {r.isRecurring && r.intervalDays && (
                <p className="text-xs text-text-muted">
                  {t("reminder.intervalDays")}: {r.intervalDays}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => update.mutate({ id: r.id, isActive: !r.isActive })}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                {r.isActive ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => { if (confirm("Silinsin mi?")) del.mutate({ id: r.id }); }}
                className="text-xs text-text-muted hover:text-color-food transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t("reminder.create")} size="md">
        <div className="space-y-4">
          <Select
            label={t("reminder.type")}
            value={type}
            onChange={v => setType(v as typeof TYPES[number])}
            options={TYPES.map(tp => ({ value: tp, label: t(`reminder.type.${tp}`) }))}
          />
          <Select
            label={t("reminder.channel")}
            value={channel}
            onChange={v => setChannel(v as typeof CHANNELS[number])}
            options={CHANNELS.map(c => ({ value: c, label: t(`reminder.channel.${c}`) }))}
          />
          {type === "manual" && (
            <DateTimePicker
              label={t("reminder.scheduledAt")}
              value={scheduledAt}
              onChange={setScheduledAt}
            />
          )}
          <div>
            <input
              className="w-full bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-color-series/40 transition-colors"
              placeholder={`${t("reminder.title")} (opsiyonel)`}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <Checkbox
            checked={recurring}
            onChange={setRecurring}
            label={t("reminder.recurring")}
            color="var(--color-series)"
          />
          {recurring && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">{t("reminder.intervalDays")}</span>
              <input
                type="number"
                min={1}
                max={365}
                value={intervalDays}
                onChange={e => setIntervalDays(parseInt(e.target.value) || 7)}
                className="w-20 bg-slate-800 border border-border rounded-sm px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              />
            </div>
          )}
          <Button
            className="w-full mt-2 cursor-pointer"
            onClick={() => create.mutate({
              type, channel,
              scheduledAt: type === "manual" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
              isRecurring: recurring,
              intervalDays: recurring ? intervalDays : undefined,
              title: title || undefined,
            })}
            loading={create.isPending}
            style={{ background: "var(--color-series)", color: "#fff" }}
          >
            {t("actions.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
