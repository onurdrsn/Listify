import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { useAuthStore } from "../../store/authStore";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const updateUser = useAuthStore(s => s.updateUser);
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => updateUser({ locale: data.locale as "tr" | "en" }),
  });

  const toggle = () => {
    const next = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(next);
    localStorage.setItem("listify_lang", next);
    updateProfile.mutate({ locale: next });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-slate-800 transition-colors border border-border cursor-pointer"
    >
      <span>{i18n.language === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}</span>
      <span className="text-text-muted">→</span>
      <span>{i18n.language === "tr" ? "EN" : "TR"}</span>
    </button>
  );
}
