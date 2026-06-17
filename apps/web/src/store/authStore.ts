import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string; email: string; name: string; locale: "tr" | "en";
  notifChannel: "in_app" | "email" | "both";
  weeklyDigest: boolean; smartIdleDays: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("listify_token", token);
        set({ token, user });
      },
      updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),
      clearAuth: () => {
        localStorage.removeItem("listify_token");
        set({ token: null, user: null });
      },
    }),
    { name: "listify_auth" }
  )
);
