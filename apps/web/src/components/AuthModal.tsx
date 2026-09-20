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
  
  const [mode, setMode] = useState<"login" | "register" | "activation">(defaultMode as any);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [error, setError] = useState("");
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode as any);
      setRetrySeconds(0);
      setActivationCode("");
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    if (retrySeconds > 0) {
      const timer = setTimeout(() => setRetrySeconds(r => r - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retrySeconds]);

  const locale = (i18n.language === "en" ? "en" : "tr") as "tr" | "en";

  const handleError = (e: any) => {
    const msg = e.message;
    if (msg.includes("NetworkError") || msg.includes("Failed to fetch") || msg.includes("fetch")) {
      setError(t("errors.network"));
    } else if (e.data?.code === "FORBIDDEN" && msg.includes("doğrulanmamış")) {
      setMode("activation");
      setError("");
    } else if (e.data?.code === "TOO_MANY_REQUESTS") {
      setMode("activation");
      const match = msg.match(/\d+/);
      if (match) setRetrySeconds(parseInt(match[0], 10));
      setError("");
    } else {
      setError(msg);
    }
  };

  const login = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); onClose(); },
    onError: handleError,
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: () => { setMode("activation"); setError(""); },
    onError: handleError,
  });
  const verify = trpc.auth.verify.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); onClose(); },
    onError: handleError,
  });

  const handleSubmit = () => {
    setError("");
    if (mode === "login") login.mutate({ email, password });
    else if (mode === "register") register.mutate({ email, password, name, locale });
    else if (mode === "activation") verify.mutate({ email, code: activationCode });
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
            {mode === "login" ? t("auth.loginTitle") : 
             mode === "register" ? t("auth.registerTitle") : 
             t("auth.activationTitle")}
          </p>
        </div>

        {mode === "activation" ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-text-muted mb-2">{t("auth.activationDesc")}</p>
            <Input 
              value={activationCode} 
              onChange={e => setActivationCode(e.target.value)} 
              placeholder="123456" 
              maxLength={6}
              className="text-center text-xl tracking-widest"
            />
            {error && <p className="text-sm text-color-food bg-color-food/10 p-2 rounded border border-color-food/20">{error}</p>}
            
            <Button 
              className="mt-2 w-full cursor-pointer font-bold text-base shadow-lg hover:shadow-glow-film transition-all" 
              onClick={handleSubmit} 
              loading={verify.isPending} 
              style={{ background: "var(--color-film)", color: "#0A0C10" }}
            >
              {t("auth.verify")}
            </Button>
            
            <div className="mt-4 text-sm text-text-muted">
              {retrySeconds > 0 ? (
                <p className="text-color-food">{t("auth.waitInfo", { seconds: retrySeconds })}</p>
              ) : (
                <p>{t("auth.resendInfo")}</p>
              )}
            </div>
            
            <button 
              type="button"
              onClick={() => setMode("login")} 
              className="text-color-film font-semibold hover:underline cursor-pointer text-sm mt-2"
            >
              {t("auth.login")}
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
