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
  mounted: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setMounted: (mounted: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  mounted: false,

  login: (token, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `accessToken=${token}; path=/; max-age=604800; SameSite=Lax`;
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    set({ token: null, user: null });
  },

  setMounted: (mounted: boolean) => {
    if (mounted && typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        set({
          mounted: true,
          token,
          user: JSON.parse(storedUser) as User,
          isLoading: false,
        });
        return;
      }
    }
    set({ mounted, isLoading: false });
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
