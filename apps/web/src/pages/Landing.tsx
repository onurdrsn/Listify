import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";

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
  useEffect(() => { if (token) navigate("/dashboard"); }, [token]);

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
          <Link to="/giris"><Button variant="ghost" size="sm">{t("auth.login")}</Button></Link>
          <Link to="/kayit"><Button size="sm" style={{ background: "var(--color-film)", color: "#0A0C10" }} className="font-semibold hover:opacity-90">{t("landing.cta")}</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-20 flex flex-col items-center text-center relative z-10">
        {/* Liste tipi renk noktaları */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
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

        <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight whitespace-pre-line tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {t("landing.hero")}
        </h1>
        <p className="text-lg text-text-secondary mb-10 max-w-xl leading-relaxed">{t("landing.heroSub")}</p>

        <div className="flex items-center gap-4 mb-20">
          <Link to="/kayit"><Button size="lg" style={{ background: "var(--color-film)", color: "#0A0C10" }} className="font-bold hover:scale-105 transition-transform duration-200">{t("landing.cta")}</Button></Link>
          <Link to="/giris"><Button variant="outline" size="lg" className="hover:scale-105 transition-transform duration-200">{t("landing.ctaLogin")}</Button></Link>
        </div>

        {/* Özellikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {FEATURES.map(f => (
            <div key={f.key} className={`bg-slate-900/50 backdrop-blur-sm border border-border rounded-card p-6 transition-all duration-300 hover:-translate-y-1.5 ${f.hoverClass}`}>
              <div className="w-12 h-12 bg-slate-800/40 rounded-sm flex items-center justify-center border border-border mb-4">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {t(`landing.${f.key}Title`)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t(`landing.${f.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
