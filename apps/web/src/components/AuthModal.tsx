import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) setMode(defaultMode);
  }, [isOpen, defaultMode]);

  const locale = (i18n.language === "en" ? "en" : "tr") as "tr" | "en";

  const login = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); onClose(); },
    onError: (e) => setError(e.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); onClose(); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = () => {
    setError("");
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ email, password, name, locale });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-slate-900/95 border border-border rounded-card p-8 shadow-2xl anim-up" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="notebook-spiral -mx-8 -mt-8 mb-8 rounded-t-card" />
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
            Listify
          </span>
          <p className="text-sm text-text-secondary mt-2">
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {mode === "register" && (
            <Input label={t("auth.name")} value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
          )}
          <Input label={t("auth.email")} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ada@example.com" />
          <Input label={t("auth.password")} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="text-sm text-color-food bg-color-food/10 p-2 rounded border border-color-food/20">{error}</p>}
          <Button className="mt-4 w-full cursor-pointer font-bold text-base shadow-lg hover:shadow-glow-film transition-all" onClick={handleSubmit} loading={login.isPending || register.isPending} style={{ background: "var(--color-film)", color: "#0A0C10" }}>
            {mode === "login" ? t("auth.login") : t("auth.register")}
          </Button>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <button 
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")} 
            className="text-color-film font-semibold hover:underline cursor-pointer"
          >
            {mode === "login" ? t("auth.register") : t("auth.login")}
          </button>
        </p>
      </div>
    </div>
  );
}
