import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
      <div>
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-indigo-500 mb-2">
          Predicción diaria · 10 empresas tecnológicas
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
          Analiza si conviene invertir con predicciones diarias y
          autoevaluación del modelo.
        </h1>
        <p className="text-slate-600 mb-6 text-sm md:text-base">
          Data Capital Analytics utiliza modelos en Python para estimar el
          comportamiento diario de las principales acciones tecnológicas.
          Comparamos nuestras predicciones con los valores reales del
          mercado y mostramos el historial de errores para cada empresa.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <Link
            to="/predicciones"
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver predicciones de hoy
          </Link>
          <Link
            to="/metodologia"
            className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Ver metodología
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 bg-linear-to-b from-indigo-50/70 to-emerald-50/70 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          ¿Qué ofrece Data Capital Analytics?
        </h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li>
            Predicción diaria del precio de cierre para 10 empresas
            tecnológicas clave.
          </li>
          <li>Comparativa entre predicción y valor real del mercado.</li>
          <li>Historial de errores y porcentaje de aciertos por empresa.</li>
          <li>Interfaz web en React con visualizaciones interactivas.</li>
        </ul>
      </div>
    </section>
  );
}

export default HomePage;
