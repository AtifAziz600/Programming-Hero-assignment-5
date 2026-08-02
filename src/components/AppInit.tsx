"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AppInit() {
  const setMounted = useAuthStore((state) => state.setMounted);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [setMounted, checkAuth]);

  return null;
}
