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
│ ● AVI  [ Paciente · PHR · Test Settings ⚙️ ]     ( ❖ ) │ ← Orbe flotante (FAB)
│                                                        │
│                    ╭──────────────╮                    │
│                    │  ◉        ◉  │   ← Glow radial    │
│                    │      ⌣       │     ambiental      │
│                    ╰──────────────╯                    │
│                       En línea                         │
│                                                        │
│                    ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂                    │ ← Onda 48 barras
│                                                        │
│                      Hola, soy AVI                     │
│         Toca el micrófono y háblame, o desliza         │
│               hacia arriba para escribir               │
│                                                        │
│                         ( 🎙 )                         │ ← Mic grande 72px
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
| `FabTrigger` | Botón radial flotante | Despliega el abanico circular de satélites de navegación. |
| `StageFace` | Rostro Anime | Sigue el puntero del ratón en tiempo real con perspectiva 3D (tilt); responde a clics repetidos. |
| `Waveform` | Oscilograma | 48 barras alimentadas por `AnalyserNode` en vivo o simulación por estado. |
| `BigMic` | Botón de voz | Activa captura de voz; se ilumina en cyan con pulso de resplandor. |
| `GestureBar` | Tirador gestual | `Swipe Up`, `Swipe Left` o clic para empujar la sábana de chat hacia arriba. |

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
│                    [ Escenario Protagonista ] ( 💬 )   │
│                      [ Conversación / Chat ]  ( 🗨️ )   │
│                    [ Catálogo Expresiones ]   ( 🎭 )   │ ← Satélites radiales
│                      [ Historial de Sesiones ]( 📜 )   │   con animación
│                      [ Contexto & Seguridad ] ( ℹ️ )   │   de resorte
│                      [ Ajustes & Identidad ]  ( ⚙️ )   │
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
   * 💤 *Dormir a AVI* (activa estado durmiendo con Zzz).
   * ✨ *Despertar a AVI*.
   * 💢 *Probar reacción de enojo* (dispara puchero y marca anime).
   * 🗑️ *Reiniciar conversación*.
3. **Modo Inmersivo:**
   * Botón para entrar o salir de pantalla completa nativa (`requestFullscreen`).

---

## 5. Modal de Catálogo de Expresiones Anime

* Cuadrícula de tarjetas de cristal con vista en miniatura de cada expresión:
  `idle`, `listening`, `thinking`, `speaking`, `joy`, `surprise`, `anger`, `sad`, `sleeping`, `annoyed`.
* Tocar una tarjeta aplica la expresión de inmediato al rostro en el escenario principal.
