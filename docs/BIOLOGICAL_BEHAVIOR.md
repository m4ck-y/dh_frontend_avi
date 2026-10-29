# BIOLOGICAL_BEHAVIOR — Comportamiento Biológico y Animaciones de Expresión

Este documento recopila la investigación técnica realizada sobre **asistentes robóticos en hardware embebido (ESP32)** y define la arquitectura de **comportamiento biológico autónomo y animación anime** para **AVI**.

---

## 1. Motivación: El Valle Inquietante y la "Mirada Muerta"

Un avatar digital cuyos ojos solo miran fijamente al centro o siguen el cursor con una rigidez matemática matemática del 100% genera el efecto conocido como *Uncanny Valley* (valle inquietante) o sensación de "muñeco inerte". 

En la biología humana y animal:
* **Los ojos nunca están quietos:** aun cuando fijamos la vista en un punto, el sistema nervioso ejecuta micro-movimientos involuntarios rápidos llamados **sacadas** (*saccades*) y micro-temblores para refrescar los fotorreceptores retinianos.
* **El parpadeo no es un reloj de cuarzo:** no ocurre cada exactamente $N$ segundos; sigue una distribución estocástica (distribución de Poisson) que varía con la carga cognitiva, el cansancio y las emociones.
* **El rostro tiene volumen:** al girar la mirada, no solo se mueven las pupilas; las facciones (cejas, párpados, nariz, boca) se desplazan con diferentes planos de profundidad (paralaje 2.5D).

---

## 2. Investigación: ¿Cómo lo resuelven los proyectos líderes en ESP32?

El hardware embebido (como el chip **ESP32-S3** con 512 KB de SRAM y pantallas OLED/TFT circulares o rectangulares) impone restricciones extremas de memoria y procesamiento. Por tanto, no pueden reproducir videos pesados ni secuencias de imágenes bitmap. 

Los mejores proyectos han desarrollado técnicas matemáticas y algorítmicas de renderizado procedural:

### 2.1 Stack-chan & `m5stack-avatar` (meganetaaan / M5Stack CoreS3)
* **Repositorio:** [meganetaaan/m5stack-avatar](https://github.com/meganetaaan/m5stack-avatar)
* **Paradigma:** Renderizado paramétrico vectorial en una tarea FreeRTOS desacoplada en tiempo real (30–60 FPS).
* **Hallazgos clave:**
  1. **Sacadas Autónomas:** Cuando no hay eventos externos, un generador pseudo-aleatorio produce saltos de mirada de baja amplitud (1–3 grados) cada 1.5 a 4 segundos, devolviendo la vista al punto de atención.
  2. **Parpadeo con Distribución de Poisson:** Los parpadeos ocurren a intervalos irregulares ($2.5\text{ s} - 6\text{ s}$) con posibilidad de **doble parpadeo** (*double blink*) cuando el avatar cambia de estado mental.
  3. **Lip-Sync por Envolvente de Audio:** La boca no ejecuta un ciclo fijo; lee el búfer I2S de audio (o la síntesis TTS AquesTalk) y modula la apertura en función de la amplitud RMS instantánea.

### 2.2 XiaoZhi ESP32 (`78/xiaozhi-esp32` & `Face-for-Xiaozhi`)
* **Repositorio:** [78/xiaozhi-esp32](https://github.com/78/xiaozhi-esp32)
* **Paradigma:** Asistente conversacional de voz completo basado en LLM (Qwen, DeepSeek) con pantalla para emociones.
* **Hallazgos clave:**
  1. **Máquina de Estados Finitos Cognitiva (FSM):**
     * `Listening`: Pupilas ligeramente dilatadas y fijas hacia el frente, cuerpo atento.
     * `Thinking`: Mirada desviada hacia arriba y a la izquierda (gesto cognitivo universal humano de evocación de memoria).
     * `Speaking`: Sincronización de visemas alternando formas de boca según fonemas.
  2. **Interpolación Cinemática (Lerp / Easing):** Todas las posiciones de mirada e inclinación de cejas se suavizan mediante interpolación lineal:
     $$x_{actual} = x_{actual} + (x_{objetivo} - x_{actual}) \times \alpha \quad (\alpha \approx 0.15)$$
     Esto elimina cualquier movimiento brusco o robótico.

### 2.3 Anki Cozmo / Vector (`esp32-eyes` de playfultechnology & `Grobot_Animations`)
* **Repositorio:** [playfultechnology/esp32-eyes](https://github.com/playfultechnology/esp32-eyes) / [Tanmaywankar/Grobot_Animations](https://github.com/tanmaywankar/Grobot_Animations)
* **Paradigma:** Aplicación de los 12 principios clásicos de animación de Disney a interfaces de ojos robóticos.
* **Hallazgos clave:**
  1. **Squash & Stretch (Elasticidad):** Al comenzar un parpadeo o una sorpresa, las geometrías de los ojos se comprimen verticalmente un 15% mientras se expanden horizontalmente un 10% antes de transicionar.
  2. **Inclinación Expresiva (Tilt):** Rotación angular simétrica o asimétrica de los ojos para denotar curiosidad (un ojo elevado con ligera inclinación), desconfianza o enfado.

### 2.4 `lvgl_kawaii_face` (LVGL 9 en ESP32)
* **Repositorio:** [0015/lvgl_kawaii_face](https://github.com/0015/lvgl_kawaii_face)
* **Hallazgos clave:**
  1. **Decoradores Emocionales Anime:**
     * `Joy`: Reemplazo de brillos estáticos por destellos de 4 puntas (`sparkles`) pulsantes.
     * `Nervous / Thinking`: Gotitas de sudor anime estilizadas (`sweat drops`) con movimiento sinusoidal.
     * `Love / Gratitude`: Rubor con gradiente radial y latido suave.

---

## 3. Especificación Técnica para AVI: Motor de Vida Orgánica

Aprovechando que AVI corre en un entorno web moderno con SVG y React, combinamos el minimalismo procedural de ESP32 con la fidelidad gráfica del anime:

### 3.1 Módulo 1: Motor de Mirada Viva (Saccades & Gaze Drift)
* **Seguimiento Ponderado:** La posición final de la pupila $(P_x, P_y)$ combina la atracción del cursor $(C_x, C_y)$ y la sacada biológica interna $(S_x, S_y)$:
  $$P_x = C_x \cdot w_{cursor} + S_x \cdot (1 - w_{cursor})$$
* **Generador de Sacadas:**
  * Cada $t \in [1800\text{ ms}, 4200\text{ ms}]$, si el cursor está quieto o fuera de foco:
  * Genera un micro-desplazamiento $(\Delta x, \Delta y)$ dentro de un radio elíptico de $6\text{ px}$.
  * Mantiene la fijación durante $300\text{ ms} - 700\text{ ms}$.
  * Regresa suavemente a la posición de descanso con una curva `cubic-bezier(0.25, 1, 0.5, 1)`.

### 3.2 Módulo 2: Parpadeo Estocástico con Micro-rebote
* **Frecuencia:** Intervalo variable determinado por $T = T_{base} + \text{rand}(-1200\text{ ms}, +2200\text{ ms})$.
* **Doble Parpadeo:** Con un 15% de probabilidad, tras abrirse del primer parpadeo, ejecuta inmediatamente un segundo parpadeo rápido (120 ms).
* **Fases del Parpadeo:**
  1. **Fase 1 (Bajada rápida):** 40 ms de duración, párpado superior desciende con aceleración.
  2. **Fase 2 (Compresión elástica):** 20 ms, pestañas tocan borde inferior.
  3. **Fase 3 (Subida con amortiguación):** 110 ms, apertura con suave desaceleración.

### 3.3 Módulo 3: Profundidad y Paralaje 2.5D (Efecto Live2D Lite)
El rostro no es plano. Al seguir el cursor o ejecutar una sacada, los componentes se desfasan proporcionalmente a su profundidad aparente:

| Capa | Elementos | Desplazamiento Relativo |
|---|---|---|
| **Capa 0 (Fondo)** | Cabeza, orejas, sombra posterior | $\times 0.25$ |
| **Capa 1 (Media)** | Ojos, iris, pupila, rubor | $\times 0.70$ |
| **Capa 2 (Frente)** | Nariz, boca, cejas, flequillo anime | $\times 1.00$ |

Adicionalmente, se aplica una rotación leve en perspectiva 3D (`rotateX` de hasta $\pm 5^\circ$ y `rotateY` de hasta $\pm 8^\circ$).

### 3.4 Módulo 4: Decoradores Emocionales Anime

```
      ( Pensando )                     ( Alegría )                     ( Molesto )
     ╭────────────╮                   ╭────────────╮                  ╭────────────╮
     │   ●    ●  💧│                  │   ✧    ✧   │                  │  \      / 💢│
     │      ⌣     │                   │     ▽      │                  │     ~      │
     ╰────────────╯                   ╰────────────╯                  ╰────────────╯
   Gotita de sudor                  Ojos de estrella                Vena de tensión
   animada fluctuante               con destellos rotativos         pulsante anime
```

1. **`joy` (Alegría):**
   * Destello en estrella de 4 puntas dorada/blanca (`#fff9db`) girando lentamente ($2.8\text{ s}$ por vuelta) dentro del iris.
   * Rubor cálido `#f472b6` con pulso de opacidad ($0.35 \leftrightarrow 0.65$).
2. **`thinking` (Pensando):**
   * Gotita de sudor translúcida en la sien/esquina superior con oscilación vertical sutil.
   * Pupilas con ligera asimetría (ojo izquierdo mira hacia arriba-izquierda).
3. **`annoyed` (Molesto / Toques repetidos):**
   * Cruz de tensión anime (`💢` *cross pop mark*) roja translúcida pulsando en escala ($0.9 \leftrightarrow 1.15$).
   * Ceño fruncido y colmillo anime (*yaeba*) visible en la comisura de la boca.
4. **`sleeping` (Dormir por inactividad):**
   * Burbuja nasal translúcida iridiscente que se infla en la inhalación ($3.2\text{ s}$) y se desinfla en la exhalación ($2.8\text{ s}$).
   * Párpados relajados cerrados en arco cóncavo `˘ ˘`.

---

## 4. Matriz de Estados y Parámetros

| Estado | Tasa Parpadeo | Sacadas | Decorador Anime | Apertura de Boca | Eje de Mirada |
|---|---|---|---|---|---|
| `idle` | Normal ($3.2\text{ s}$) | Activas (radio $5\text{ px}$) | Ninguno / Brillo natural | Cerrada, línea fina ($1.8\text{ px}$) | Centro / Cursor |
| `listening` | Reducida ($5.0\text{ s}$) | Inactivas (foco total) | Onda pulsante en pecho | Entreabierta en "o" atenta | Cursor directo |
| `thinking` | Rápida ($2.2\text{ s}$) | Reducidas (mirada fija) | Gotita anime (`sweatdrop`) | Comisura ladeada reflexiva | Arriba-Izquierda |
| `speaking` | Rítmica ($2.8\text{ s}$) | Activas suaves | Partículas de voz sutiles | Lip-sync visemas 6 fases | Usuario |
| `joy` | Rápida con dobles | Amplias ($7\text{ px}$) | Estrellas `✧` + Rubor rosa | Arco sonriente con lengua | Ligeramente alzada |
| `annoyed` | Muy baja ($7\text{ s}$) | Espasmódicas | Marca de tensión `💢` | Puchero con colmillo *yaeba* | Entrecerrada fijada |
| `surprise` | Suspendida ($6\text{ s}$) | Inmediata al estímulo | Micro-temblor de iris | Boca ovalada abierta | Muy abierta al centro |
| `sad` | Lenta ($4.5\text{ s}$) | Bajas hacia el suelo | Brillo acuoso en párpado | Comisuras invertidas | Abajo |
| `sleeping` | Cerrado continuo | Inactivas | Burbuja respiración + `Zzz` | Pequeño arco relajado | Ninguno |

---

## 5. Hoja de Ruta de Implementación en AVI

1. **Fase 1 (Motor Autónomo):** Bucle de `requestAnimationFrame` o `setInterval` con sacadas biológicas estocásticas y generador de parpadeo Poisson en `Face.tsx`.
2. **Fase 2 (Paralaje 2.5D):** Agrupación en capas SVG (`<g id="layer-back">`, `<g id="layer-eyes">`, `<g id="layer-features">`) con factores de desplazamiento diferencial según el cursor.
3. **Fase 3 (Decoradores Anime SVG):** Componentes vectoriales para la estrellita `joy`, la gotita `thinking` y la venita `💢`, renderizados dinámicamente según `expression`.
4. **Fase 4 (Lip-Sync Web Audio):** Conexión opcional del sintetizador de audio para modular la altura de la boca en tiempo real.
