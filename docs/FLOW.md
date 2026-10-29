# FLOW — AVI: Asistente de Salud de Próxima Generación

AVI redefine la interacción entre el usuario y un agente de IA de salud:
**Cero barras rígidas (Headerless), escenario inmersivo protagonista y navegación gestual fluida.**

---

## 1. Filosofía de Interacción

1. **Escenario Protagonista (Stage-First):**
   * El rostro anime de AVI y su campo de sonido son el núcleo visual. No hay cabeceras web obsoletas ni barras laterales permanentes que resten inmersión.
   * La mirada de AVI sigue el cursor en tiempo real con perspectiva 3D, respira suavemente y parpadea con naturalidad según las leyes del **comportamiento biológico** (sacadas sacádicas y parpadeo estocástico; ver `docs/BIOLOGICAL_BEHAVIOR.md`).
   * Cuenta con **física de descanso**: tras 14 s de inactividad duerme plácidamente (`sleeping` con Zzz flotantes y burbuja nasal anime). Al mover el cursor o interactuar, despierta.
   * **Mecánica de carisma anime:** si el usuario la toca repetidamente en rápida sucesión, AVI se ruboriza y se molesta temporalmente con un puchero, colmillo *yaeba* y su marca de tensión anime (`💢`).

2. **Transición Gestual a Conversación (Push-Up / Swipe Drawer):**
   * La conversación escrita no compite con el escenario: vive en una sábana (*Sheet*) deslizante de cristal.
   * **Gestos intuitivos:**
     * Deslizar hacia arriba (`Swipe Up`) o hacia la izquierda (`Swipe Left`) en pantalla táctil, o hacer scroll hacia abajo con la rueda del ratón, o tocar la barra gestual `[▲ Ver conversación]` empuja el escenario hacia el **Modo Conversación**.
     * Enviar texto o dictar por voz expande automáticamente la conversación para leer la respuesta.
     * En el Modo Conversación, AVI se transforma elegantemente en un **compañero flotante en cabecera** (*Companion Avatar*), manteniendo su expresividad anime, seguimiento visual y onda viva mientras el hilo de mensajes fluye debajo.
     * Deslizar hacia abajo (`Swipe Down`) o tocar el tirador devuelve la vista al escenario completo con animación elástica de resorte (*spring physics*).

3. **Menú Orbital Flotante (Floating Radial Menu):**
   * Sustituye al antiguo rail lateral por un único botón orbital (**FAB**) en la esquina superior.
   * Al tocarlo, despliega en abanico circular satélites de cristal con iconos luminosos y etiquetas flotantes:
     1. 💬 **Escenario Protagonista** (retorno al modo principal)
     2. 🗨️ **Conversación / Chat** (apertura de la sábana de mensajes)
     3. 🎭 **Catálogo de Expresiones** (explorador interactivo anime)
     4. 📜 **Historial de Sesiones** (sesiones anteriores de salud)
     5. ℹ️ **Contexto & Superficies** (niveles de seguridad y datos PHR)
     6. ⚙️ **Ajustes & Simulación (`test_settings`)** (cambio de rol, pantalla completa inmersiva, triggers de avatar)

---

## 2. Diagrama de Navegación

```mermaid
flowchart TD
    subgraph Escenario ["Escenario Protagonista (Full Stage)"]
        Face["Rostro Anime + Eye Tracking"]
        Wave["Visualizador Acústico HD (Aurora / Espectro / Orbe)"]
        Mic["Micrófono Grande Central"]
        GesturePrompt["Barra Gestual: ▲ Desliza para conversar"]
    end

    subgraph ChatSheet ["Modo Conversación (Sliding Glass Sheet)"]
        MiniCompanion["Companion Header: Mini Face + Wave + Status"]
        Thread["Hilo de Mensajes de Vidrio"]
        Composer["Composer: Input + Mic + Enviar"]
        CollapseBtn["Tirador: ▼ Deslizar para volver"]
    end

    subgraph RadialOrb ["Menú Orbital Flotante (FAB)"]
        OrbTrigger["Orb Trigger"]
        OrbExpressions["🎭 Expresiones"]
        OrbHistory["📜 Historial"]
        OrbInfo["ℹ️ Info"]
        OrbSettings["⚙️ Test Settings"]
    end

    Escenario <-->|"Swipe Up / Touch / Scroll / Send"| ChatSheet
    OrbTrigger -->|"Tap"| RadialOrb
    RadialOrb -->|"Seleccionar"| OrbExpressions
    RadialOrb -->|"Seleccionar"| OrbHistory
    RadialOrb -->|"Seleccionar"| OrbInfo
    RadialOrb -->|"Seleccionar"| OrbSettings
```

---

## 3. Ciclo de Estados Vocales y Expresivos

```mermaid
stateDiagram-v2
    [*] --> idle : Inicio
    idle --> sleeping : Inactividad (14 s sin interacción)
    sleeping --> idle : Mover cursor / Clic / Teclado
    idle --> listening : Tocar micrófono
    listening --> thinking : Apagar micrófono (procesando dictado)
    thinking --> speaking : Respuesta recibida (AVI vocaliza)
    speaking --> idle : Fin de locución
    idle --> annoyed : Clics rápidos repetidos en el rostro (≥4)
    annoyed --> idle : Enfriamiento (3.8 s)
```

| Estado | Gatillador | Expresión Anime | Visualizador Acústico | Comportamiento |
|---|---|---|---|---|
| `idle` | Reposo | Ojos amables, mirada errante, parpadeo | Ondas suaves fluidas | Sigue el puntero del mouse |
| `sleeping` | 14 s inactividad | Ojos cerrados `˘ ˘`, letras `Zzz` flotando | Respiración casi plana | Respiración profunda, no sigue mouse |
| `annoyed` | Toques rápidos (≥4) | Ceño fruncido, ojos afilados, marca `💢`, sacudida | Onda tensa vibrante | Globo de texto cómico de protesta |
| `listening` | Micrófono abierto | Ojos atentos curiosos, boca en "o" pulsante | **FFT de voz en vivo (Canvas 60 FPS)** | Micrófono iluminado en cyan pulsante |
| `thinking` | Procesando consulta | Mirada alzada reflexiva, ceja asimétrica | Pulso rítmico medio | Evaluación de contexto según rol |
| `speaking` | Emitiendo respuesta | Boca anime hablando sincronizada | Modulación dinámica vigorosa | Parpadeo ágil de habla |

---

## 4. Paneles de Hoja Flotante (Floating Modal Sheets)

Los destinos secundarios (`expressions`, `history`, `info`, `settings`) se presentan como hojas flotantes con desenfoque de cristal sobre el escenario, sin reiniciar el estado de la conversación ni desmotar el avatar:
* Al cerrar con `✕` o tocar el fondo, el usuario regresa inmediatamente al punto exacto donde estaba con AVI.
