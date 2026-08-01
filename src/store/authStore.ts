import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  isLoading: true,

  login: (token, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    // Set cookie for middleware access
    document.cookie = `accessToken=${token}; path=/; max-age=604800; SameSite=Lax`;
    set({ token, user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // Clear cookie
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    set({ token: null, user: null, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ token: null, user: null, isLoading: false });
      return;
    }

    try {
      const response = await axiosInstance.get("/auth/me");
      if (response.data?.success && response.data?.data) {
        const user = response.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user, isLoading: false });
      } else {
        throw new Error("Invalid response structure");
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
