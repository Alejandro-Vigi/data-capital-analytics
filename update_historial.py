# =============================================
# 🚀PREDICCIÓN + SEÑAL TRADING + GRÁFICAS
# =============================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Machine Learning
from sklearn.linear_model import LinearRegression

# Análisis Técnico
import ta

print(f"🚀 SISTEMA DE TRADING AVANZADO - PREDICCIÓN Y SEÑALES")
print("=" * 60)

# =========================
# CONFIGURACIÓN
# =========================
TICKER = "AAPL"
START_DATE = "2020-01-01"
END_DATE = datetime.today().strftime("%Y-%m-%d")
FORECAST_DAYS = 7

# =========================
# 1. CARGA Y PREPARACIÓN DE DATOS
# =========================
def prepare_advanced_data(ticker):
    print("📥 Cargando y procesando datos...")
    df = yf.download(ticker, start=START_DATE, end=END_DATE, progress=False)

    # Crear DataFrame de resultados
    result_df = pd.DataFrame(index=df.index)

    # Precios básicos
    for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
        result_df[col] = df[col]

    # Returns
    result_df['Returns'] = result_df['Close'].pct_change()

    # Múltiples medias móviles
    for window in [5, 10, 20, 50]:
        result_df[f'MA_{window}'] = result_df['Close'].rolling(window).mean()

    # Indicadores técnicos
    result_df['RSI_14'] = ta.momentum.RSIIndicator(result_df['Close'], window=14).rsi()

    macd = ta.trend.MACD(result_df['Close'])
    result_df['MACD'] = macd.macd()
    result_df['MACD_signal'] = macd.macd_signal()
    result_df['MACD_histogram'] = macd.macd_diff()

    bollinger = ta.volatility.BollingerBands(result_df['Close'])
    result_df['BB_upper'] = bollinger.bollinger_hband()
    result_df['BB_lower'] = bollinger.bollinger_lband()
    result_df['BB_middle'] = bollinger.bollinger_mavg()

    # Volumen
    result_df['Volume_MA'] = result_df['Volume'].rolling(20).mean()
    result_df['Volume_Ratio'] = result_df['Volume'] / result_df['Volume_MA']

    return result_df.dropna()

# =========================
# 2. SISTEMA COMPLETO DE PREDICCIÓN Y TRADING
# =========================
def get_trading_signal_with_predictions(df):
    """Sistema completo con predicción y señal de trading MEJORADO"""
    print("\n🎯 GENERANDO PREDICCIÓN Y SEÑAL DE TRADING...")

    current_price = df['Close'].iloc[-1]
    print(f"💰 PRECIO ACTUAL: ${current_price:.2f}")

    # =================================
    # 1. ANÁLISIS TÉCNICO INMEDIATO
    # =================================

    # RSI actual
    rsi = df['RSI_14'].iloc[-1]

    # Tendencia reciente
    trend_5d = (df['Close'].iloc[-1] - df['Close'].iloc[-5]) / df['Close'].iloc[-5] * 100
    trend_20d = (df['Close'].iloc[-1] - df['Close'].iloc[-20]) / df['Close'].iloc[-20] * 100

    # Volatilidad reciente
    volatility = df['Returns'].tail(10).std() * 100

    print(f"\n📊 ANÁLISIS TÉCNICO ACTUAL:")
    print(f"   RSI: {rsi:.1f} ({'Sobrecompra' if rsi > 70 else 'Sobreventa' if rsi < 30 else 'Neutral'})")
    print(f"   Tendencia 5 días: {trend_5d:+.2f}%")
    print(f"   Tendencia 20 días: {trend_20d:+.2f}%")
    print(f"   Volatilidad: {volatility:.2f}%")

    # =================================
    # 2. PREDICCIÓN SIMPLE
    # =================================

    def simple_price_prediction(df, days=7):
        """Predicción basada en múltiples métodos simples"""

        current = df['Close'].iloc[-1]

        # Método 1: Promedio móvil
        sma_5 = df['Close'].tail(5).mean()
        sma_10 = df['Close'].tail(10).mean()
        ma_pred = (sma_5 + sma_10) / 2

        # Método 2: Regresión lineal últimos 20 días
        recent = df['Close'].tail(20).values
        X = np.arange(len(recent)).reshape(-1, 1)
        y = recent
        lr = LinearRegression()
        lr.fit(X, y)
        lr_pred = lr.predict([[len(recent) + days - 1]])[0]

        # Método 3: Momentum (continuar tendencia reciente)
        momentum = trend_5d / 100
        momentum_pred = current * (1 + momentum * days * 0.3)

        # Combinar métodos
        final_pred = (ma_pred * 0.4 + lr_pred * 0.4 + momentum_pred * 0.2)

        # Generar predicción para cada día
        daily_predictions = []

        for day in range(1, days + 1):
            progress = day / days
            day_price = current + (final_pred - current) * progress * 0.8
            daily_predictions.append(day_price)

        return daily_predictions

    # Generar predicciones
    future_prices = simple_price_prediction(df, FORECAST_DAYS)

    # Fechas futuras
    last_date = df.index[-1]
    future_dates = []
    current_date = last_date

    for _ in range(FORECAST_DAYS):
        current_date += timedelta(days=1)
        while current_date.weekday() >= 5:
            current_date += timedelta(days=1)
        future_dates.append(current_date)

    # =================================
    # 3. SEÑAL DE TRADING INTELIGENTE
    # =================================

    def generate_trading_signal(df, future_prices, current_price):
        """Genera señal de compra/venta basada en análisis técnico mejorado"""

        # Factor 1: RSI (Mejorado)
        rsi = df['RSI_14'].iloc[-1]
        rsi_signal = 0
        if rsi < 30:
            rsi_signal = 2  # Fuerte compra - sobreventa
        elif rsi < 45:
            rsi_signal = 1  # Compra moderada
        elif rsi > 70:
            rsi_signal = -2  # Fuerte venta - sobrecompra
        elif rsi > 55:
            rsi_signal = -1  # Venta moderada

        # Factor 2: Tendencia de precio (CORREGIDO - comprar cuando sube)
        price_change = (future_prices[-1] - current_price) / current_price * 100
        price_signal = 0

        # LÓGICA CORREGIDA: Comprar cuando sube, vender cuando baja
        if price_change > 5:  # Fuerte tendencia alcista
            price_signal = 3
        elif price_change > 2:  # Tendencia alcista moderada
            price_signal = 2
        elif price_change > 0.5:  # Leve tendencia alcista
            price_signal = 1
        elif price_change < -5:  # Fuerte tendencia bajista
            price_signal = -3
        elif price_change < -2:  # Tendencia bajista moderada
            price_signal = -2
        elif price_change < -0.5:  # Leve tendencia bajista
            price_signal = -1

        # Factor 3: Volumen (Mejorado)
        volume_ratio = df['Volume_Ratio'].iloc[-1]
        volume_signal = 0
        if volume_ratio > 1.5:  # Volumen muy alto - confirmación
            volume_signal = 2
        elif volume_ratio > 1.2:  # Volumen alto
            volume_signal = 1
        elif volume_ratio < 0.7:  # Volumen muy bajo - precaución
            volume_signal = -1
        elif volume_ratio < 0.9:  # Volumen bajo
            volume_signal = -0.5

        # Factor 4: MACD (Mejorado)
        macd = df['MACD'].iloc[-1]
        macd_signal_val = df['MACD_signal'].iloc[-1]
        macd_histogram = df['MACD_histogram'].iloc[-1]

        macd_signal = 0
        if macd > macd_signal_val and macd_histogram > 0:  # Fuerte tendencia alcista
            macd_signal = 2
        elif macd > macd_signal_val:  # Tendencia alcista
            macd_signal = 1
        elif macd < macd_signal_val and macd_histogram < 0:  # Fuerte tendencia bajista
            macd_signal = -2
        elif macd < macd_signal_val:  # Tendencia bajista
            macd_signal = -1

        # Factor 5: Tendencia a corto plazo
        trend_5d = (df['Close'].iloc[-1] - df['Close'].iloc[-5]) / df['Close'].iloc[-5] * 100
        trend_20d = (df['Close'].iloc[-1] - df['Close'].iloc[-20]) / df['Close'].iloc[-20] * 100

        trend_signal = 0
        if trend_5d > 2 and trend_20d > 1:  # Tendencia alcista confirmada
            trend_signal = 2
        elif trend_5d > 0 and trend_20d > 0:  # Tendencia alcista
            trend_signal = 1
        elif trend_5d < -2 and trend_20d < -1:  # Tendencia bajista confirmada
            trend_signal = -2
        elif trend_5d < 0 and trend_20d < 0:  # Tendencia bajista
            trend_signal = -1

        # Factor 6: Soporte y Resistencia
        bb_position = (current_price - df['BB_lower'].iloc[-1]) / (df['BB_upper'].iloc[-1] - df['BB_lower'].iloc[-1])
        bb_signal = 0

        if bb_position < 0.2:  # Cerca del soporte (banda inferior)
            bb_signal = 1  # Señal de compra
        elif bb_position > 0.8:  # Cerca de la resistencia (banda superior)
            bb_signal = -1  # Señal de venta

        # CÁLCULO DE SEÑAL TOTAL MEJORADO
        total_signal = (rsi_signal + price_signal + volume_signal +
                       macd_signal + trend_signal + bb_signal)

        # LÓGICA DE DECISIÓN CORREGIDA
        if total_signal >= 6:
            return "🟢 COMPRAR FUERTE", total_signal, \
                   "Múltiples indicadores alcistas + tendencia fuerte + buen volumen"

        elif total_signal >= 4:
            return "🟢 COMPRAR", total_signal, \
                   "Señales alcistas moderadas con buena confirmación"

        elif total_signal >= 2:
            return "🟡 COMPRAR LEVE", total_signal, \
                   "Señales alcistas leves, considerar posición pequeña"

        elif total_signal <= -6:
            return "🔴 VENDER FUERTE", total_signal, \
                   "Múltiples indicadores bajistas + tendencia descendente fuerte"

        elif total_signal <= -4:
            return "🔴 VENDER", total_signal, \
                   "Señales bajistas moderadas, considerar tomar ganancias"

        elif total_signal <= -2:
            return "🟠 VENDER LEVE", total_signal, \
                   "Señales bajistas leves, considerar reducir posición"

        else:
            return "⚪ MANTENER", total_signal, \
                   "Mercado lateral o señales contradictorias, mantener posición actual"

    signal, signal_strength, reasoning = generate_trading_signal(df, future_prices, current_price)

    # =================================
    # 4. GESTIÓN DE RIESGO
    # =================================

    def calculate_risk_management(current_price, future_prices, signal):
        """Calcula stop loss y take profit mejorado"""

        if "COMPRAR" in signal:
            # Para compras
            stop_loss = current_price * 0.97  # -3%
            take_profit = future_prices[-1]   # Precio objetivo final
            risk_reward = (take_profit - current_price) / (current_price - stop_loss)

            position_size = 'Alta' if "FUERTE" in signal else 'Moderada' if "COMPRAR" in signal else 'Leve'

            return {
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'risk_reward': risk_reward,
                'risk_per_trade': '2% del capital',
                'position_size': position_size
            }
        elif "VENDER" in signal:
            # Para ventas
            stop_loss = current_price * 1.03  # +3%
            take_profit = future_prices[-1]
            risk_reward = (stop_loss - current_price) / (current_price - take_profit)

            position_size = 'Alta' if "FUERTE" in signal else 'Moderada' if "VENDER" in signal else 'Leve'

            return {
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'risk_reward': risk_reward,
                'risk_per_trade': '2% del capital',
                'position_size': position_size
            }
        else:
            # Para mantener
            return {
                'stop_loss': None,
                'take_profit': None,
                'risk_reward': None,
                'risk_per_trade': 'No operar',
                'position_size': '0%'
            }

    risk_management = calculate_risk_management(current_price, future_prices, signal)

    bb_position = (current_price - df['BB_lower'].iloc[-1]) / (df['BB_upper'].iloc[-1] - df['BB_lower'].iloc[-1])

    # =================================
    # 5. GRÁFICA DE CALCULADO VS REAL (BACKTESTING)
    # =================================

    def plot_calculated_vs_real(df):
        """Gráfica que compara predicciones pasadas con valores reales"""
        print("\n📊 GENERANDO GRÁFICA CALCULADO VS REAL...")

        # Realizar backtesting con datos históricos
        past_predictions = []
        past_actuals = []
        past_dates = []
        prediction_errors = []

        # Probar el modelo en datos pasados
        test_periods = range(30, 10, -3)  # Evaluar cada 3 días hacia atrás

        for days_ago in test_periods:
            if days_ago < len(df) - 10:
                # Usar datos hasta ese momento para predecir
                past_data = df.iloc[:-days_ago]
                if len(past_data) > 30:
                    try:
                        # Hacer predicción para 1 día adelante
                        predicted_price = simple_price_prediction(past_data, 1)[0]
                        actual_price = df['Close'].iloc[-days_ago + 1]
                        prediction_date = df.index[-days_ago + 1]

                        past_predictions.append(predicted_price)
                        past_actuals.append(actual_price)
                        past_dates.append(prediction_date)
                        prediction_errors.append(abs(predicted_price - actual_price))
                    except:
                        continue

        if len(past_predictions) > 5:
            # fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 10))

            # Gráfica 1: Serie temporal de predicciones vs reales
            # ax1.plot(past_dates, past_actuals, 'go-', linewidth=2, markersize=6, label='Precio Real', alpha=0.8)
            # ax1.plot(past_dates, past_predictions, 'ro-', linewidth=2, markersize=4, label='Precio Predicho', alpha=0.8)

            # Conectar predicciones con reales
            # for i, (pred, actual, date) in enumerate(zip(past_predictions, past_actuals, past_dates)):
            #     ax1.plot([date, date], [pred, actual], 'k--', alpha=0.3, linewidth=1)

            # ax1.set_title('BACKTESTING: Predicciones vs Valores Reales', fontsize=16, fontweight='bold')
            # ax1.set_ylabel('Precio ($)')
            # ax1.legend()
            # ax1.grid(True, alpha=0.3)
            # ax1.tick_params(axis='x', rotation=45)

            # Calcular métricas
            mae = np.mean(prediction_errors)
            mape = np.mean([abs(error/actual)*100 for error, actual in zip(prediction_errors, past_actuals)])
            accuracy = 100 - mape

            # Gráfica 2: Errores de predicción
            # ax2.bar(range(len(prediction_errors)), prediction_errors,
            #        color=['red' if error > mae else 'green' for error in prediction_errors],
            #        alpha=0.7, label='Error Absoluto')
            # ax2.axhline(y=mae, color='blue', linestyle='--', linewidth=2, label=f'Error Promedio: ${mae:.2f}')

            # ax2.set_title('Errores de Predicción por Período', fontsize=14, fontweight='bold')
            # ax2.set_xlabel('Período de Test')
            # ax2.set_ylabel('Error ($)')
            # ax2.legend()
            # ax2.grid(True, alpha=0.3)

            # plt.tight_layout()
            # plt.show()

            # Mostrar métricas
            print(f"\n📈 MÉTRICAS DE PRECISIÓN (Backtesting):")
            print(f"   Precisión del modelo: {accuracy:.1f}%")
            print(f"   Error absoluto promedio: ${mae:.2f}")
            print(f"   Error porcentual promedio: {mape:.1f}%")
            print(f"   Períodos evaluados: {len(past_predictions)}")

            return accuracy, mae
        else:
            print("❌ No hay suficientes datos para backtesting completo")
            return 0, 0

    # Ejecutar backtesting
    model_accuracy, avg_error = plot_calculated_vs_real(df)

    # =================================
    # 6. VISUALIZACIÓN
    # =================================

    # plt.figure(figsize=(20, 16))

    # # GRÁFICA 1: PREDICCIÓN Y SEÑAL PRINCIPAL
    # ax1 = plt.subplot(3, 3, 1)

    # # Histórico reciente
    # historical_dates = df.index[-30:]
    # historical_prices = df['Close'].values[-30:]
    # ax1.plot(historical_dates, historical_prices, 'bo-', label='Histórico Real', linewidth=2, markersize=4)

    # # Predicción futura
    # ax1.plot(future_dates, future_prices, 'ro-', label='Predicción Futura', linewidth=3, markersize=6)

    # # Línea de precio actual
    # ax1.axhline(y=current_price, color='green', linestyle='--', alpha=0.7,
    #             label=f'Precio Actual: ${current_price:.2f}')

    # ax1.set_title(f'PREDICCIÓN DE PRECIO - {TICKER}\nSeñal: {signal}', fontsize=14, fontweight='bold')
    # ax1.legend()
    # ax1.grid(True, alpha=0.3)
    # ax1.tick_params(axis='x', rotation=45)

    # # Añadir anotaciones de precio
    # for i, (date, price) in enumerate(zip(future_dates, future_prices)):
    #     change = (price - current_price) / current_price * 100
    #     ax1.annotate(f'D{i+1}: ${price:.1f}\n({change:+.1f}%)', (date, price),
    #                 textcoords="offset points", xytext=(0,15), ha='center', fontweight='bold', fontsize=8)

    # # GRÁFICA 2: ANÁLISIS TÉCNICO MULTI-INDICADOR
    # ax2 = plt.subplot(3, 3, 2)

    # # RSI
    # rsi_dates = df.index[-30:]
    # rsi_values = df['RSI_14'].values[-30:]
    # ax2.plot(rsi_dates, rsi_values, 'purple', linewidth=2, label='RSI')
    # ax2.axhline(y=70, color='red', linestyle='--', alpha=0.7, label='Sobrecompra')
    # ax2.axhline(y=30, color='green', linestyle='--', alpha=0.7, label='Sobreventa')
    # ax2.axhline(y=50, color='gray', linestyle=':', alpha=0.5)

    # ax2.set_title('INDICADOR RSI - Momentum', fontsize=12, fontweight='bold')
    # ax2.legend()
    # ax2.grid(True, alpha=0.3)
    # ax2.tick_params(axis='x', rotation=45)

    # # GRÁFICA 3: SEÑAL Y FACTORES DETALLADOS
    # ax3 = plt.subplot(3, 3, 3)

    # # Calcular valores reales de los factores
    # rsi_val = 2 if rsi < 30 else 1 if rsi < 45 else -2 if rsi > 70 else -1 if rsi > 55 else 0
    # price_change_val = (future_prices[-1] - current_price) / current_price * 100
    # price_val = 3 if price_change_val > 5 else 2 if price_change_val > 2 else 1 if price_change_val > 0.5 else -3 if price_change_val < -5 else -2 if price_change_val < -2 else -1 if price_change_val < -0.5 else 0
    # volume_val = 2 if df['Volume_Ratio'].iloc[-1] > 1.5 else 1 if df['Volume_Ratio'].iloc[-1] > 1.2 else -1 if df['Volume_Ratio'].iloc[-1] < 0.7 else -0.5 if df['Volume_Ratio'].iloc[-1] < 0.9 else 0
    # macd_val = 2 if df['MACD'].iloc[-1] > df['MACD_signal'].iloc[-1] and df['MACD_histogram'].iloc[-1] > 0 else 1 if df['MACD'].iloc[-1] > df['MACD_signal'].iloc[-1] else -2 if df['MACD'].iloc[-1] < df['MACD_signal'].iloc[-1] and df['MACD_histogram'].iloc[-1] < 0 else -1 if df['MACD'].iloc[-1] < df['MACD_signal'].iloc[-1] else 0

    # bb_position = (current_price - df['BB_lower'].iloc[-1]) / (df['BB_upper'].iloc[-1] - df['BB_lower'].iloc[-1])
    # bb_val = 1 if bb_position < 0.2 else -1 if bb_position > 0.8 else 0

    # trend_val = 2 if trend_5d > 2 and trend_20d > 1 else 1 if trend_5d > 0 and trend_20d > 0 else -2 if trend_5d < -2 and trend_20d < -1 else -1 if trend_5d < 0 and trend_20d < 0 else 0

    # factors = ['RSI', 'Precio', 'Volumen', 'MACD', 'Bollinger', 'Tendencia', 'TOTAL']
    # values = [rsi_val, price_val, volume_val, macd_val, bb_val, trend_val, signal_strength]
    # colors = ['blue', 'orange', 'green', 'red', 'purple', 'brown', 'black']

    # bars = ax3.bar(factors, values, color=colors, alpha=0.7)

    # ax3.set_title('ANÁLISIS DETALLADO DE SEÑALES', fontsize=12, fontweight='bold')
    # ax3.set_ylabel('Fuerza de Señal')
    # ax3.grid(True, alpha=0.3)
    # ax3.tick_params(axis='x', rotation=45)

    # # Añadir valores en las barras
    # for bar, value in zip(bars, values):
    #     ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + (0.1 if value > 0 else -0.3),
    #             f'{value:+.0f}', ha='center', va='bottom' if value > 0 else 'top', fontweight='bold')

    # # Línea en cero
    # ax3.axhline(y=0, color='black', linewidth=1)

    # # GRÁFICA 4: EVOLUCIÓN DE LA PREDICCIÓN POR DÍA
    # ax4 = plt.subplot(3, 3, 4)

    # days = range(1, FORECAST_DAYS + 1)
    # price_changes = [(price - current_price) / current_price * 100 for price in future_prices]
    # cumulative_changes = [((future_prices[i] - current_price) / current_price * 100) for i in range(FORECAST_DAYS)]

    # ax4.bar(days, price_changes, color='lightblue', alpha=0.7, label='Cambio Diario')
    # ax4.plot(days, cumulative_changes, 'ro-', linewidth=3, markersize=6, label='Cambio Acumulado')

    # ax4.set_xlabel('Día de Predicción')
    # ax4.set_ylabel('Cambio (%)')
    # ax4.set_title('EVOLUCIÓN PREDICCIÓN POR DÍA', fontsize=12, fontweight='bold')
    # ax4.legend()
    # ax4.grid(True, alpha=0.3)

    # # Añadir valores en las barras
    # for i, (day, change) in enumerate(zip(days, price_changes)):
    #     ax4.text(day, change + (0.1 if change > 0 else -0.3), f'{change:+.1f}%',
    #             ha='center', va='bottom' if change > 0 else 'top', fontweight='bold')

    # # GRÁFICA 5: BANDAS DE BOLLINGER Y PREDICCIÓN
    # ax5 = plt.subplot(3, 3, 5)

    # # Bandas de Bollinger
    # ax5.plot(historical_dates, df['BB_upper'].values[-30:], 'r--', alpha=0.7, label='BB Superior')
    # ax5.plot(historical_dates, df['BB_middle'].values[-30:], 'gray', alpha=0.7, label='BB Media')
    # ax5.plot(historical_dates, df['BB_lower'].values[-30:], 'g--', alpha=0.7, label='BB Inferior')
    # ax5.plot(historical_dates, historical_prices, 'b-', linewidth=2, label='Precio Real')

    # # Predicciones futuras
    # ax5.plot(future_dates, future_prices, 'ro-', linewidth=2, markersize=4, label='Predicción')

    # ax5.set_title('BANDAS BOLLINGER & PREDICCIÓN', fontsize=12, fontweight='bold')
    # ax5.legend()
    # ax5.grid(True, alpha=0.3)
    # ax5.tick_params(axis='x', rotation=45)

    # # GRÁFICA 6: DISTRIBUCIÓN DE PROBABILIDAD DE PRECIOS FUTUROS
    # ax6 = plt.subplot(3, 3, 6)

    # # Simular distribución de probabilidad alrededor de la predicción
    # predicted_price = future_prices[-1]
    # std_dev = volatility * current_price / 100

    # # Generar distribución normal
    # x = np.linspace(predicted_price - 3*std_dev, predicted_price + 3*std_dev, 100)
    # y = np.exp(-0.5 * ((x - predicted_price) / std_dev) ** 2)

    # ax6.plot(x, y, 'purple', linewidth=2, label='Distribución Probabilidad')
    # ax6.axvline(x=predicted_price, color='red', linestyle='--', label=f'Predicción: ${predicted_price:.2f}')
    # ax6.axvline(x=current_price, color='green', linestyle='--', label=f'Actual: ${current_price:.2f}')

    # ax6.set_xlabel('Precio ($)')
    # ax6.set_ylabel('Densidad de Probabilidad')
    # ax6.set_title('DISTRIBUCIÓN PRECIOS FUTUROS', fontsize=12, fontweight='bold')
    # ax6.legend()
    # ax6.grid(True, alpha=0.3)

    # # GRÁFICA 7: ANÁLISIS DE VOLUMEN
    # ax7 = plt.subplot(3, 3, 7)

    # # Precio (eje izquierdo)
    # price_dates = df.index[-30:]
    # price_values = df['Close'].values[-30:]
    # volume_ratios = df['Volume_Ratio'].values[-30:]

    # ax7.plot(price_dates, price_values, 'green', linewidth=2, label='Precio')
    # ax7.set_ylabel('Precio ($)', color='green')
    # ax7.tick_params(axis='y', labelcolor='green')

    # # Volumen (eje derecho)
    # ax7_volume = ax7.twinx()
    # ax7_volume.fill_between(price_dates, volume_ratios, alpha=0.3, color='orange', label='Volumen Ratio')
    # ax7_volume.axhline(y=1.0, color='red', linestyle='--', alpha=0.7, label='Volumen Promedio')
    # ax7_volume.set_ylabel('Ratio Volumen', color='orange')
    # ax7_volume.tick_params(axis='y', labelcolor='orange')

    # ax7.set_title('PRECIO vs VOLUMEN', fontsize=12, fontweight='bold')
    # ax7.legend(loc='upper left')
    # ax7_volume.legend(loc='upper right')
    # ax7.grid(True, alpha=0.3)
    # ax7.tick_params(axis='x', rotation=45)

    # # GRÁFICA 8: LÓGICA DE DECISIÓN VISUAL
    # ax8 = plt.subplot(3, 3, 8)

    # signal_levels = [-6, -4, -2, 2, 4, 6]
    # signal_labels = ['VENDER FUERTE', 'VENDER', 'VENDER LEVE', 'COMPRAR LEVE', 'COMPRAR', 'COMPRAR FUERTE']
    # signal_colors = ['darkred', 'red', 'orange', 'lightgreen', 'green', 'darkgreen']

    # ax8.axhline(y=0, color='black', linewidth=2)
    # for i, (level, label, color) in enumerate(zip(signal_levels, signal_labels, signal_colors)):
    #     ax8.axhspan(level-1, level+1 if i < len(signal_levels)-1 else level+2, alpha=0.3, color=color)
    #     ax8.text(0.5, level, label, ha='center', va='center', fontweight='bold',
    #             bbox=dict(boxstyle='round', facecolor=color, alpha=0.7))

    # ax8.plot([0, 1], [signal_strength, signal_strength], 'ro-', linewidth=3, markersize=10)
    # ax8.set_xlim(0, 1)
    # ax8.set_ylim(-8, 8)
    # ax8.set_title(f'SEÑAL FINAL: {signal_strength:.1f}', fontweight='bold', fontsize=14)
    # ax8.set_yticks([])
    # ax8.set_xticks([])

    # # GRÁFICA 9: RESUMEN EJECUTIVO MEJORADO
    # ax9 = plt.subplot(3, 3, 9)

    total_change = ((future_prices[-1] - current_price) / current_price * 100)

    summary_text = f"""🎯 RESUMEN EJECUTIVO - {TICKER}

💰 PRECIO ACTUAL: ${current_price:.2f}
🎯 SEÑAL: {signal}
📊 CONFIANZA: {signal_strength}/8
📈 PRECISIÓN MODELO: {model_accuracy:.1f}%

🔮 PREDICCIÓN {FORECAST_DAYS} DÍAS:
Precio Final: ${future_prices[-1]:.2f}
Cambio Total: {total_change:+.2f}%
Tendencia: {'ALCISTA' if total_change > 0 else 'BAJISTA'}

📊 ANÁLISIS TÉCNICO:
RSI: {rsi:.1f} ({'Sobrecompra' if rsi > 70 else 'Sobreventa' if rsi < 30 else 'Neutral'})
MACD: {'ALCISTA' if df['MACD'].iloc[-1] > df['MACD_signal'].iloc[-1] else 'BAJISTA'}
Volumen: {'ALTO' if df['Volume_Ratio'].iloc[-1] > 1.2 else 'BAJO' if df['Volume_Ratio'].iloc[-1] < 0.8 else 'NORMAL'}

📋 ANÁLISIS:
{reasoning}

⚖️ GESTIÓN DE RIESGO:
Posición: {risk_management['position_size']}
Riesgo: {risk_management['risk_per_trade']}"""

    if risk_management['stop_loss']:
        summary_text += f"\n🛑 Stop Loss: ${risk_management['stop_loss']:.2f}"
        summary_text += f"\n🎯 Take Profit: ${risk_management['take_profit']:.2f}"
        summary_text += f"\n📊 Risk/Reward: {risk_management['risk_reward']:.2f}:1"

    # ax9.text(0.05, 0.95, summary_text, transform=ax9.transAxes, fontsize=9,
    #          verticalalignment='top', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8),
    #          fontweight='bold')
    # ax9.axis('off')

    # plt.tight_layout()
    # plt.show()

    # =================================
    # 7. REPORTE FINAL
    # =================================

    print(f"\n{'='*80}")
    print(f"🎯 REPORTE FINAL DE TRADING MEJORADO - {TICKER}")
    print(f"{'='*80}")

    print(f"\n💡 SEÑAL: {signal}")
    print(f"📊 RAZÓN: {reasoning}")
    print(f"💪 FUERZA: {signal_strength}/8")
    print(f"🎯 PRECISIÓN DEL MODELO: {model_accuracy:.1f}%")

    print(f"\n💰 INFORMACIÓN DE PRECIO:")
    print(f"   Precio Actual: ${current_price:.2f}")
    print(f"   Objetivo Final: ${future_prices[-1]:.2f}")
    print(f"   Cambio Esperado: {total_change:+.2f}%")

    print(f"\n🔮 PREDICCIÓN DETALLADA {FORECAST_DAYS} DÍAS:")
    for i, (date, price) in enumerate(zip(future_dates, future_prices)):
        daily_change = ((price - current_price) / current_price * 100) if i == 0 else \
                      ((price - future_prices[i-1]) / future_prices[i-1] * 100)
        cumulative_change = (price - current_price) / current_price * 100
        print(f"   Día {i+1} ({date.strftime('%m/%d')}): ${price:.2f} ({daily_change:+.2f}%) [Acum: {cumulative_change:+.2f}%]")

    print(f"\n⚖️ RECOMENDACIÓN DE OPERACIÓN:")
    print(f"   Señal: {signal}")
    print(f"   Tamaño de Posición: {risk_management['position_size']}")
    print(f"   Riesgo por Trade: {risk_management['risk_per_trade']}")

    if risk_management['stop_loss']:
        if "COMPRAR" in signal:
            print(f"   🛑 Stop Loss: ${risk_management['stop_loss']:.2f} (-3.0%)")
        else:
            print(f"   🛑 Stop Loss: ${risk_management['stop_loss']:.2f} (+3.0%)")
        print(f"   🎯 Take Profit: ${risk_management['take_profit']:.2f} ({total_change:+.2f}%)")
        print(f"   📊 Risk/Reward Ratio: {risk_management['risk_reward']:.2f}:1")

    print(f"\n📈 INDICADORES CLAVE:")
    print(f"   RSI: {rsi:.1f} ({'Alerta sobrecompra' if rsi > 70 else 'Alerta sobreventa' if rsi < 30 else 'Neutral'})")
    print(f"   Tendencia 5d: {trend_5d:+.2f}%")
    print(f"   Tendencia 20d: {trend_20d:+.2f}%")
    print(f"   Volumen: {'Alto' if df['Volume_Ratio'].iloc[-1] > 1.2 else 'Normal' if df['Volume_Ratio'].iloc[-1] > 0.8 else 'Bajo'}")
    print(f"   MACD: {df['MACD'].iloc[-1]:.4f} ({'Alcista' if df['MACD'].iloc[-1] > df['MACD_signal'].iloc[-1] else 'Bajista'})")
    print(f"   Bollinger Position: {bb_position*100:.1f}% ({'Soporte' if bb_position < 0.3 else 'Resistencia' if bb_position > 0.7 else 'Neutral'})")

    print(f"\n💡 RECOMENDACIÓN FINAL: {signal}")

    return {
    'signal': signal,
    'current_price': current_price,
    'future_prices': future_prices,
    'future_dates': future_dates,
    'signal_strength': signal_strength,
    'reasoning': reasoning,
    'risk_management': risk_management,
    'model_accuracy': model_accuracy,
    'avg_error': avg_error,                      
    'technical_analysis': {
        'rsi': rsi,
        'trend_5d': trend_5d,
        'trend_20d': trend_20d,
        'volatility': volatility,
        'volume_ratio': df['Volume_Ratio'].iloc[-1],
        'macd': df['MACD'].iloc[-1],
        'bb_position': bb_position
    }
}

# =============================================
# EJECUCIÓN DEL SISTEMA COMPLETO
# =============================================

def limpiar_valor(x):
    """Convierte numpy types a tipos Python puros (JSON-safe)"""
    import numpy as np
    if isinstance(x, (np.floating,)):
        return float(x)
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (np.bool_,)):
        return bool(x)
    return x


def run_trading_system():
    """Ejecuta todo el sistema y regresa los resultados"""
    print("🚀 INICIANDO SISTEMA DE TRADING AVANZADO...")
    print("=" * 60)

    df = prepare_advanced_data(TICKER)
    print(f"✅ Datos cargados: {len(df)} registros")

    results = get_trading_signal_with_predictions(df)

    print(f"\n{'🎉' * 20}")
    print("🎉 ANÁLISIS COMPLETADO EXITOSAMENTE!")
    print(f"{'🎉' * 20}")

    return results


# =============================================
# EJECUTAR SISTEMA Y ACTUALIZAR JSON
# =============================================
import json
import os
from datetime import datetime, timezone, timedelta

JSON_PATH = os.path.join("public", "historial.json")


# -------------------------------------------------------------------
# Función: limpia valores para evitar errores al serializar a JSON
# -------------------------------------------------------------------
def limpiar_valor(x):
    if x is None:
        return None
    if isinstance(x, (int, float, str)):
        return x
    if isinstance(x, bool):
        return 1 if x else 0
    try:
        return float(x)
    except Exception:
        return str(x)


# -------------------------------------------------------------------
# CARGAR JSON EXISTENTE O CREAR UNO NUEVO
# -------------------------------------------------------------------
def cargar_historial():
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception:
                data = {"ultima_actualizacion": None, "empresas": []}
    else:
        data = {"ultima_actualizacion": None, "empresas": []}

    if "empresas" not in data:
        data["empresas"] = []

    return data


# -------------------------------------------------------------------
# BUSCAR O CREAR LA ENTRADA DE UNA EMPRESA
# -------------------------------------------------------------------
def obtener_o_crear_empresa(data, ticker, nombre_mostrar=None):
    empresa = next((e for e in data["empresas"] if e.get("ticker") == ticker), None)

    if empresa is None:
        empresa = {
            "ticker": ticker,
            "nombre": nombre_mostrar or ticker,
            "historico": [],
        }
        data["empresas"].append(empresa)
    else:
        # Actualizar nombre "bonito" si se lo pasamos
        if nombre_mostrar:
            empresa["nombre"] = nombre_mostrar

    return empresa


# -------------------------------------------------------------------
# Función auxiliar: siguiente día hábil (saltando sábado/domingo)
# -------------------------------------------------------------------
def siguiente_dia_habil(fecha_base):
    """
    Recibe una fecha (date) y devuelve el siguiente día hábil
    simple: solo salta sábado (5) y domingo (6).
    """
    d = fecha_base + timedelta(days=1)
    while d.weekday() >= 5:  # 5 = sábado, 6 = domingo
        d += timedelta(days=1)
    return d


# -------------------------------------------------------------------
# PROCESAR UNA EMPRESA COMPLETA
# -------------------------------------------------------------------
def actualizar_empresa_con_resultados(data, ticker, nombre_mostrar=None):
    # Variable global usada por run_trading_system()
    global TICKER
    TICKER = ticker

    print("\n" + "=" * 80)
    print(f"📈 Procesando {ticker} ({nombre_mostrar or ticker})")
    print("=" * 80)

    trading_results = run_trading_system()

    empresa = obtener_o_crear_empresa(data, ticker, nombre_mostrar)

    # Momento actual en UTC
    ahora_utc = datetime.now(timezone.utc)
    hoy_utc = ahora_utc.date()
    hoy_str = hoy_utc.isoformat()

    # -------- Extracción de valores -------- #
    current_price = limpiar_valor(trading_results["current_price"])
    future_prices = [limpiar_valor(p) for p in trading_results["future_prices"]]
    # future_dates = trading_results["future_dates"]   # ya no confiamos en esta fecha para "mañana"
    signal = trading_results["signal"]
    signal_strength = limpiar_valor(trading_results["signal_strength"])
    reasoning = trading_results["reasoning"]
    risk = trading_results["risk_management"]
    model_accuracy = limpiar_valor(trading_results["model_accuracy"])
    tech = trading_results["technical_analysis"]
    avg_error = limpiar_valor(trading_results["avg_error"])

    # -------------------------------------------------------------------
    # 1) HISTÓRICO — comparar valor predicho AYER con valor real HOY
    # -------------------------------------------------------------------
    precio_predicho_hoy = None

    # Tomamos la predicción guardada en la corrida anterior (si existía)
    pred_prev = empresa.get("prediccion_manana")
    if pred_prev and pred_prev.get("fecha_prediccion") == hoy_str:
        precio_predicho_hoy = limpiar_valor(pred_prev.get("precio_predicho"))

    if precio_predicho_hoy is not None:
        error_pct = abs(precio_predicho_hoy - current_price) / current_price * 100
        acierto = error_pct <= 2
    else:
        error_pct = None
        acierto = None

    empresa["historico"].append(
        {
            "fecha": hoy_str,  # fecha de ejecución (UTC)
            "precio_real": current_price,
            "precio_predicho": precio_predicho_hoy,
            "error_pct": limpiar_valor(error_pct),
            "acierto": limpiar_valor(acierto),
        }
    )

    # -------------------------------------------------------------------
    # 2) SOLO GUARDAR LA PREDICCIÓN DE "MAÑANA" (próximo día hábil)
    # -------------------------------------------------------------------
    if future_prices:
        price = future_prices[0]

        # Calculamos la fecha del próximo día hábil a partir de HOY (UTC)
        siguiente_habil = siguiente_dia_habil(hoy_utc)
        fecha_pred_str = siguiente_habil.isoformat()

        cambio_diario = (price - current_price) / current_price * 100
        cambio_acum = cambio_diario  # como solo guardamos 1 día

        if cambio_acum > 0.2:
            tendencia = "sube"
        elif cambio_acum < -0.2:
            tendencia = "baja"
        else:
            tendencia = "estable"

        empresa["prediccion_manana"] = {
            "fecha_prediccion": fecha_pred_str,
            "precio_predicho": price,
            "cambio_diario_pct": limpiar_valor(cambio_diario),
            "cambio_acumulado_pct": limpiar_valor(cambio_acum),
            "tendencia": tendencia,
        }

    # -------------------------------------------------------------------
    # 3) ESTADO ACTUAL COMPLETO (en UTC)
    # -------------------------------------------------------------------
    rsi = limpiar_valor(tech["rsi"])
    vol_ratio = limpiar_valor(tech["volume_ratio"])
    macd_val = limpiar_valor(tech["macd"])
    bb_pos = limpiar_valor(tech["bb_position"])

    rsi_estado = "Sobrecompra" if rsi > 70 else "Sobreventa" if rsi < 30 else "Neutral"
    vol_estado = "Alto" if vol_ratio > 1.2 else "Bajo" if vol_ratio < 0.8 else "Normal"
    macd_estado = "Alcista" if macd_val > 0 else "Bajista"
    bb_zona = "Soporte" if bb_pos < 0.3 else "Resistencia" if bb_pos > 0.7 else "Neutral"
    senal_icono = signal.split()[0] if signal else ""

    empresa["estado_actual"] = {
        "fecha": hoy_str,  # fecha de ejecución (UTC)
        "precio_actual": current_price,
        "rsi": rsi,
        "rsi_estado": rsi_estado,
        "tendencia_5d_pct": limpiar_valor(tech["trend_5d"]),
        "tendencia_20d_pct": limpiar_valor(tech["trend_20d"]),
        "volatilidad_pct": limpiar_valor(tech["volatility"]),
        "senal": signal,
        "senal_icono": senal_icono,
        "fuerza": signal_strength,
        "razon": reasoning,
        "precision_backtesting_pct": model_accuracy,
        "error_abs_promedio": avg_error,
        "stop_loss": limpiar_valor(risk["stop_loss"]) if risk.get("stop_loss") else None,
        "take_profit": limpiar_valor(risk["take_profit"]) if risk.get("take_profit") else None,
        "risk_reward": limpiar_valor(risk["risk_reward"])
        if risk.get("risk_reward") is not None
        else None,
        "tamano_posicion": risk["position_size"],
        "riesgo_por_trade": risk["risk_per_trade"],
        "volumen_estado": vol_estado,
        "macd_valor": macd_val,
        "macd_estado": macd_estado,
        "bollinger_posicion_pct": limpiar_valor(bb_pos * 100),
        "bollinger_zona": bb_zona,
    }

    return data


# ========================================================
#  LISTA DE EMPRESAS A PROCESAR
# ========================================================
tickers_a_procesar = {
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "NVDA": "Nvidia",
    "GOOGL": "Alphabet (Google)",
    "AMZN": "Amazon",
    "META": "Meta Platforms",
    "TSM": "TSMC",
    "TSLA": "Tesla",
    "AVGO": "Broadcom",
    "INTC": "Intel",
}


# ========================================================
#  EJECUCIÓN GENERAL
# ========================================================
if __name__ == "__main__":
    data = cargar_historial()

    for tk, nombre in tickers_a_procesar.items():
        data = actualizar_empresa_con_resultados(data, tk, nombre)

    # Timestamp UTC con zona
    data["ultima_actualizacion"] = datetime.now(timezone.utc).isoformat()

    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n📁 historial.json actualizado con TODAS las empresas (UTC)")
