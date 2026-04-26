import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Dashboard from "./pages/Dashboard";
import Dictionary from "./pages/Dictionary";
import Diary from "./pages/Diary";
import Habits from "./pages/Habits";
import Projects from "./pages/Projects";
import Tools from "./pages/Tools";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tools" element={<Tools />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}