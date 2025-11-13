function MetodologiaPage() {
  return (
    <section className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Metodología y tecnologías
      </h1>

      <p className="text-sm md:text-base text-slate-600">
        Este proyecto tiene como objetivo estimar diariamente el precio
        de cierre de 10 empresas tecnológicas seleccionadas y evaluar si
        la predicción habría sido útil para tomar decisiones de
        inversión.
      </p>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Pipeline de datos
        </h2>
        <ol className="list-decimal list-inside text-sm md:text-base text-slate-600 space-y-1">
          <li>
            Obtenemos datos históricos de precio de cierre para cada
            empresa.
          </li>
          <li>
            Entrenamos un modelo de predicción en Python utilizando la
            serie de tiempo de cada acción.
          </li>
          <li>
            Cada día el modelo genera una predicción para el día
            siguiente.
          </li>
          <li>
            Guardamos la predicción y los valores reales en un archivo
            JSON compartido.
          </li>
          <li>
            La aplicación en React lee el JSON, visualiza la información
            y calcula métricas de error.
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Métricas de evaluación
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base text-slate-600 space-y-1">
          <li>Error porcentual diario para cada empresa.</li>
          <li>Error porcentual medio histórico.</li>
          <li>
            Porcentaje de días en los que el modelo acierta dentro de un
            rango de tolerancia.
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Tecnologías utilizadas
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base text-slate-600 space-y-1">
          <li>
            Python para el procesamiento de datos y generación de
            predicciones.
          </li>
          <li>React para la interfaz web e interacción con el usuario.</li>
          <li>
            Recharts para las visualizaciones interactivas de los
            precios y errores.
          </li>
          <li>
            GitHub para el control de versiones y almacenamiento del
            JSON.
          </li>
          <li>
            Netlify para el despliegue y hosting gratuito de la
            aplicación web.
          </li>
        </ul>
      </div>

      <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs md:text-sm text-red-700">
        <strong>Aviso:</strong> Este proyecto es exclusivamente con fines
        académicos. Las predicciones mostradas no deben interpretarse
        como recomendaciones de compra o venta de activos financieros.
      </div>
    </section>
  );
}

export default MetodologiaPage;
