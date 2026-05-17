import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./pages/ThemeContext";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import ScratchPad  from "./components/ScratchPad";
import SearchModal from "./components/SearchModal";
import Onboarding  from "./components/Onboarding";

import Dashboard  from "./pages/Dashboard";
import Dictionary from "./pages/Dictionary";
import Diary      from "./pages/Diary";
import Habits     from "./pages/Habits";
import Projects   from "./pages/Projects";
import Tools      from "./pages/Tools/index";   // ← hub page

function AppShell() {
  const { isDark } = useTheme();
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: isDark ? "#0a0a0f" : "#f4f4f8", color: isDark ? "#f0f0f8" : "#09090b" }}
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