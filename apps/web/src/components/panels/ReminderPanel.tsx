import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import { DateTimePicker } from "../ui/DateTimePicker";
import { useToastStore } from "../ui/Toast";

interface ReminderPanelProps {
  open: boolean;
  onClose: () => void;
  itemId?: string;
  wittyKey?: string;
}

const TYPES    = ["manual","weekly_digest","smart_idle"] as const;
const CHANNELS = ["both","in_app","email"] as const;

export function ReminderPanel({ open, onClose, itemId, wittyKey }: ReminderPanelProps) {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();
  const [type, setType] = useState<typeof TYPES[number]>("manual");
  const [channel, setChannel] = useState<typeof CHANNELS[number]>("both");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState(7);
  const [title, setTitle] = useState("");

  const create = trpc.reminders.create.useMutation({
    onSuccess: () => {
      toast("success", t("toast.reminderSet"));
      onClose();
      setTitle(""); setScheduledAt(""); setRecurring(false);
    },
    onError: (e) => toast("error", e.message),
  });

  const handleSubmit = () => {
    if (type === "manual" && !scheduledAt) {
      toast("error", "Lütfen bir tarih/saat seçin");
      return;
    }
    create.mutate({
      itemId,
      type,
      channel,
      scheduledAt: type === "manual" ? new Date(scheduledAt).toISOString() : undefined,
      isRecurring: recurring,
      intervalDays: recurring ? intervalDays : undefined,
      title: title || undefined,
      wittyKey,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={t("reminder.create")} size="md">
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
          onClick={handleSubmit}
          loading={create.isPending}
          style={{ background: "var(--color-series)", color: "#fff" }}
        >
          {t("actions.save")}
        </Button>
      </div>
    </Modal>
  );
}
