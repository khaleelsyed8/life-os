import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./pages/ThemeContext";
import Navbar      from "./components/layout/Navbar";
import Footer      from "./components/layout/Footer";
import ScratchPad  from "./components/ui/ScratchPad";
import SearchModal from "./components/ui/SearchModal";
import Onboarding from "./components/ui/Onboarding";

import Dashboard  from "./pages/Dashboard";
import Dictionary from "./pages/Dictionary";
import Diary      from "./pages/Diary";
import Habits     from "./pages/Habits";
import Projects   from "./pages/Projects";
import Tools      from "./pages/Tools";

/*
  AppShell reads isDark from context so it re-renders on every theme
  toggle — this causes all child components (Dashboard, etc.) to also
  re-render and repaint their CSS-variable inline styles against the
  newly active token set. backgroundColor + color are hardcoded from
  isDark so the root container is never transparent or mis-colored.
*/
function AppShell() {
  const { isDark } = useTheme();

  const bg   = isDark ? "#0a0a0f" : "#f4f4f8";
  const text = isDark ? "#f0f0f8" : "#09090b";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bg, color: text }}
    >
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Routes>
          <Route path="/"           element={<Dashboard />}  />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/diary"      element={<Diary />}      />
          <Route path="/habits"     element={<Habits />}     />
          <Route path="/projects"   element={<Projects />}   />
          <Route path="/tools"      element={<Tools />}      />
        </Routes>
      </main>

      <Footer />

      <ScratchPad />
      <SearchModal />
      <Onboarding />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}