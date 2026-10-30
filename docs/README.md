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
