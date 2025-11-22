import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

function PrediccionesPage() {
  const [datos, setDatos] = useState(null);
  const [tickerSeleccionado, setTickerSeleccionado] = useState("");

  // =========================
  // Cargar historial.json
  // =========================
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

  // =========================
  // Helpers
  // =========================
  const formatUSD = (v) =>
    typeof v === "number" ? `${v.toFixed(2)} USD` : "N/D";
  const formatPct = (v) =>
    typeof v === "number" ? `${v.toFixed(2)}%` : "N/D";

  const empresas = datos?.empresas ?? [];

  // Horas UTC y CDMX de ultima_actualizacion
  const updatedAtRaw = datos?.ultima_actualizacion;
  const { updatedUTC, updatedCDMX } = useMemo(() => {
    if (!updatedAtRaw) {
      return { updatedUTC: "", updatedCDMX: "" };
    }
    // El backend guarda datetime.utcnow().isoformat() ⇒ es UTC pero sin "Z"
    const updatedAt = new Date(updatedAtRaw + "Z");

    const updatedUTC = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "UTC",
    }).format(updatedAt);

    const updatedCDMX = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "America/Mexico_City",
    }).format(updatedAt);

    return { updatedUTC, updatedCDMX };
  }, [updatedAtRaw]);

  // Empresa seleccionada
  const empresa = useMemo(() => {
    if (!empresas.length) return null;
    return (
      empresas.find((e) => e.ticker === tickerSeleccionado) ?? empresas[0]
    );
  }, [empresas, tickerSeleccionado]);

  const historico = empresa?.historico ?? [];
  const ultimaFila =
    historico.length > 0 ? historico[historico.length - 1] : null;

  // =========================
  // Métricas derivadas (useMemo para no recalcular tanto)
  // =========================

  // Error medio & tasa de acierto para empresa seleccionada
  // SOLO tomando filas donde sí hubo predicción (precio_predicho) y error_pct numérico
  const { errorMedio, aciertos, tasaAciertos, totalEvaluados } = useMemo(() => {
    if (!historico.length) {
      return { errorMedio: 0, aciertos: 0, tasaAciertos: 0, totalEvaluados: 0 };
    }

    const valid = historico.filter(
      (d) =>
        typeof d.error_pct === "number" &&
        !Number.isNaN(d.error_pct) &&
        d.precio_predicho != null
    );
    const totalEvaluados = valid.length;

    if (!totalEvaluados) {
      return { errorMedio: 0, aciertos: 0, tasaAciertos: 0, totalEvaluados: 0 };
    }

    const sumError = valid.reduce(
      (acc, d) => acc + Math.abs(d.error_pct || 0),
      0
    );
    const errorMedio = sumError / totalEvaluados;

    const aciertos = valid.filter((d) => d.acierto).length;
    const tasaAciertos = (aciertos / totalEvaluados) * 100;

    return { errorMedio, aciertos, tasaAciertos, totalEvaluados };
  }, [historico]);

  // Datos para gráfico principal: precio real vs predicción
  const datosPrecioChart = useMemo(() => {
    return historico.map((d) => ({
      fecha: d.fecha,
      real: typeof d.precio_real === "number" ? d.precio_real : null,
      prediccion:
        typeof d.precio_predicho === "number" ? d.precio_predicho : null,
    }));
  }, [historico]);

  // Sparkline de últimos N días (precio real)
  const sparklineData = useMemo(() => {
    const n = 20;
    const slice =
      historico.length > n
        ? historico.slice(historico.length - n)
        : historico;
    return slice.map((d, idx) => ({
      idx,
      precio: typeof d.precio_real === "number" ? d.precio_real : null,
    }));
  }, [historico]);

  // Gráfico de error diario
  const errorChartData = useMemo(() => {
    return historico.map((d) => ({
      fecha: d.fecha,
      error: typeof d.error_pct === "number" ? d.error_pct : 0,
      acierto: d.acierto ? 1 : 0,
    }));
  }, [historico]);

  // Comparativa entre empresas (tasa de acierto y error medio)
  const comparacionEmpresas = useMemo(() => {
    if (!empresas.length) return [];
    return empresas.map((e) => {
      const hist = e.historico ?? [];
      if (!hist.length)
        return {
          ticker: e.ticker,
          nombre: e.nombre ?? e.ticker,
          tasaAciertos: 0,
          errorMedio: 0,
        };
      const valid = hist.filter(
        (d) =>
          typeof d.error_pct === "number" &&
          !Number.isNaN(d.error_pct) &&
          d.precio_predicho != null
      );
      const sumError = valid.reduce(
        (acc, d) => acc + Math.abs(d.error_pct || 0),
        0
      );
      const errorMedio = valid.length > 0 ? sumError / valid.length : 0;
      const aciertos = valid.filter((d) => d.acierto).length;
      const tasaAciertos =
        valid.length > 0 ? (aciertos / valid.length) * 100 : 0;

      return {
        ticker: e.ticker,
        nombre: e.nombre ?? e.ticker,
        tasaAciertos,
        errorMedio,
      };
    });
  }, [empresas]);

  // Radar de estado actual de la empresa seleccionada
  const radarData = useMemo(() => {
    if (!empresa?.estado_actual) return [];
    const ea = empresa.estado_actual;

    // Normalizar valores en una escala 0–100
    const precision = Math.max(
      0,
      Math.min(100, ea.precision_backtesting_pct ?? 0)
    );
    const rsiScore =
      typeof ea.rsi === "number"
        ? 100 - Math.abs(ea.rsi - 50) * 2 // mientras más cerca de 50, mejor
        : 0;
    const tendenciaScore =
      ((ea.tendencia_20d_pct ?? 0) + (ea.tendencia_5d_pct ?? 0)) / 2 + 50;
    const volatilidadScore = Math.max(
      0,
      100 - (ea.volatilidad_pct ?? 0) * 10
    ); // menos volatilidad, mejor
    const volumenScore =
      ea.volumen_estado === "Alto"
        ? 90
        : ea.volumen_estado === "Normal"
        ? 70
        : 40;

    return [
      { indicador: "Precisión modelo", valor: precision },
      { indicador: "RSI saludable", valor: rsiScore },
      { indicador: "Tendencia", valor: tendenciaScore },
      { indicador: "Volatilidad", valor: volatilidadScore },
      { indicador: "Volumen", valor: volumenScore },
    ];
  }, [empresa]);

  // =========================
  // Early returns seguros (después de hooks)
  // =========================
  if (!datos) {
    return (
      <p className="text-center text-lg pt-10">
        Cargando datos de predicción...
      </p>
    );
  }

  if (!empresas.length || !empresa) {
    return (
      <section className="py-10">
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Predicciones por empresa
        </h1>
        <p className="text-center text-sm text-slate-600 mt-2">
          No hay datos disponibles en el historial todavía.
        </p>
      </section>
    );
  }

  const predMañana = empresa.prediccion_manana ?? {};
  const estado = empresa.estado_actual ?? {};

  return (
    <section className="flex flex-col gap-6 pb-10">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Predicciones por empresa
            </h1>
            <p className="text-sm text-slate-600">
              Selecciona una empresa tecnológica para ver su predicción para
              mañana, el resultado de hoy y el historial de desempeño del
              modelo.
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p>
              Última actualización (UTC):
              <span className="font-semibold ml-1">
                {updatedUTC || "N/D"}
              </span>
            </p>
            <p>
              Hora local (CDMX):
              <span className="font-semibold ml-1">
                {updatedCDMX || "N/D"}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* SELECTOR DE EMPRESA */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <label className="block text-xs text-slate-600">
            Empresa
          </label>
          <select
            value={tickerSeleccionado}
            onChange={(e) => setTickerSeleccionado(e.target.value)}
            className="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white shadow-sm"
          >
            {empresas.map((e) => (
              <option key={e.ticker} value={e.ticker}>
                {e.nombre} ({e.ticker})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {empresas.map((e) => (
            <button
              key={e.ticker}
              onClick={() => setTickerSeleccionado(e.ticker)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                e.ticker === tickerSeleccionado
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {e.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* GRID PRINCIPAL: CARDS + GRÁFICOS */}
      <div className="grid xl:grid-cols-[1.1fr,1.5fr] gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA - CARDS RESUMEN */}
        <div className="flex flex-col gap-3">
          {/* Predicción mañana */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Predicción para mañana
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                {empresa.ticker}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              {predMañana.fecha_prediccion || "N/A"}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {typeof predMañana.precio_predicho === "number"
                ? `${predMañana.precio_predicho.toFixed(2)} USD`
                : "Sin datos"}
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Tendencia esperada:{" "}
              <span
                className={`font-semibold ${
                  predMañana.tendencia === "sube"
                    ? "text-emerald-600"
                    : predMañana.tendencia === "baja"
                    ? "text-red-600"
                    : "text-slate-700"
                }`}
              >
                {predMañana.tendencia
                  ? predMañana.tendencia.toUpperCase()
                  : "N/D"}
              </span>
            </p>

            {/* Sparkline */}
            {sparklineData.length > 1 && (
              <div className="mt-3 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient
                        id="spark"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="precio"
                      stroke="#2563eb"
                      fill="url(#spark)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Autoevaluación hoy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                    {ultimaFila.precio_predicho != null
                      ? `${ultimaFila.precio_predicho.toFixed(2)} USD`
                      : "N/D"}
                  </strong>
                </p>
                <p>
                  Real:{" "}
                  <strong>
                    {ultimaFila.precio_real != null
                      ? `${ultimaFila.precio_real.toFixed(2)} USD`
                      : "N/D"}
                  </strong>
                </p>
                <p>
                  Error:{" "}
                  <strong>
                    {formatPct(ultimaFila.error_pct ?? 0)}
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
              <p className="text-sm text-slate-500">Sin datos recientes.</p>
            )}
          </div>

          {/* Desempeño histórico */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Desempeño histórico del modelo
            </h2>
            {totalEvaluados === 0 ? (
              <>
                <p className="text-sm text-slate-700">
                  Aún no hay suficientes datos para evaluar el desempeño.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Se necesitan al menos 1–2 días con predicciones evaluadas.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-700">
                  Error medio:{" "}
                  <strong>{formatPct(errorMedio)}</strong>
                </p>
                <p className="text-sm text-slate-700">
                  Días con acierto:{" "}
                  <strong>
                    {aciertos}/{totalEvaluados}
                  </strong>{" "}
                  ({tasaAciertos.toFixed(1)}%)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  (Acierto = predicción con error menor o igual al 2%)
                </p>
              </>
            )}
          </div>

          {/* Estado actual rápido */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Estado actual del activo
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <p>
                Precio actual:{" "}
                <strong>{formatUSD(estado.precio_actual)}</strong>
              </p>
              <p>
                RSI:{" "}
                <strong>
                  {estado.rsi?.toFixed(1)} ({estado.rsi_estado || "N/D"})
                </strong>
              </p>
              <p>
                Tendencia 5d:{" "}
                <strong>{formatPct(estado.tendencia_5d_pct)}</strong>
              </p>
              <p>
                Tendencia 20d:{" "}
                <strong>{formatPct(estado.tendencia_20d_pct)}</strong>
              </p>
              <p>
                Volatilidad:{" "}
                <strong>{formatPct(estado.volatilidad_pct)}</strong>
              </p>
              <p>
                Volumen: <strong>{estado.volumen_estado}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - GRÁFICOS PRINCIPALES */}
        <div className="flex flex-col gap-4">
          {/* Precio real vs predicción */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[260px]">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Precio real vs predicción
            </h2>
            {datosPrecioChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={datosPrecioChart}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke="#2563eb"
                    name="Real"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="prediccion"
                    stroke="#16a34a"
                    name="Predicción"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">
                No hay historial suficiente.
              </p>
            )}
          </div>

          {/* Error diario + radar estado actual */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[220px]">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Error diario de predicción
              </h2>
              {errorChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={errorChartData}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      y={2}
                      stroke="#16a34a"
                      strokeDasharray="3 3"
                      label="Umbral 2%"
                    />
                    <Bar dataKey="error" name="Error %" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay datos de error todavía.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[220px]">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Perfil del activo (modelo)
              </h2>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="indicador" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="valor"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">
                  Sin indicadores suficientes para el radar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMPARACIÓN ENTRE EMPRESAS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Comparación entre empresas
          </h2>
          <p className="text-xs text-slate-500">
            Tasa de aciertos (barras) y error medio (línea).
          </p>
        </div>
        {comparacionEmpresas.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparacionEmpresas}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="ticker" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="tasaAciertos"
                name="Tasa de aciertos (%)"
                fill="#22c55e"
              />
              <Line
                type="monotone"
                dataKey="errorMedio"
                name="Error medio (%)"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500">
            Todavía no hay suficientes empresas con historial para comparar.
          </p>
        )}
      </div>

      {/* TABLA HISTÓRICA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  <tr
                    key={idx}
                    className="odd:bg-white even:bg-slate-50"
                  >
                    <td className="py-2 px-2 border-b border-slate-100">
                      {fila.fecha}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {fila.precio_real != null
                        ? fila.precio_real.toFixed(2)
                        : "N/D"}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {fila.precio_predicho != null
                        ? fila.precio_predicho.toFixed(2)
                        : "N/D"}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-right">
                      {fila.error_pct != null
                        ? fila.error_pct.toFixed(2) + "%"
                        : "N/D"}
                    </td>
                    <td className="py-2 px-2 border-b border-slate-100 text-center">
                      {fila.acierto == null
                        ? "—"
                        : fila.acierto
                        ? "✅"
                        : "❌"}
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
