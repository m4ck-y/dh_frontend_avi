# SCREENS — AVI: Especificación Visual y de Pantallas

Diseño cinematográfico inmersivo:
* **Sin barra superior rígida (`Headerless`):** la identidad vive en un chip ambiental y el menú en un orbe orbital flotante (FAB).
* **Escenario Protagonista:** AVI al 100% de presencia con física 3D y seguimiento de cursor.
* **Sábana de Conversación Gestual:** deslizable hacia arriba por toque o rueda de ratón.
* **Test Settings:** panel modal para cambiar de rol clínico, activar modo inmersivo y probar el avatar.

---

## 1. Escenario Protagonista (`Stage Mode`)

```
┌────────────────────────────────────────────────────────┐
│ ● AVI  [ Paciente · PHR · Test Settings [Settings] ] (🔊)(☀️)(❖)│ ← Audio, Tema, FAB
│                                                        │
│                    ╭──────────────╮                    │
│                    │  ◉        ◉  │   ← Glow radial    │
│                    │      ⌣       │     ambiental      │
│                    ╰──────────────╯                    │
│                 ⎧────────────────────⎫                 │ ← Pedestal holográfico
│                 ⎩ ═══ Halo 3D ═══ ⎭                 │
│                                                        │
│         [ [Activity] 72 BPM  │  [Settings] 99.6% SYNC  │  🟢 En línea ]  │ ← Telemetría biológica
│                                                        │
│     [ [Sparkles] Alegría ] [ [Brain] Pensar ] [ [Zap] Sorpresa ] [ [Flame] ]   │ ← Reacciones rápidas
│                                                        │
│                    ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂                    │ ← Onda viva HD (3 estilos)
│                                                        │
│                      Hola, soy AVI                     │
│         Toca el micrófono y háblame, o desliza         │
│               hacia arriba para escribir               │
│                                                        │
│                         ( 🎙 )                         │ ← Mic grande 74px
│                    Toca para hablar                    │
│                                                        │
│          [ Registrar mi glucosa ] [ Ver historial ]    │ ← Sugerencias chip
│                                                        │
│       ▲ Desliza hacia arriba para ver conversación     │ ← Barra gestual
└────────────────────────────────────────────────────────┘
```

| Elemento | Tipo | Comportamiento |
|---|---|---|
| `AmbientBar` | Cabecera ambiental | Marca mínima + chip de identidad interactivo (abre `settings`). |
| `SoundToggle` | Control de audio | Alterna micro-sonidos sintetizados (`Volume2` / `VolumeX`). |
| `ThemeToggle` | Control de tema | Alterna modo oscuro obsidiana y claro pastel (tecla `T`). |
| `FabTrigger` | Botón radial flotante | Despliega el abanico circular de satélites de navegación. |
| `StageFace` | Rostro Anime | Sacadas biológicas estocásticas, parpadeo Poisson natural y seguimiento 3D. |
| `HologramBase`| Pedestal holográfico | Anillo elíptico 3D y haz luminoso pulsante reactivo al estado emocional. |
| `TelemetryBar`| Telemetría biológica | Monitor con BPM dinámico, sincronización neural y estado biológico. |
| `QuickEmotions`| Tira de reacciones | Acceso directo a emociones: Alegría, Pensar, Sorpresa, Molesta, Calma. |
| `Waveform` | Oscilograma | Selector de 3 estilos: Fluido líquido, Barras FFT, Anillos orbitales. |
| `BigMic` | Botón de voz | Activa captura de voz; se ilumina en cyan con pulso de resplandor. |
| `GestureBar` | Tirador gestual | `Swipe Up`, clic o tecla `/` para abrir la conversación. |

---

## 2. Modo Conversación (`Chat Sheet Mode`)

Al deslizar hacia arriba o enviar un mensaje, la conversación se expande fluidamente:

```
┌────────────────────────────────────────────────────────┐
│ ╭────────────────────────────────────────────────────╮ │
│ │  [ ◉ ⌣ ◉ ]  AVI · En línea            [ ▼ Escenario]│ │ ← Companion Header
│ ╰────────────────────────────────────────────────────╯ │   (mini avatar activo)
│                                                        │
│ ╭────────────────────────────────────────────────────╮ │
│ │ AVI · Hola, ¿en qué puedo ayudarte hoy?            │ │
│ ╰────────────────────────────────────────────────────╯ │
│                                                        │
│                     ╭────────────────────────────────╮ │
│                     │ Tú · ¿Qué nivel de glucosa es  │ │
│                     │      el adecuado en ayunas?    │ │
│                     ╰────────────────────────────────╯ │
│                                                        │
│ [ Sugerencia 1 ] [ Sugerencia 2 ]                      │
│ ╭────────────────────────────────────────────────────╮ │
│ │ (🎙) [ Escribe una instrucción para AVI… ] [Enviar]│ │ ← Composer dock
│ ╰────────────────────────────────────────────────────╯ │
└────────────────────────────────────────────────────────┘
```

| Elemento | Tipo | Comportamiento |
|---|---|---|
| `CompanionHeader` | Cabecera viva de compañero | Contiene la cara de AVI en miniatura (sigue reaccionando y hablando en vivo) y el botón `[▼ Escenario]` para plegar. |
| `Thread` | Hilo de mensajes | Burbujas de cristal con distinción visual para usuario y asistente. |
| `Composer` | Muelle de entrada | Micrófono compacto de dictado + campo de texto + botón Enviar. |

---

## 3. Menú Radial Orbital Flotante (`FAB Radial Menu`)

Al pulsar el orbe superior derecho `( ❖ )`:

```
┌────────────────────────────────────────────────────────┐
│ [ Telón con desenfoque de cristal ]              ( ✕ ) │ ← Trigger rotado
│                                                        │
│                    [ Escenario Protagonista ] ( [Radio] )   │
│                      [ Conversación / Chat ]  ( [MessageSquare] )   │
│                    [ Catálogo Expresiones ]   ( [Smile] )   │ ← Satélites radiales
│                      [ Historial de Sesiones ]( [History] )   │   con animación
│                      [ Contexto & Seguridad ] ( [Info] )   │   de resorte
│                      [ Ajustes & Identidad ]  ( [Settings] )   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Modal de Ajustes y Simulación (`Test Settings`)

Reemplaza los viejos selectores del header por un panel modal de cristal:

1. **Selector de Identidad y Rol Clínico:**
   * `Anónimo`: contenido educativo abierto, disclaimers generales.
   * `Paciente`: acceso a datos de salud personal (PHR), glucosa, constantes.
   * `Tutor`: gestión de dependientes autorizados.
   * `Profesional`: historial de pacientes con consentimiento vigente.
   * `Admin`: administración operacional de catálogos y reglas.
2. **Pruebas de Avatar:**
   * [Moon] *Dormir a AVI* (activa estado durmiendo con Zzz).
   * [Sparkles] *Despertar a AVI*.
   * [Flame] *Probar reacción de enojo* (dispara puchero y marca anime).
   * [Trash] *Reiniciar conversación*.
3. **Modo Inmersivo:**
   * Botón para entrar o salir de pantalla completa nativa (`requestFullscreen`).

---

## 5. Modal de Catálogo de Expresiones Anime

* Cuadrícula de tarjetas de cristal con vista en miniatura de cada expresión:
  `idle`, `listening`, `thinking`, `speaking`, `joy`, `surprise`, `anger`, `sad`, `sleeping`, `annoyed`.
* Tocar una tarjeta aplica la expresión de inmediato al rostro en el escenario principal.

---

## 6. Modo Desktop Split View (`≥ 900px`)

En computadoras y pantallas amplias, la hoja de chat no cubre la pantalla completa, sino que se transforma en una estación de trabajo holográfica dividida:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ● AVI  [ Paciente · PHR · Test Settings [Settings] ]            (🔊)(☀️)(❖)    │
│                                                                        │
│  [ Columna Izquierda: Escenario ]     [ Columna Derecha: Chat Dock ]   │
│                                                                        │
│         ╭──────────────╮              ╭──────────────────────────────╮ │
│         │  ◉        ◉  │              │ [ ◉ ⌣ ◉ ] AVI · En línea     │ │
│         │      ⌣       │              ├──────────────────────────────┤ │
│         ╰──────────────╯              │ AVI: Hola, ¿en qué te ayudo? │ │
│      ⎧────────────────────⎫           │                              │ │
│      ⎩ ═══ Halo 3D ═══ ⎭           │ Tú: Revisa mi glucosa de hoy │ │
│                                       │                              │ │
│   [[Activity] 72 BPM │ [Settings] 99.6% SYNC]          │ AVI: Tus registros muestran  │ │
│   [[Sparkles] Alegría][[Brain] Pensar][[Flame]]          │ un promedio de 98 mg/dL.     │ │
│                                       │                              │ │
│       ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂                │                              │ │
│                                       │ ╭──────────────────────────╮ │ │
│            ( 🎙 )                     │ │(🎙)[ Escribe aquí… ][Env]│ │ │
│       Toca para hablar                │ ╰──────────────────────────╯ │ │
│                                       ╰──────────────────────────────╯ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Tabla de Atajos de Teclado y Control

| Atajo | Función | Feedback Visual / Sonoro |
|---|---|---|
| `Espacio` o `M` | Alternar micrófono / dictado | Pulso cyan en BigMic + Sweep ascendente/descendente |
| `/` | Abrir chat y enfocar campo de texto | Despliegue de Chat Dock + Cursor en input |
| `T` | Alternar Modo Oscuro Obsidiana / Claro Pastel | Transición de color suave + Micro-click |
| `Esc` | Cerrar chat o panel modal abierto | Cierre con física elástica de resorte |

