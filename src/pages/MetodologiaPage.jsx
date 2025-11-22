function MetodologiaPage() {
  return (
    <section className="max-w-5xl space-y-5 text-justify">
      <h1 className="text-2xl font-bold text-slate-900">
        Metodología y tecnologías
      </h1>

      <p className="text-sm md:text-base text-slate-600">
        Esta página resume cómo funciona el proyecto: qué datos usamos, cómo
        entrenamos el modelo de predicción, cómo se actualiza solo todos los
        días hábiles y qué significan las gráficas que ves en la sección de
        predicciones.
      </p>

      {/* PIPELINE DE DATOS */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Pipeline de datos (de la bolsa a tu pantalla)
        </h2>
        <ol className="list-decimal list-inside text-sm md:text-base text-slate-600 space-y-1.5">
          <li>
            Cada día obtenemos datos históricos desde <strong>Yahoo Finance</strong>:
            precios diarios de cierre, máximos, mínimos, volumen, etc. para 10
            empresas tecnológicas grandes (Apple, Microsoft, Nvidia, Google, Amazon, META, Tesla, TSMC, Broadcom e Intel).
          </li>
          <li>
            Con esos datos calculamos varios indicadores técnicos clásicos, por
            ejemplo:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
              <li>
                <strong>RSI</strong>: Indica si el precio está sobrecomprado o
                sobrevendido.
              </li>
              <li>
                <strong>MACD</strong>: Mide la fuerza y dirección de la
                tendencia.
              </li>
              <li>
                <strong>Bandas de Bollinger</strong>: Nos dicen si el precio
                está cerca de zonas de soporte o resistencia.
              </li>
              <li>
                <strong>Volatilidad</strong>: Qué tanto “se mueve” el precio
                día a día.
              </li>
              <li>
                <strong>Tendencias a 5 y 20 días</strong>: Si viene subiendo o
                bajando en esas ventanas de tiempo.
              </li>
            </ul>
          </li>
          <li>
            Con toda esa información entrenamos un modelo de predicción en{" "}
            <strong>Python</strong> para cada empresa. El modelo intenta
            estimar el <strong>precio de cierre del día siguiente</strong>.
          </li>
          <li>
            Probamos el modelo hacia atrás en el tiempo (backtesting) para
            medir qué tan bien habría funcionado en el pasado: calculamos el
            error histórico y una precisión aproximada.
          </li>
          <li>
            Todos los días hábiles el modelo se ejecuta de nuevo, calcula la
            predicción del siguiente día y actualiza un archivo{" "}
            <code>historial.json</code> con:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
              <li>Precio real del último cierre.</li>
              <li>Predicción para el día siguiente.</li>
              <li>Error cometido (cuando ya se conoce el valor real).</li>
              <li>Indicadores técnicos del estado actual del activo.</li>
            </ul>
          </li>
          <li>
            La aplicación en <strong>React</strong> lee ese JSON, muestra las
            gráficas y calcula las métricas de desempeño que ves en la web.
          </li>
        </ol>
      </div>

      {/* QUÉ SIGNIFICA CADA GRÁFICA */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          ¿Qué significan las gráficas de la sección de predicciones?
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base text-slate-600 space-y-1.5">
          <li>
            <strong>Tarjeta “Predicción para mañana”</strong>: Muestra el
            precio estimado de cierre para el siguiente día hábil y si el
            modelo espera que el precio <em>suba</em>, <em>baje</em> o se mantenga{" "}
            <em>estable</em>.
          </li>
          <li>
            <strong>“Predicción de ayer vs valor real de hoy”</strong>: Compara
            lo que el modelo dijo ayer contra lo que realmente pasó hoy. Ahí se
            ve el error exacto de esa predicción.
          </li>
          <li>
            <strong>“Desempeño histórico del modelo”</strong>:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
              <li>
                <strong>Error medio</strong>: En promedio, qué tanto se equivoca
                el modelo en porcentaje.
              </li>
              <li>
                <strong>Días con acierto</strong>: Cuántos días la predicción
                quedó dentro de un rango de error pequeño (±2%) y cuál es el
                porcentaje de aciertos.
              </li>
            </ul>
          </li>
          <li>
            <strong>Gráfica “Precio real vs predicción”</strong>: Dos líneas
            que muestran la evolución del precio real y de las predicciones del
            modelo a lo largo del tiempo para esa empresa.
          </li>
          <li>
            <strong>Gráfica de barras “Error diario de predicción”</strong>:
            Enseña el error de cada día en porcentaje. La línea punteada marca
            el umbral del 2% para ver rápidamente cuándo el modelo se mantuvo
            dentro de ese margen.
          </li>
          <li>
            <strong>Radar “Perfil del activo (modelo)”</strong>: Resume en un
            solo gráfico varios aspectos del activo según el modelo:
            precisión histórica, RSI, tendencia, volatilidad y volumen. Sirve
            como una “radiografía rápida” de cómo está el activo.
          </li>
          <li>
            <strong>Comparación entre empresas</strong>: Un gráfico combinado
            donde:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
              <li>
                Las <strong>barras</strong> muestran la tasa de aciertos (% de
                días que el modelo estuvo dentro del margen).
              </li>
              <li>
                La <strong>línea</strong> muestra el error medio de cada
                empresa.
              </li>
            </ul>
          </li>
          <li>
            <strong>Tabla de historial</strong>: Listado detallado día por día
            con la fecha, el precio real, el precio predicho, el error y si se
            considera acierto (✅) o fallo (❌).
          </li>
        </ul>
      </div>

      {/* TECNOLOGÍAS Y AUTOMATIZACIÓN */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Tecnologías y automatización
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base text-slate-600 space-y-1.5">
          <li>
            <strong>Python</strong>: Se encarga de descargar los datos,
            calcular indicadores técnicos, entrenar el modelo, hacer las
            predicciones y generar el archivo <code>historial.json</code>.
          </li>
          <li>
            <strong>GitHub</strong>: Almacena todo el código del proyecto y el
            archivo JSON con el historial y las predicciones.
          </li>
          <li>
            <strong>GitHub Actions</strong>: Es una tarea automática que se
            ejecuta todos los días hábiles a una hora programada en horario UTC.
            Esa tarea:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
              <li>Ejecuta el script de Python.</li>
              <li>Actualiza el archivo <code>historial.json</code>.</li>
              <li>Hace un commit automático con los nuevos datos.</li>
            </ul>
            Gracias a esto, la web se mantiene siempre al día sin que nadie
            tenga que correr nada a mano.
          </li>
          <li>
            <strong>React</strong>: Construye toda la interfaz web, permite
            cambiar de empresa, navegar entre secciones y ver las gráficas de
            forma interactiva.
          </li>
          <li>
            <strong>Recharts</strong>: Es la librería que usamos para dibujar
            las gráficas (líneas, barras, radar, áreas, etc.) de una forma
            limpia y responsiva.
          </li>
          <li>
            <strong>Netlify</strong>: Aloja la aplicación web de forma gratuita.
            Cada vez que se detectan cambios en el repositorio de GitHub,
            Netlify vuelve a construir la web y despliega la versión más
            reciente automáticamente.
          </li>
        </ul>
      </div>

      {/* AVISO / RESPONSABILIDAD */}
      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs md:text-sm text-amber-800 space-y-1">
        <p className="font-semibold">
          Aviso importante sobre el uso del modelo
        </p>
        <p>
          Este sistema utiliza datos históricos, indicadores técnicos y un
          modelo de machine learning para <strong>estimar</strong> precios
          futuros y mostrar el desempeño aproximado que habría tenido en el
          pasado. Es una herramienta de apoyo para entender el comportamiento de
          las acciones, pero no puede garantizar resultados futuros.
          Cualquier decisión de compra o venta de activos financieros es
          responsabilidad exclusiva de cada usuario. Antes de invertir, es
          recomendable considerar otros factores (situación personal,
          horizonte de inversión, noticias del mercado, etc.) y, si es
          necesario, consultar con un asesor financiero profesional.
        </p>
      </div>
    </section>
  );
}

export default MetodologiaPage;
