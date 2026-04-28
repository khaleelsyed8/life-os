import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("lifeos-theme");
    return saved ? saved === "dark" : true;
  });

  const [userName, setUserNameState] = useState(
    () => localStorage.getItem("lifeos-username") || ""
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("lifeos-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((d) => !d);

  const setUserName = (name) => {
    const trimmed = name.trim();
    setUserNameState(trimmed);
    localStorage.setItem("lifeos-username", trimmed);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, userName, setUserName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);