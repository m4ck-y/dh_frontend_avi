# Documentación de Arquitectura y Diseño — AVI (`dh_frontend_avi`)

Este directorio contiene las especificaciones técnicas, flujos, pantallas y directrices de diseño para **AVI**, el asistente virtual de salud de LiberSalus.

---

## 1. Regla de Oro de Iconografía y UI (Zero-Emoji Policy)

> **REGLA ESTRICTA:**  
> **Está prohibido el uso de emojis del sistema operativo (`✨`, `💡`, `⚡`, `💢`, `💬`, `💤`, etc.) en la interfaz gráfica, componentes, estados, botones y diálogos.**  
> **Todo icono debe ser un SVG vectorial estandarizado importado del paquete `lucide-react`.**

### ¿Por qué está prohibido el uso de emojis en la UI?

1. **Inconsistencia Cross-Platform:**  
   Los emojis nativos son renderizados por la fuente del sistema operativo (*Apple Color Emoji* en iOS/macOS, *Noto Color Emoji* en Android, *Segoe UI Emoji* en Windows). Esto provoca que un mismo botón se vea completamente diferente (colores, formas, proporciones) en cada dispositivo del usuario.
2. **Ruptura de la Estética Glassmorphism:**  
   Los emojis tienen paletas de colores chillones no personalizables que rompen la armonía de la paleta pastel y el cristal líquido (*Dark Obsidian* y *Light Pastel*) de AVI.
3. **Contraste y Accesibilidad:**  
   Los emojis no respetan variables CSS como `currentColor`, `var(--accent)` o `var(--foreground)`, haciendo imposible garantizar el contraste mínimo WCAG AA en modo oscuro y claro.
4. **Nitidez Vectorial:**  
   Los iconos de `lucide-react` son vectores SVG nativos que escalan con nitidez matemática sin pixelarse en pantallas Retina o móviles de alta densidad de píxeles (DPR 2x/3x).

---

## 2. Convenciones de Iconografía (`lucide-react`)

Todos los iconos deben provenir exclusivamente de `lucide-react` siguiendo estas pautas:

| Nivel de Uso | Tamaño (`size`) | Grosor (`strokeWidth`) | Ejemplo de Componentes | Iconos Típicos |
|---|---|---|---|---|
| **Micro-chips y Badges** | `10px` – `12px` | `2.2` | Telemetría, etiquetas de emoción, reset | `Activity`, `Cpu`, `Sparkles`, `Brain`, `Zap`, `Flame`, `Smile`, `RotateCcw` |
| **Acciones Secundarias** | `14px` – `16px` | `2.2` – `2.4` | Sugerencias, tirador gestual, botones de modal | `ChevronUp`, `ChevronDown`, `Send`, `Check`, `RotateCcw` |
| **Controles Ambientales** | `18px` – `20px` | `2.2` | Barra superior, selector de tema, audio, satélites FAB | `Volume2`, `VolumeX`, `Sun`, `Moon`, `Radio`, `MessageSquare`, `History`, `Info`, `Settings` |
| **Gatillador de Menú (FAB)** | `22px` – `24px` | `2.2` – `2.4` | Botón flotante radial de navegación | `Compass`, `X` |
| **Voz Protagonista** | `32px` – `36px` | `2.2` | Botón central de captura de voz (BigMic) | `Mic`, `MicOff` |

### Reglas de Implementación en Código:
```tsx
// CORRECTO: Icono vectorial con Lucide
import { Sparkles, Brain, Zap, Flame, Smile } from "lucide-react";

<button className={styles.emotionChip}>
  <Sparkles size={12} strokeWidth={2.2} />
  <span>Alegría</span>
</button>

// PROHIBIDO: Emojis unicode en la interfaz
<button className={styles.emotionChip}>
  <span>✨</span>
  <span>Alegría</span>
</button>
```

---

## 3. Índice de Documentación en `docs/`

| Archivo | Propósito y Contenido |
|---|---|
| **[`docs/FLOW.md`](./FLOW.md)** | Arquitectura de navegación y flujos: diagramas Mermaid, ciclo de estados vocales, atajos de teclado (`Espacio`/`M`, `/`, `T`, `Esc`), flujo adaptativo Desktop Split View vs Mobile Sheet y síntesis de audio procedural. |
| **[`docs/SCREENS.md`](./SCREENS.md)** | Especificación visual completa: wireframes ASCII del Escenario Protagonista, la Barra de Telemetría Biológica, el Menú Radial Orbital (FAB), el panel de Ajustes/Simulación (`test_settings`) y la vista Desktop Split View. |
| **[`docs/BIOLOGICAL_BEHAVIOR.md`](./BIOLOGICAL_BEHAVIOR.md)** | Motor de vida del avatar anime basado en proyectos embebidos ESP32 (*Stack-chan*, *XiaoZhi*, *Cozmo*): generador de sacadas involuntarias, parpadeo estocástico Poisson y decoradores anime vectoriales (`Face.tsx`). |
| **[`docs/README.md`](./README.md)** | Este documento: directrices de diseño, iconografía obligatoria (`lucide-react`) y política de cero emojis. |

---

## 4. Hoja de Ruta de Mejoras Planificadas (Backlog de Próximas Funciones)

Las siguientes características han sido aprobadas conceptualmente y documentadas aquí. **No se desarrollarán en el código de la aplicación hasta que el usuario dé la confirmación explícita para comenzar su implementación:**

### 4.1 Expresividad Facial y Dinámica Física
1. **Lip-Sync Real por Amplitud de Audio (Visemas Fonéticos):**
   * Conexión directa del analizador RMS de `AudioContext` y eventos del sintetizador de voz (`SpeechSynthesisUtterance.onboundary` o stream TTS) para modular proceduralmente la apertura de la boca en tiempo real según el volumen y fonemas (vocales abiertas vs. consonantes bilabiales).
2. **Micro-Respiración Corporal 2.5D:**
   * Ciclo continuo de oscilación sinusoidal suave en estado `idle` (amplitud $1.5\text{ px}$ en $Y$, período de $3.6\text{ s}$) que emula la caja torácica pulmonar sin rigidez geométrica.

### 4.2 Inteligencia Conversacional de Voz
3. **Detección Automática de Silencio (Voice Activity Detection - VAD):**
   * Monitoreo del flujo de micrófono en tiempo real. Al detectar $1.2\text{ s}$ continuos de silencio por debajo del umbral de ruido ambiental tras haber hablado, AVI finaliza automáticamente el dictado y procesa la consulta sin necesidad de tocar la pantalla.
4. **Capacidad de Interrupción (Barge-in):**
   * Cancelación inmediata de la síntesis vocal de AVI si el usuario comienza a hablar durante la respuesta o interactúa con el micrófono/pantalla, pasando instantáneamente al modo de escucha receptiva.
5. **Efecto Máquina de Escribir y Streaming:**
   * Revelado progresivo de los mensajes palabra por palabra con sincronización fluida mientras AVI reproduce su respuesta, creando una sensación de procesamiento en tiempo real.

### 4.3 Integración con Sensores de Dispositivo y PWA
6. **Giroscopio y Acelerómetro del Teléfono (Device Orientation):**
   * Lectura de los eventos `deviceorientation` (`beta` y `gamma`) en dispositivos móviles para inclinar suavemente la perspectiva 3D del avatar y desplazar la mirada hacia el ángulo físico en que el usuario sostiene el teléfono.
7. **Prompt de Instalación PWA Nativo:**
   * Captura del evento `beforeinstallprompt` para mostrar un botón sutil y elegante de instalación en pantalla de inicio con diseño glassmorphic y persistencia en `localStorage`.

### 4.4 Inteligencia Clínica y UI Generativa (LiberSalus)
8. **Componentes Ricos en el Chat (Intelligent UI):**
   * Renderizado de componentes gráficos interactivos en el hilo de mensajes cuando se mencionen parámetros clínicos:
     - Tarjetas semafóricas de glucosa, presión arterial y pulso.
     - Minigráficos *Sparkline* de tendencia histórica.
     - Botones de confirmación para almacenar métricas directamente en el PHR (*Personal Health Record*).
9. **Selector de Tono de Personalidad en `test_settings`:**
   * Selector modal para ajustar el temperamento de AVI según el contexto:
     - *Clínico y Preciso:* Lenguaje técnico y formal para profesionales de la salud.
     - *Empático y Acompañante:* Lenguaje cálido y paciente para personas mayores o enfermos crónicos.
     - *Dinámico y Alentador:* Enfoque motivacional para prevención y estilo de vida activo.

### 4.5 Acabado Visual y Óptica Glassmorphic
10. **Barrido de Luz Especular (Shimmer/Sheen):**
    * Reflejo cromático difuso y suave que recorre los bordes de vidrio al pasar el cursor o al cambiar de estado emocional, acentuando el efecto de cristal líquido premium.

---

## 5. Arquitectura de Purificación y Foco Protagonista (Stage Focus UX)

Documentación del rediseño para maximizar el protagonismo del rostro y la inmersión cinematográfica:

1. **Apertura de Chat Estrictamente Manual (Sin Auto-Expand):**
   * Al terminar de dictar o escuchar, la hoja de chat **no se auto-expande**. AVI responde mediante voz y expresión en el escenario.
   * El chat sólo se abre por acción deliberada del usuario: deslizar hacia arriba (`Swipe Up`), clic en el tirador inferior o presionar la tecla `/`.
2. **Eliminación de Chips de Emoción en el Escenario:**
   * Las pastillas de test rápido (`Alegría`, `Pensar`, `Sorpresa`, `Molesta`, `Auto`) se retiran del escenario principal y residen exclusivamente dentro del modal *Catálogo de Expresiones*.
3. **Reubicación Periférica de la Telemetría (BPM / SYNC % / Estado):**
   * El monitor vital se desplaza del centro hacia una esquina/lateral sutil (barra ambiental superior o discreto anclaje inferior), liberando el campo de visión del rostro.
4. **Traslado del Selector de Estilo de Onda a `test_settings`:**
   * La onda visual acústica permanece viva y reactiva, pero sus botones de cambio de estilo (Fluido / Barras / Orbital) se trasladan al panel de *Ajustes y Simulación (`test_settings`)*.
5. **Limpieza Total de Textos e Instrucciones del Escenario:**
   * Se eliminan el título `"Hola, soy AVI"`, las instrucciones redundantes (`"Toca el micrófono y háblame..."`), el pie de acción y los chips de sugerencias del escenario.
   * El escenario queda limpio: **Rostro Anime Puro + Visualizador Acústico Flotante + Micrófono Protagonista + Tirador Gestual Discreto**.


