import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PrediccionesPage() {
  const [datos, setDatos] = useState(null);
  const [tickerSeleccionado, setTickerSeleccionado] = useState("");

  useEffect(() => {
    fetch("/historial.json")
      .then((res) => res.json())
      .then((data) => {
        setDatos(data);
        if (data.empresas && data.empresas.length > 0) {
          setTickerSeleccionado(data.empresas[0].ticker);
        }
      })
      .catch((err) => {
        console.error("Error al cargar historial.json", err);
      });
  }, []);

  if (!datos) {
    return <p className="text-center tx-lg pt-10">Cargando datos de predicción...</p>;
  }

  const empresa =
    datos.empresas.find((e) => e.ticker === tickerSeleccionado) ||
    datos.empresas[0];
  const historico = empresa.historico || [];
  const ultimaFila = historico[historico.length - 1];

  const errorMedio =
    historico.length > 0
      ? historico.reduce((acc, d) => acc + Math.abs(d.error_pct || 0), 0) /
        historico.length
      : 0;

  const aciertos = historico.filter((d) => d.acierto).length;
  const tasaAciertos =
    historico.length > 0 ? (aciertos / historico.length) * 100 : 0;

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Predicciones por empresa
        </h1>
        <p className="text-sm text-slate-600">
          Selecciona una empresa tecnológica para ver su predicción para
          mañana, el resultado de hoy y el historial de desempeño del
          modelo.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Última actualización del modelo:{" "}
          {new Date(datos.ultima_actualizacion).toLocaleString("es-MX")}
        </p>
      </header>

      {/* Selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs text-slate-600">
            Empresa
          </label>
          <select
            value={tickerSeleccionado}
            onChange={(e) => setTickerSeleccionado(e.target.value)}
            className="mt-1 px-2 py-1 rounded-lg border border-slate-300 text-sm"
          >
            {datos.empresas.map((e) => (
              <option key={e.ticker} value={e.ticker}>
                {e.nombre} ({e.ticker})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {datos.empresas.map((e) => (
            <button
              key={e.ticker}
              onClick={() => setTickerSeleccionado(e.ticker)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                e.ticker === tickerSeleccionado
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {e.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen + gráfica */}
      <div className="grid lg:grid-cols-[0.9fr,1.4fr] gap-6 items-stretch">
        {/* Tarjetas resumen */}
        <div className="flex flex-col gap-3">
          {/* Predicción mañana */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Predicción para mañana
            </h2>
            <p className="text-xs text-slate-500 mb-1">
              {empresa.prediccion_manana?.fecha_prediccion || "N/A"}
            </p>
            <p className="text-2xl font-bold">
              {empresa.prediccion_manana?.precio_predicho
                ? `${empresa.prediccion_manana.precio_predicho.toFixed(
                    2
                  )} USD`
                : "Sin datos"}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Tendencia esperada:{" "}
              <span className="font-semibold">
                {empresa.prediccion_manana?.tendencia
                  ? empresa.prediccion_manana.tendencia.toUpperCase()
                  : "N/D"}
              </span>
            </p>
          </div>

          {/* Autoevaluación de hoy */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Predicción de ayer vs valor real de hoy
            </h2>
            {ultimaFila ? (
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  Fecha: <strong>{ultimaFila.fecha}</strong>
                </p>
                <p>
                  Predicho:{" "}
                  <strong>
                    {ultimaFila.precio_predicho.toFixed(2)} USD
                  </strong>
                </p>
                <p>
                  Real:{" "}
                  <strong>
                    {ultimaFila.precio_real.toFixed(2)} USD
                  </strong>
                </p>
                <p>
                  Error:{" "}
                  <strong>
                    {(ultimaFila.error_pct ?? 0).toFixed(2)}%
                  </strong>
                </p>
                <p className="pt-1">
                  Resultado:{" "}
                  {ultimaFila.acierto ? (
                    <span className="text-emerald-600 font-semibold">
                      ✅ Acierto
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ❌ Fallo
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Sin datos recientes.
              </p>
            )}
          </div>

          {/* Error histórico */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Desempeño histórico del modelo
            </h2>
            <p className="text-sm text-slate-700">
              Error medio:{" "}
              <strong>{errorMedio.toFixed(2)}%</strong>
            </p>
            <p className="text-sm text-slate-700">
              Días con acierto:{" "}
              <strong>
                {aciertos}/{historico.length}
              </strong>{" "}
              ({tasaAciertos.toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-h-[260px]">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Precio real vs predicción
          </h2>
          {historico.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historico}>
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="precio_real"
                  stroke="#2563eb"
                  name="Real"
                />
                <Line
                  type="monotone"
                  dataKey="precio_predicho"
                  stroke="#16a34a"
                  name="Predicción"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">
              No hay historial suficiente.
            </p>
          )}
        </div>
      </div>

      {/* Tabla historial */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Historial de esta empresa
        </h2>
        {historico.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left py-2 px-2 border-b border-slate-200">
                    Fecha
                  </th>
                  <th className="text-right py-2 px-2 border-b border-slate-200">
                    Real (USD)
                  </th>
                  <th className="text-right py-2 px-2 border-b border-slate-200">
                    Predicho (USD)
                  </th>
                  <th className="text-right py-2 px-2 border-b border-slate-200">
                    Error %
                  </th>
                  <th className="text-center py-2 px-2 border-b border-slate-200">
                    Acierto
                  </th>
                </tr>
              </thead>
              <tbody>
                {historico.map((fila, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-slate-50">
                    <td className="py-2 px-2 border-b border-slate-100">
                      {fila.fecha}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {fila.precio_real.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {fila.precio_predicho.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {(fila.error_pct ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-center">
                      {fila.acierto ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default PrediccionesPage;
