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
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
} from "lucide-react";

// =========================
// CONSTANTES DE ESTILO
// =========================
const COLOR_PRIMARIO = "#3b82f6"; // blue-500
const COLOR_SECUNDARIO = "#10b981"; // emerald-500
const COLOR_ERROR = "#ef4444"; // red-500

// =========================
// HELPERS
// =========================
const formatUSD = (v) =>
  typeof v === "number" ? `${v.toFixed(2)} USD` : "N/D";

const formatPct = (v) =>
  typeof v === "number" ? `${v.toFixed(2)}%` : "N/D";

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

  const empresas = datos?.empresas ?? [];

  // =========================
  // Horas UTC y CDMX de ultima_actualizacion
  // =========================
  const updatedAtRaw = datos?.ultima_actualizacion;
  const { updatedUTC, updatedCDMX } = useMemo(() => {
    if (!updatedAtRaw) {
      return { updatedUTC: "", updatedCDMX: "" };
    }

    let updatedAt = new Date(updatedAtRaw);
    if (Number.isNaN(updatedAt.getTime())) {
      updatedAt = new Date(updatedAtRaw + "Z");
    }

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

  // =========================
  // Empresa seleccionada
  // =========================
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
  // Métricas globales
  // =========================
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
          muestras: 0,
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
        muestras: valid.length,
      };
    });
  }, [empresas]);

  const resumenGlobal = useMemo(() => {
    if (!empresas.length) {
      return {
        tasaGlobal: 0,
        totalEvaluados: 0,
        totalAciertos: 0,
        mejor: null,
        peor: null,
      };
    }

    let totalEvaluados = 0;
    let totalAciertos = 0;
    let mejor = null;
    let peor = null;

    empresas.forEach((e) => {
      const hist = e.historico ?? [];
      const valid = hist.filter(
        (d) =>
          typeof d.error_pct === "number" &&
          !Number.isNaN(d.error_pct) &&
          d.precio_predicho != null
      );
      if (!valid.length) return;

      const aciertos = valid.filter((d) => d.acierto).length;
      const tasa = (aciertos / valid.length) * 100;
      const sumError = valid.reduce(
        (acc, d) => acc + Math.abs(d.error_pct || 0),
        0
      );
      const errorMedio = sumError / valid.length;

      totalEvaluados += valid.length;
      totalAciertos += aciertos;

      const resumenEmpresa = {
        ticker: e.ticker,
        nombre: e.nombre ?? e.ticker,
        tasaAciertos: tasa,
        errorMedio,
      };

      if (!mejor || tasa > mejor.tasaAciertos) {
        mejor = resumenEmpresa;
      }
      if (!peor || tasa < peor.tasaAciertos) {
        peor = resumenEmpresa;
      }
    });

    const tasaGlobal =
      totalEvaluados > 0 ? (totalAciertos / totalEvaluados) * 100 : 0;

    return { tasaGlobal, totalEvaluados, totalAciertos, mejor, peor };
  }, [empresas]);

  // =========================
  // Métrica empresa seleccionada
  // =========================
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

  // =========================
  // Datos para gráficos
  // =========================

  // Precio real vs predicción (solo días donde hay ambos valores)
  const datosPrecioChart = useMemo(() => {
    const valid = historico.filter(
      (d) =>
        typeof d.precio_real === "number" &&
        typeof d.precio_predicho === "number"
    );
    return valid.map((d) => ({
      fecha: d.fecha,
      real: d.precio_real,
      prediccion: d.precio_predicho,
    }));
  }, [historico]);

  // Dominio Y dinámico para aumentar contraste
  const yDomainPrecio = useMemo(() => {
    if (!datosPrecioChart.length) return ["auto", "auto"];
    let min = Infinity;
    let max = -Infinity;
    datosPrecioChart.forEach((d) => {
      min = Math.min(min, d.real, d.prediccion);
      max = Math.max(max, d.real, d.prediccion);
    });
    if (!Number.isFinite(min) || !Number.isFinite(max)) return ["auto", "auto"];
    const padding = (max - min || 1) * 0.08;
    return [min - padding, max + padding];
  }, [datosPrecioChart]);

  // Sparkline últimos N días (precio real)
  const sparklineData = useMemo(() => {
    const n = 30;
    const slice =
      historico.length > n
        ? historico.slice(historico.length - n)
        : historico;
    return slice
      .map((d) => ({
        fecha: d.fecha,
        precio: typeof d.precio_real === "number" ? d.precio_real : null,
      }))
      .filter((d) => d.precio !== null);
  }, [historico]);

  // Error diario de predicción
  const errorChartData = useMemo(() => {
    const valid = historico.filter(
      (d) =>
        typeof d.error_pct === "number" && !Number.isNaN(d.error_pct)
    );
    return valid.map((d) => ({
      fecha: d.fecha,
      error: d.error_pct,
      acierto: d.acierto ? 1 : 0,
    }));
  }, [historico]);

  // Perfil del activo (barras 0–100)
  const perfilActivoChartData = useMemo(() => {
    if (!empresa?.estado_actual) return [];
    const ea = empresa.estado_actual;

    const precision = Math.max(
      0,
      Math.min(100, ea.precision_backtesting_pct ?? 0)
    );

    // Más cerca de 50 es mejor (RSI neutro)
    const rsiScore =
      typeof ea.rsi === "number"
        ? 100 - Math.abs(ea.rsi - 50) * 2
        : 0;

    // Tendencia basada en 20 días, centrada en 50
    const tendenciaScore =
      ((ea.tendencia_20d_pct ?? 0) / 10) * 50 + 50;

    // Menos volatilidad = mejor score
    const volatilidadScore = Math.max(
      0,
      100 - (ea.volatilidad_pct ?? 0) * 10
    );

    return [
      { indicador: "Precisión (%)", valor: precision, meta: 90 },
      { indicador: "RSI saludable", valor: rsiScore, meta: 75 },
      { indicador: "Tendencia 20d", valor: tendenciaScore, meta: 50 },
      { indicador: "Volatilidad", valor: volatilidadScore, meta: 80 },
    ];
  }, [empresa]);

  const estado = empresa?.estado_actual ?? {};
  const predMañana = empresa?.prediccion_manana ?? {};

  // =========================
  // Early returns
  // =========================
  if (!datos) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-medium text-slate-700">
          Cargando datos de predicción...
        </p>
      </div>
    );
  }

  if (!empresas.length || !empresa) {
    return (
      <section className="py-20 bg-gray-50">
        <h1 className="text-3xl font-bold text-slate-900 text-center">
          Predicciones por empresa
        </h1>
        <p className="text-center text-md text-slate-600 mt-4">
          No hay datos disponibles en el historial todavía.
        </p>
      </section>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <section className="flex flex-col gap-8 p-6 lg:p-10 min-h-screen">
      {/* HEADER */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Predicciones por empresa
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Selecciona una empresa tecnológica para ver la predicción
              para mañana, el resultado de hoy y el historial de
              desempeño del modelo.
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-0.5 p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
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

        {/* MÉTRICAS GLOBALES */}
        <div className="mt-1 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 rounded-2xl bg-linear-to-r from-sky-600 via-indigo-600 to-sky-700 text-white p-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide opacity-80">
              Precisión global del modelo
            </p>
            <p className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">
              {resumenGlobal.totalEvaluados
                ? `${resumenGlobal.tasaGlobal.toFixed(1)}%`
                : "N/D"}
            </p>
            <p className="mt-1 text-xs text-sky-50">
              Basado en{" "}
              <span className="font-semibold">
                {resumenGlobal.totalEvaluados}
              </span>{" "}
              días evaluados entre{" "}
              <span className="font-semibold">{empresas.length}</span>{" "}
              empresas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mejor desempeño
            </p>
            {resumenGlobal.mejor ? (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {resumenGlobal.mejor.nombre} (
                  {resumenGlobal.mejor.ticker})
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Tasa de aciertos:{" "}
                  <span className="font-semibold text-emerald-600">
                    {resumenGlobal.mejor.tasaAciertos.toFixed(1)}%
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  Error medio:{" "}
                  <span className="font-semibold">
                    {formatPct(resumenGlobal.mejor.errorMedio)}
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Aún no hay suficientes datos globales.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mayor margen de mejora
            </p>
            {resumenGlobal.peor ? (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {resumenGlobal.peor.nombre} (
                  {resumenGlobal.peor.ticker})
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Tasa de aciertos:{" "}
                  <span className="font-semibold text-amber-600">
                    {resumenGlobal.peor.tasaAciertos.toFixed(1)}%
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  Error medio:{" "}
                  <span className="font-semibold">
                    {formatPct(resumenGlobal.peor.errorMedio)}
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Aún no hay suficientes datos globales.
              </p>
            )}
          </div>
        </div>
      </header>

      {/* SELECTOR DE EMPRESA */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <label className="block text-xs text-slate-600">
              Empresa
            </label>
            <select
              value={tickerSeleccionado}
              onChange={(e) => setTickerSeleccionado(e.target.value)}
              className="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  e.ticker === tickerSeleccionado
                    ? "bg-blue-600 text-white shadow-blue-300/50 scale-[1.02]"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {e.ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid xl:grid-cols-[1.1fr,1.5fr] gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA */}
        <div className="flex flex-col gap-6">
          {/* PREDICCIÓN PARA MAÑANA */}
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-lg font-extrabold text-blue-600 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Predicción para mañana
              </h2>
              <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {empresa.ticker}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-2">
              Fecha de pronóstico:{" "}
              <strong>{predMañana.fecha_prediccion || "N/A"}</strong>
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              {typeof predMañana.precio_predicho === "number"
                ? formatUSD(predMañana.precio_predicho)
                : "Sin datos"}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span
                className={`text-sm font-semibold flex items-center gap-1 ${
                  predMañana.tendencia === "sube"
                    ? "text-emerald-600"
                    : predMañana.tendencia === "baja"
                    ? "text-red-600"
                    : "text-slate-700"
                }`}
              >
                {predMañana.tendencia === "sube" ? (
                  <TrendingUp className="h-5 w-5" />
                ) : predMañana.tendencia === "baja" ? (
                  <TrendingDown className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
                Tendencia:{" "}
                {predMañana.tendencia
                  ? predMañana.tendencia.toUpperCase()
                  : "N/D"}
              </span>
              {typeof predMañana.cambio_diario_pct === "number" && (
                <span
                  className={`text-sm font-medium ${
                    predMañana.cambio_diario_pct >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {formatPct(predMañana.cambio_diario_pct)}
                </span>
              )}
            </div>

            {/* Sparkline */}
            {sparklineData.length > 1 && (
              <div className="mt-5 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sparklineData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="sparkTrend"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLOR_PRIMARIO}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLOR_PRIMARIO}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-md text-xs">
                              <p className="font-bold">
                                {payload[0].payload.fecha}
                              </p>
                              <p className="text-blue-600">
                                Precio:{" "}
                                {formatUSD(payload[0].value ?? null)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="precio"
                      stroke={COLOR_PRIMARIO}
                      fill="url(#sparkTrend)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 text-center mt-1">
                  Precio real (Últimos {sparklineData.length} días)
                </p>
              </div>
            )}
          </div>

          {/* PREDICCIÓN AYER VS REAL HOY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Predicción de ayer vs valor real de hoy
            </h2>
            {ultimaFila ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Fecha evaluada:
                  </p>
                  <p className="text-xs font-semibold">
                    {ultimaFila.fecha}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">
                      Predicho
                    </p>
                    <p className="text-base font-semibold">
                      {ultimaFila.precio_predicho != null
                        ? `${ultimaFila.precio_predicho.toFixed(
                            2
                          )} USD`
                        : "N/D"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] text-slate-500">Real</p>
                    <p className="text-base font-semibold">
                      {ultimaFila.precio_real != null
                        ? `${ultimaFila.precio_real.toFixed(2)} USD`
                        : "N/D"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Error relativo:
                  </p>
                  <p className="text-xs font-semibold">
                    {formatPct(ultimaFila.error_pct ?? 0)}
                  </p>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Resultado:
                  </span>
                  {ultimaFila.acierto ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      ✅ Acierto (dentro del umbral)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                      ❌ Fuera del umbral
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Sin datos recientes.
              </p>
            )}
          </div>

          {/* DESEMPEÑO HISTÓRICO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Desempeño histórico del modelo
            </h2>
            {totalEvaluados === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no hay suficientes datos para evaluar el desempeño.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-600">Tasa de aciertos:</p>
                  <strong className="text-2xl font-bold text-blue-600">
                    {tasaAciertos.toFixed(1)}%
                  </strong>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-600">
                    Error medio absoluto:
                  </p>
                  <strong className="text-lg font-bold text-red-600">
                    {formatPct(errorMedio)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-600">Días evaluados:</p>
                  <strong className="text-lg font-bold text-slate-800">
                    {totalEvaluados}
                  </strong>
                </div>

                {/* Donut CSS */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 relative overflow-hidden shadow-inner">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${COLOR_SECUNDARIO} 0% ${tasaAciertos}%, ${COLOR_ERROR} ${tasaAciertos}% 100%)`,
                      }}
                    ></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {tasaAciertos.toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                    Aciertos
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-3 mr-1"></span>
                    Fallos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ESTADO ACTUAL DEL ACTIVO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Estado actual y perfil del activo
            </h2>

            {/* Señal: SOLO UNA VEZ */}
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 mb-4 pb-4 border-b">
              <p className="col-span-2 flex items-center gap-2 text-sm">
                <span className="text-slate-600 font-medium">Señal:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      estado.senal?.includes("VENDER")
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : estado.senal?.includes("COMPRAR")
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}
                >
                  {/* SOLO usamos estado.senal, por si ya trae emoji adentro */}
                  <span>{estado.senal || "N/D"}</span>
                </span>
              </p>

              <p>
                Precio: <strong>{formatUSD(estado.precio_actual)}</strong>
              </p>
              <p>
                RSI:{" "}
                <strong>
                  {estado.rsi != null
                    ? `${estado.rsi.toFixed(1)} (${estado.rsi_estado || "N/D"})`
                    : "N/D"}
                </strong>
              </p>
              <p>
                Tendencia 5 días:{" "}
                <strong>{formatPct(estado.tendencia_5d_pct)}</strong>
              </p>
              <p>
                Tendencia 20 días:{" "}
                <strong>{formatPct(estado.tendencia_20d_pct)}</strong>
              </p>
              <p>
                Volatilidad:{" "}
                <strong>{formatPct(estado.volatilidad_pct)}</strong>
              </p>
            </div>

            <h3 className="text-xs font-semibold text-slate-600 mb-2">
              Puntuación del modelo técnico (0–100)
            </h3>

            {perfilActivoChartData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={perfilActivoChartData}
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                      type="category"
                      dataKey="indicador"
                      stroke="#64748b"
                      width={110}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value.toFixed(0)}`,
                        props.payload.indicador,
                      ]}
                    />
                    <Bar
                      dataKey="valor"
                      fill={COLOR_PRIMARIO}
                      radius={[4, 4, 0, 0]}
                      name="Score"
                    />
                    {perfilActivoChartData.map((entry, index) => (
                      <ReferenceLine
                        key={`meta-${index}`}
                        x={entry.meta}
                        stroke={COLOR_SECUNDARIO}
                        strokeDasharray="3 3"
                        isFront={true}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Sin indicadores de perfil.
              </p>
            )}

            <p className="text-xs text-slate-500 mt-2 text-center">
              Línea punteada verde = meta óptima para cada indicador.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex flex-col gap-4">
          {/* PRECIO REAL VS PREDICCIÓN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[260px]">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Precio real vs predicción (solo días evaluados)
            </h2>
            {datosPrecioChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={datosPrecioChart}
                  margin={{ top: 10, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={yDomainPrecio}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number"
                        ? `${value.toFixed(2)} USD`
                        : value
                    }
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke="#0f766e"
                    name="Real"
                    strokeWidth={2.8}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="prediccion"
                    stroke="#0ea5e9"
                    name="Predicción"
                    strokeWidth={2.8}
                    dot={{ r: 3 }}
                    strokeDasharray="4 2"
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">
                No hay suficientes días con datos reales y predicción
                para comparar.
              </p>
            )}
          </div>

          {/* ERROR DIARIO DE PREDICCIÓN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[220px]">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Error diario de predicción
            </h2>
            {errorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={errorChartData}>
                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number"
                        ? `${value.toFixed(2)}%`
                        : value
                    }
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <ReferenceLine
                    y={3.5}
                    stroke="#22c55e"
                    strokeDasharray="4 4"
                    label={{
                      value: "Umbral 3.5%",
                      position: "insideTopRight",
                      fill: "#16a34a",
                      fontSize: 11,
                    }}
                  />
                  <Bar
                    dataKey="error"
                    name="Error %"
                    radius={[6, 6, 0, 0]}
                    fill="url(#errorGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="errorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="10%"
                        stopColor="#fb7185"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="90%"
                        stopColor="#fb7185"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">
                No hay datos de error todavía.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* COMPARACIÓN ENTRE EMPRESAS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900">
            Comparación del desempeño entre empresas
          </h2>
          <p className="text-xs text-slate-500">
            Las barras muestran qué tanto acierta el modelo y la línea indica el error promedio en sus predicciones.
          </p>
        </div>
        {comparacionEmpresas.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={comparacionEmpresas}
              margin={{ top: 16, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis dataKey="ticker" />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke={COLOR_PRIMARIO}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={COLOR_ERROR}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <Tooltip
                formatter={(v, name) => [
                  `${Number(v).toFixed(2)}%`,
                  name === "tasaAciertos"
                    ? "Tasa de aciertos"
                    : "Error medio",
                ]}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="tasaAciertos"
                name="Tasa de aciertos"
                fill={COLOR_PRIMARIO}
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorMedio"
                name="Error medio absoluto"
                stroke={COLOR_ERROR}
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500">
            Todavía no hay suficientes empresas con historial para
            comparar.
          </p>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Historial detallado: {empresa.nombre} ({empresa.ticker})
        </h2>
        {historico.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200 shadow-md">
  <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-700 text-white sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-right py-3 px-4">Real (USD)</th>
                  <th className="text-right py-3 px-4">
                    Predicho (USD)
                  </th>
                  <th className="text-right py-3 px-4">
                    Error abs. %
                  </th>
                  <th className="text-center py-3 px-4">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {historico
                  .slice()
                  .reverse()
                  .map((fila, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50 transition-colors border-b border-slate-100"
                    >
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {fila.fecha}
                      </td>
                      <td className="py-3 px-4 text-slate-800 text-right">
                        {fila.precio_real != null
                          ? fila.precio_real.toFixed(2)
                          : "N/D"}
                      </td>
                      <td className="py-3 px-4 text-blue-600 text-right font-semibold">
                        {fila.precio_predicho != null
                          ? fila.precio_predicho.toFixed(2)
                          : "N/D"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          typeof fila.error_pct === "number" &&
                          Math.abs(fila.error_pct) <= 3.5
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {fila.error_pct != null
                          ? Math.abs(fila.error_pct).toFixed(2) + "%"
                          : "N/D"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {fila.acierto == null ? (
                          <span className="text-slate-400">—</span>
                        ) : fila.acierto ? (
                          <span className="text-2xl">✅</span>
                        ) : (
                          <span className="text-2xl">❌</span>
                        )}
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
