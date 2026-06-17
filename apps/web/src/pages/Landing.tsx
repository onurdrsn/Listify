import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { AuthModal } from "../components/AuthModal";

const FEATURES = [
  { key: "feature1", icon: "📚", hoverClass: "hover:border-book/40 hover:shadow-glow-book" },
  { key: "feature2", icon: "🔔", hoverClass: "hover:border-series/40 hover:shadow-glow-series" },
  { key: "feature3", icon: "🌍", hoverClass: "hover:border-shop/40 hover:shadow-glow-shop" },
] as const;

const LIST_PREVIEWS = [
  { icon: "🎬", color: "var(--color-film)",   label: "Film",      hoverClass: "hover:border-film/40 hover:shadow-glow-film" },
  { icon: "📺", color: "var(--color-series)", label: "Dizi",      hoverClass: "hover:border-series/40 hover:shadow-glow-series" },
  { icon: "📖", color: "var(--color-book)",   label: "Kitap",     hoverClass: "hover:border-book/40 hover:shadow-glow-book" },
  { icon: "🍽️", color: "var(--color-food)",   label: "Yemek",     hoverClass: "hover:border-food/40 hover:shadow-glow-food" },
  { icon: "🛒", color: "var(--color-shop)",   label: "Alışveriş", hoverClass: "hover:border-shop/40 hover:shadow-glow-shop" },
];

export function Landing() {
  const { t } = useTranslation();
  const token = useAuthStore(s => s.token);
  const navigate = useNavigate();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => { if (token) navigate("/dashboard"); }, [token]);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Spiral dekorasyon */}
      <div className="notebook-spiral w-full z-10" />

      {/* Arkaplan Ambient Glow Efektleri */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-series/10 to-film/10 rounded-full blur-3xl opacity-40 pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-book/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-food/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sticky Glassmorphic Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 flex items-center justify-between px-8 py-5 border-b border-border w-full">
        <span className="text-2xl font-extrabold cursor-pointer hover:opacity-90 transition-opacity" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
          Listify
        </span>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>{t("auth.login")}</Button>
          <Button size="sm" onClick={() => openAuth("register")} style={{ background: "var(--color-film)", color: "#0A0C10" }} className="font-semibold hover:opacity-90 shadow-md hover:shadow-glow-film">{t("landing.cta")}</Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 flex flex-col items-center justify-center text-center min-h-[85vh] relative z-10">
        {/* Liste tipi renk noktaları */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {LIST_PREVIEWS.map(lp => (
            <div
              key={lp.label}
              className={`w-16 h-16 rounded-card flex flex-col items-center justify-center gap-1 border border-border bg-slate-900/60 backdrop-blur-sm transition-all duration-300 cursor-default ${lp.hoverClass}`}
            >
              <span className="text-2xl">{lp.icon}</span>
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: lp.color }}>{lp.label}</span>
            </div>
          ))}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6 leading-tight tracking-tight drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" style={{ fontFamily: "var(--font-display)" }}>
          {t("landing.hero")}
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {t("landing.heroSub")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 w-full sm:w-auto">
          <Button size="lg" onClick={() => openAuth("register")} style={{ background: "var(--color-film)", color: "#0A0C10" }} className="w-full sm:w-48 font-bold text-base hover:scale-105 hover:shadow-glow-film transition-all duration-300">{t("landing.cta")}</Button>
          <Button variant="outline" size="lg" onClick={() => openAuth("login")} className="w-full sm:w-48 hover:scale-105 transition-all duration-300">{t("landing.ctaLogin")}</Button>
        </div>

        {/* Özellikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          {FEATURES.map((f, i) => (
            <div key={f.key} className={`bg-slate-900/50 backdrop-blur-sm border border-border rounded-card p-8 transition-all duration-500 hover:-translate-y-2 ${f.hoverClass}`}>
              <div className="w-14 h-14 bg-slate-800/60 rounded-xl flex items-center justify-center border border-border mb-6 shadow-sm">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {t(`landing.${f.key}Title`)}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">{t(`landing.${f.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultMode={authMode} 
      />
    </div>
  );
}
