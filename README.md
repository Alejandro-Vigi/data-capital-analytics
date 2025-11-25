# 🌐 **Data Capital Analytics**  
### *Predicción diaria del precio de cierre de 10 empresas tecnológicas · Plataforma automatizada*

---

## 📌 **Descripción general**

**Data Capital Analytics** es una plataforma que calcula **predicciones diarias del precio de cierre** para 10 empresas tecnológicas líderes, combinando:

- Modelos de machine learning en Python  
- Automatización diaria vía GitHub Actions  
- Gráficas y panel interactivo en React  
- Visualizaciones financieras amigables  
- Publicación automática en Netlify

Nuestro objetivo es ofrecer un **panel transparente**, donde cualquier usuario pueda ver si el modelo acierta, en qué falla, cómo se comporta cada activo y cómo evoluciona el desempeño con el tiempo.

No adivinamos.  
No especulamos.  
**Analizamos, proyectamos y validamos.**

---

## 📊 **Empresas cubiertas**
- Apple (AAPL)  
- Microsoft (MSFT)  
- Nvidia (NVDA)  
- Google (GOOGL)  
- Amazon (AMZN)  
- META Platforms (META)  
- TSMC (TSM)  
- Tesla (TSLA)  
- Broadcom (AVGO)  
- Intel (INTC)

---

# 🚀 **Características principales**

### 🔹 **1. Predicción diaria de mercado**  
El sistema genera una predicción nueva todos los días hábiles utilizando datos reales y modelos entrenados dinámicamente.

### 🔹 **2. Comparación con valores reales**  
Para cada jornada, la plataforma compara la predicción del día anterior con el valor real del mercado y calcula:  
- Error porcentual  
- Acierto o fallo  
- Tendencia esperada

### 🔹 **3. Historial completo del modelo**  
Se almacenan y visualizan:  
- Predicciones históricas  
- Valores reales  
- Errores diarios  
- Gráficas de desempeño  
- Métricas globales del modelo (Error Medio, Tasa de Aciertos)

### 🔹 **4. Indicadores técnicos calculados automáticamente**  
Incluye:  
- **RSI**  
- **MACD**  
- **Bandas de Bollinger**  
- **Volatilidad diaria**  
- **Tendencias a 5 y 20 días**

### 🔹 **5. Dashboard moderno, rápido y responsivo**  
Hecho en **React + Recharts**, permite:  
- Cambiar entre empresas  
- Analizar gráficos  
- Comparar tendencias  
- Revisar métricas globales  

### 🔹 **6. Automatización total**  
GitHub Actions corre el modelo **todos los días hábiles**, actualiza el JSON y despliega automáticamente en Netlify.

# 🧩 **Arquitectura general**
           ┌────────────────────────┐
           │   Yahoo Finance API    │
           └───────────┬────────────┘
                       │  Datos diarios
                       ▼
             ┌─────────────────────┐
             │   Python Model      │
             │  (Indicadores + ML) │
             └───────────┬─────────┘
                 Predicción | Historial
                       ▼
           ┌────────────────────────┐
           │   historial.json       │
           └───────────┬────────────┘
                       ▼
     ┌──────────────────────────────────┐
     │            React Frontend        │
     │   (Recharts + UI responsiva)     │
     └────────────────┬─────────────────┘
                      ▼
            ┌───────────────────┐
            │     Netlify       │
            │   Auto-Deploy     │
            └───────────────────┘

# ⚙️ **Tecnologías utilizadas**

### 🔵 **Backend / Modelado**
- Python 3  
- Pandas  
- NumPy  
- Scikit-learn  
- YFinance  
- Joblib  

### 🟣 **Automatización**
- GitHub Actions (CRON diario)  
- Commits automáticos al repositorio  

### 🟩 **Frontend**
- React  
- Recharts  
- Tailwind (opcional según tu proyecto)  

### 🟦 **Infraestructura**
- Netlify (hosting gratuito)  
- GitHub (código + historial.json)  

# 🔄 **Flujo de actualización diaria**

1. GitHub Actions se ejecuta a una hora fija en UTC.  
2. Descarga los datos más recientes de Yahoo Finance.  
3. Calcula indicadores técnicos.  
4. Actualiza el modelo y genera la predicción del siguiente día.  
5. Registra los valores reales del día anterior.  
6. Escribe todo en **historial.json**.  
7. Hace commit automático.  
8. Netlify detecta cambios y **reconstruye la web**.

Todo esto ocurre sin intervención humana.  
La plataforma siempre está actualizada.

# 📈 **Capturas**

![Predicción](<img width="1442" height="1178" alt="Captura de pantalla 2025-11-24 193556" src="https://github.com/user-attachments/assets/ab8d6075-646b-49ac-a782-0ea1cc7d25e7" />
)
![Comparación](<img width="1441" height="436" alt="3" src="https://github.com/user-attachments/assets/b5b13050-fe27-4d1f-b884-726673577835" />)
![Historial](<img width="1475" height="248" alt="2" src="https://github.com/user-attachments/assets/d512092e-b865-46a9-80b9-b948e2a214d0" />
)

# 🧪 Estructura del repositorio
```
/
├─ python/
│  ├─ modelo.py
│  ├─ indicadores.py
│  ├─ historial.json
│  └─ requirements.txt
├─ src/
│  ├─ components/
│  ├─ pages/
│  └─ App.jsx
├─ public/
├─ .github/
│  └─ workflows/
│     └─ update.yml
└─ README.md
```

## 👥 Equipo de desarrollo

### **Díaz González Rivas Ángel Iñaqui — MLOps Engineer**
Administra el entorno de ejecución, automatiza entrenamientos y gestiona la infraestructura del modelo.

### **Reyes Ramirez Jonathan — Business Analyst**
Define KPIs, reglas de negocio y valida que las predicciones sean útiles para análisis financiero.

### **Rojas Terrazas Laylet — Data Scientist**
Desarrolla el modelo de machine learning, ajusta parámetros y evalúa precisión.

### **Soto Rivera Marco Antonio — BI Developer**
Crea dashboards y visualizaciones analíticas complementarias en Power BI.

### **Vigi Garduño Marco Alejandro — Data Engineer**
Construye el pipeline, automatiza la actualización diaria y despliega la infraestructura en Netlify y GitHub Actions.

---

## ⚠️ Aviso importante sobre inversiones

Este proyecto usa datos históricos, indicadores técnicos y machine learning para estimar precios.  
**No garantiza resultados futuros.**

Las predicciones deben tomarse únicamente como una herramienta de análisis.  
Cualquier decisión financiera es responsabilidad del usuario.

