import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import PrediccionesPage from "./pages/PrediccionesPage";
import MetodologiaPage from "./pages/MetodologiaPage";
import EquipoPage from "./pages/EquipoPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predicciones" element={<PrediccionesPage />} />
          <Route path="/metodologia" element={<MetodologiaPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
