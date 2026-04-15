import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppTheme =
  | "system"
  | "light"
  | "dark"
  | "neon"
  | "glass"
  | "purple-ai"
  | "student"
  | "business"
  | "space"
  | "religious"
  | "peaceful"
  | "philosophy";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: AppTheme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: AppTheme;
  resolvedTheme: Exclude<AppTheme, "system">;
  setTheme: (theme: AppTheme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

function resolveTheme(theme: AppTheme): Exclude<AppTheme, "system"> {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "khus-desi-converter-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(() => (localStorage.getItem(storageKey) as AppTheme) || defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<Exclude<AppTheme, "system">>(() => resolveTheme(theme));

  useEffect(() => {
    const root = window.document.documentElement;
    const nextResolvedTheme = resolveTheme(theme);
    setResolvedTheme(nextResolvedTheme);
    root.classList.remove("light", "dark");
    root.classList.add(nextResolvedTheme === "light" || nextResolvedTheme === "student" || nextResolvedTheme === "business" || nextResolvedTheme === "religious" || nextResolvedTheme === "peaceful" ? "light" : "dark");
    root.dataset.theme = nextResolvedTheme;
  }, [theme]);

  const setTheme = (value: AppTheme) => {
    localStorage.setItem(storageKey, value);
    setThemeState(value);
  };

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
