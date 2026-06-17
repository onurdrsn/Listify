import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { useToastStore } from "../components/ui/Toast";

export function Settings() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const { add: toast } = useToastStore();

  const [name, setName] = useState(user?.name ?? "");
  const [weeklyDigest, setWeeklyDigest] = useState(user?.weeklyDigest ?? true);
  const [smartIdleDays, setSmartIdleDays] = useState(user?.smartIdleDays ?? 7);
  const [notifChannel, setNotifChannel] = useState(user?.notifChannel ?? "both");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      updateUser(data as any);
      toast("success", t("settings.saved"));
    },
    onError: (e) => toast("error", e.message),
  });

  const changePw = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast("success", t("settings.saved"));
      setCurrentPw(""); setNewPw("");
    },
    onError: (e) => toast("error", e.message),
  });

  const requestDeletion = trpc.user.requestDeletion.useMutation({
    onSuccess: () => toast("info", "Hesabınız 30 gün içinde silinecek."),
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="w-1 h-8 rounded-full bg-text-muted" />
        <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          ⚙ {t("settings.title")}
        </h1>
      </div>

      {/* Profil */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("settings.profile")}</h2>
        <Input label={t("auth.name")} value={name} onChange={e => setName(e.target.value)} />
        <Button
          onClick={() => updateProfile.mutate({ name })}
          loading={updateProfile.isPending}
          style={{ background: "var(--color-film)", color: "#0A0C10" }}
          className="cursor-pointer font-semibold"
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Bildirimler */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("settings.notifications")}</h2>

        <Select
          label={t("settings.notifChannel")}
          value={notifChannel}
          onChange={v => setNotifChannel(v as any)}
          options={[
            { value: "both",   label: t("reminder.channel.both")   },
            { value: "in_app", label: t("reminder.channel.in_app") },
            { value: "email",  label: t("reminder.channel.email")  },
          ]}
        />

        <Checkbox
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
          label={t("settings.weeklyDigest")}
          color="var(--color-film)"
        />

        <div>
          <label className="text-xs text-text-secondary block mb-1.5">{t("settings.smartIdleDays")}</label>
          <p className="text-xs text-text-muted mb-2">{t("settings.smartIdleDesc")}</p>
          <input
            type="number"
            min={0}
            max={30}
            value={smartIdleDays}
            onChange={e => setSmartIdleDays(parseInt(e.target.value) || 0)}
            className="w-24 bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-film/40"
          />
        </div>

        <Button
          onClick={() => updateProfile.mutate({ notifChannel: notifChannel as any, weeklyDigest, smartIdleDays })}
          loading={updateProfile.isPending}
          style={{ background: "var(--color-film)", color: "#0A0C10" }}
          className="cursor-pointer font-semibold"
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Şifre */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("auth.password")}</h2>
        <Input label="Mevcut şifre" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        <Input label="Yeni şifre" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
        <Button
          onClick={() => changePw.mutate({ currentPassword: currentPw, newPassword: newPw })}
          loading={changePw.isPending}
          variant="outline"
          className="cursor-pointer font-semibold"
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Hesap Silme (KVKK) */}
      <section className="bg-slate-900 border border-color-food/20 rounded-card p-6 space-y-3">
        <h2 className="text-sm font-semibold text-color-food uppercase tracking-wider">{t("settings.deleteAccount")}</h2>
        <p className="text-xs text-text-muted">{t("settings.deleteAccountDesc")}</p>
        <Button
          variant="danger"
          onClick={() => { if (confirm("Hesabınızı silmek istediğinize emin misiniz?")) requestDeletion.mutate(); }}
          loading={requestDeletion.isPending}
          className="cursor-pointer font-semibold"
        >
          {t("settings.deleteAccount")}
        </Button>
      </section>
    </div>
  );
}
