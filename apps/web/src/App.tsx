import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Shell } from "./components/layout/Shell";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Movies } from "./pages/Movies";
import { Series } from "./pages/Series";
import { Books } from "./pages/Books";
import { Food } from "./pages/Food";
import { Shopping } from "./pages/Shopping";
import { Reminders } from "./pages/Reminders";
import { Stats } from "./pages/Stats";
import { Settings } from "./pages/Settings";
import { Toast } from "./components/ui/Toast";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  if (!token) return <Navigate to="/giris" replace />;
  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const user = useAuthStore(s => s.user);

  // Kullanıcı dil tercihini i18n'e yansıt
  useEffect(() => {
    if (user?.locale) i18n.changeLanguage(user.locale);
  }, [user?.locale]);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/"       element={<Landing />} />
        <Route path="/giris"  element={<Auth mode="login" />} />
        <Route path="/kayit"  element={<Auth mode="register" />} />
        <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/filmler"        element={<Movies />} />
          <Route path="/diziler"        element={<Series />} />
          <Route path="/kitaplar"       element={<Books />} />
          <Route path="/yemek"          element={<Food />} />
          <Route path="/alisveris"      element={<Shopping />} />
          <Route path="/hatirlatmalar"  element={<Reminders />} />
          <Route path="/istatistikler"  element={<Stats />} />
          <Route path="/ayarlar"        element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
