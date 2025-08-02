import { create } from "zustand";

export const useThemeStore = create((set) => {
  // Initialize theme if not set
  if (!localStorage.getItem("chat-theme")) {
    localStorage.setItem("chat-theme", "dark");
  }

  return {
    theme: localStorage.getItem("chat-theme") || "dark",
    setTheme: (theme) => {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
    },
  };
});
