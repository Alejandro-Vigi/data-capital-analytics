import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="max-w-6xl mx-auto w-full pt-4 pb-10 px-4 md:px-10">
      {/* GRID principal */}
      <div className="grid md:grid-cols-[1.1fr,1fr] md:gap-5 items-center">
        {/* Columna izquierda: texto principal */}
        <div>
          <p className="text-[0.7rem] md:text-[1rem] uppercase font-black tracking-[0.2em] text-indigo-500 mb-2">
            Predicción diaria · 10 empresas tecnológicas
          </p>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Analiza si conviene invertir con predicciones diarias basadas en
            datos reales.
          </h1>

          <p className="text-slate-600 mb-2 text-base">
            Data Capital Analytics es una plataforma que une ciencia de datos
            con una interfaz web moderna para ayudarte a entender cómo se
            comportan las acciones tecnológicas día a día. Tomamos información
            real del mercado, la procesamos con modelos construidos en Python y
            generamos proyecciones que comparamos contra lo que realmente
            sucedió. Todo se acumula en un historial que muestra, sin adornos,
            si el modelo está mejorando, fallando o afinándose con el tiempo.
            <br />
            <br />
            No adivinamos. No especulamos. Analizamos, proyectamos y validamos.
          </p>
        </div>

        {/* 👉 Columna derecha: botones + texto + imagen */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-20 mt-8 md:mt-0">
          {/* Bloque: botones + texto */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            {/* Botones: columna en móvil, fila en desktop */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full md:w-auto justify-center md:justify-start">
              <Link
                to="/predicciones"
                className="px-5 py-2.5 w-full md:w-48 text-center rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Ver predicciones de hoy
              </Link>

              <Link
                to="/metodologia"
                className="px-5 py-2.5 w-full md:w-48 text-center rounded-full border border-slate-300 text-sm text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Ver metodología
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-500 text-center md:self-center mb-2">
              Actualizamos diariamente el historial y los valores <br />
              reales del mercado para mantener el modelo siempre al día.
            </p>
          </div>

          {/* Imagen de contexto (solo desktop) */}
          <div className="hidden md:block">
            <img
              src="/hero-finance.webp"
              alt="Panel de análisis financiero y datos de mercado"
              className="w-full max-w-sm mx-auto rounded-2xl shadow-md object-cover"
            />
          </div>
        </div>
      </div>

      {/* Tarjeta inferior */}
      <div className="space-y-4 mt-6">
        <div className="rounded-2xl border border-slate-200 p-6 bg-linear-to-b from-indigo-50/70 to-emerald-50/70 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            ¿Qué ofrece Data Capital Analytics?
          </h2>

          <ul className="text-sm text-justify text-slate-600 space-y-2 list-disc list-inside">
            <li>
              Predicción diaria del precio de cierre para 10 empresas
              tecnológicas líderes, generada con modelos en Python que se
              recalibran automáticamente con datos reales del mercado.
            </li>

            <li>
              Comparativa inmediata entre la proyección del modelo y el valor
              real registrado cada jornada, permitiendo visualizar en qué
              momentos el modelo acierta, dónde se desvía y cómo evoluciona su
              desempeño.
            </li>

            <li>
              Historial completo de errores, métricas de precisión, tendencias y
              análisis longitudinal por empresa, ofreciendo una visión profunda
              sobre la estabilidad y comportamiento del modelo a lo largo del
              tiempo.
            </li>

            <li>
              Panel de análisis interactivo construido en React, diseñado para
              explorar señales, examinar resultados en detalle, identificar
              patrones relevantes y compartir observaciones con tu equipo de
              forma clara y rápida.
            </li>

            <li>
              Consolidación automática de valores reales del mercado cada día
              hábil, manteniendo actualizado el registro histórico para evaluar
              el rendimiento del modelo con datos recientes y comparables.
            </li>

            <li>
              Metodología transparente que detalla cómo se genera cada
              predicción, qué variables intervienen en el modelo y cómo se
              valida su comportamiento frente a datos reales.
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem] text-slate-500 justify-center md:justify-start">
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-white/70">
              Frecuencia: Actualización diaria.
            </span>
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-white/70">
              Cobertura: 10 empresas tecnológicas globales.
            </span>
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-white/70">
              Método: Modelos predictivos en Python.
            </span>
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-white/70">
              Enfoque: Evaluación continua del desempeño.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
