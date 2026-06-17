import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Auth({ mode }: { mode: "login" | "register" }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const locale = (i18n.language === "en" ? "en" : "tr") as "tr" | "en";

  const login = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); },
    onError: (e) => setError(e.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = () => {
    setError("");
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ email, password, name, locale });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-border rounded-card p-8 shadow-card anim-up">
        <div className="notebook-spiral -mx-8 -mt-8 mb-8 rounded-t-card" />
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
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
          {error && <p className="text-sm text-color-food">{error}</p>}
          <Button className="mt-2 w-full cursor-pointer font-semibold" onClick={handleSubmit} loading={login.isPending || register.isPending} style={{ background: "var(--color-film)", color: "#0A0C10" }}>
            {mode === "login" ? t("auth.login") : t("auth.register")}
          </Button>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <Link to={mode === "login" ? "/kayit" : "/giris"} className="text-color-film hover:underline">
            {mode === "login" ? t("auth.register") : t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
