function EquipoPage() {
  const personas = [
    {
      nombre: "Tu Nombre",
      rol: "Modelado y predicción",
      descripcion:
        "Responsable del diseño del modelo y el procesamiento de datos en Python.",
    },
    {
      nombre: "Compañero 1",
      rol: "Visualización y frontend",
      descripcion:
        "Implementa la interfaz en React y las visualizaciones interactivas del dashboard.",
    },
    {
      nombre: "Compañero 2",
      rol: "Automatización y despliegue",
      descripcion:
        "Configura la ejecución diaria del modelo y el despliegue en GitHub/Netlify.",
    },
  ];

  return (
    <section className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>
      <p className="text-sm md:text-base text-slate-600">
        Este proyecto fue desarrollado por un equipo multidisciplinario
        con enfoque en ciencia de datos, visualización y desarrollo web.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {personas.map((p) => (
          <div
            key={p.nombre}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-slate-900">
              {p.nombre}
            </h2>
            <p className="text-xs text-blue-600 mb-1">{p.rol}</p>
            <p className="text-xs md:text-sm text-slate-600">
              {p.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EquipoPage;
