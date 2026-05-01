import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useDarkModeStore = create<DarkModeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          document.documentElement.classList.toggle("dark", newDarkMode);
          return { isDarkMode: newDarkMode };
        });
      },
      setDarkMode: (darkMode: boolean) => {
        set({ isDarkMode: darkMode });
        document.documentElement.classList.toggle("dark", darkMode);
      },
    }),
    {
      name: "dark-mode-storage",
      onRehydrateStorage: () => (state) => {
        // Initialize dark mode based on stored state
        if (state) {
          document.documentElement.classList.toggle("dark", state.isDarkMode);
        }
      },
    }
  )
);
