# SCREENS — AVI

Shell compartido en todas las vistas: **rail de vidrio** (izquierda en desktop,
barra inferior fija en móvil) + columna principal con header de vidrio.
En `chat`, el **escenario** manda: AVI de frente con su onda de sonido; el texto
vive abajo, plegable.

---

## stage

**Vista**: `chat` sin conversación (`messages.length === 0`)
**Mood inicial**: `idle`

| Campo | Tipo | Descripción |
|---|---|---|
| `mood` | `Mood` | Expresión de la cara (idle hasta primer input) |
| `role` | `Role` | Identidad activa; su contexto aparece en el hint |

```
┌────┬───────────────────────────────────┐
│ ▒▒ │ ● AVI  asistente de salud   [Identidad ▼] [⤢ Inmersivo] │
│ 💬 │                                   │
│ 🕐 │          ╭─────────╮              │
│ ℹ️ │          │ ◉     ◉ │   ← glow     │
│    │          │   ⌣     │   radial     │
│    │          ╰─────────   detrás     │
│    │           En línea                │
│    │         ▁▂▃▅▃▂▁▂▃▅▃▂▁  ← onda     │
│    │          Hola, soy AVI            │
│    │   Toca el micrófono y háblame…    │
│    │                                   │
│    │              ( 🎙 )   ← mic 72px  │
│    │          Toca para hablar         │
│    │  [ ¿Qué es LiberSalus? ] [ … ]    │
│    │ [💬?] [ …o escribe una instrucción ] (Enviar) │
└────┴───────────────────────────────────┘
   móvil: rail → barra inferior fija
```

---

## conversation

**Vista**: `chat` con mensajes
**Input**: `messages[]`, `mood`, `role`, `listening`, `pending`, `speaking`,
`showThread`

| Campo | Tipo | Descripción |
|---|---|---|
| `messages` | `Message[]` | Thread secundario, scroll automático al final |
| `mood` | `Mood` | Derivado: listening > thinking(pending) > speaking > idle |
| `showThread` | `boolean` | Panel de transcripción abierto; toggle en el composer |
| `listening` | `boolean` | Mic abierto hasta que el usuario lo apague |
| `pending` | `boolean` | Respuesta de AVI en vuelo |
| `speaking` | `boolean` | Boca animada 1.6 s tras responder |

```
┌────┬───────────────────────────────────┐
│ ▒ │ ● AVI …             [Identidad ▼] [⤢] │
│ 💬 │          ╭─────────╮              │
│ 🕐 │          │ ◉     ◉ │  Escuchando… │
│ ℹ️ │          │   ○     │  ▂▅▇▅▂▅▇▅▂    │
│    │ ╭───────────────────────────────╮ │
│    │ │ AVI · Hola, ¿en qué ayudo?    │ │ ← thread
│    │ │        Tú · Necesito agendar… │ │   plegable
│    │ ╰───────────────────────────────╯ │   (34% máx)
│    │              ( 🎙 )               │
│    │      Escuchando — toca para term. │
│    │ [ Sugerencia 1 ] [ Sugerencia 2 ] │
│    │ [💬] [ …o escribe…        ] (Enviar) │
└────┴───────────────────────────────────┘
   [💬] = toggle de transcripción (aria-expanded)
```

---

## listening

**Vista**: `chat` con `listening = true`
La cara pasa a ojos abiertos + cejas arriba + boca "ooh"; la etiqueta del
escenario dice *Escuchando…* y el mic grande se rellena de accent con pulso de
glow. El mic queda abierto hasta que se apague: mientras tanto la onda pinta el
sonido real (historial deslizante de 48 barras). Al apagarlo se envía el dictado
mock y el ciclo sigue a `thinking` → `speaking`.

| Campo | Tipo | Descripción |
|---|---|---|
| `listening` | `boolean` | `true` durante los 1.2 s del mock |
| `input` | `string` | Recibe el texto dictado al cerrar |

---

## history

**Vista**: rail → `history`
**Input**: `HISTORY[]` (mock estático)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador de sesión |
| `title` | `string` | Título de la conversación |
| `when` | `string` | Fecha relativa |

```
┌────┬─────────────────────────────────┐
│ ▒ │ ● AVI …                         │
│ 💬 │ Historial de conversaciones     │
│ 🕐 │ ─────────────────────────────╮ │
│ ℹ️ │ │ Consulta de resultados      │ │
│    │ │ Hace 2 horas                │ │
│    │ ╰─────────────────────────────╯ │
│    │ ╭─────────────────────────────╮ │
│    │ │ Agendamiento cardiología    │ │
│    │ │ Ayer                        │ │
│    │ ╰─────────────────────────────╯ │
│    │ Lista estática de ejemplo.      │
└────┴─────────────────────────────────┘
```

---

## info

**Vista**: rail → `info`
**Input**: `CONTEXT_TIERS[]`

| Campo | Tipo | Descripción |
|---|---|---|
| `level` | `number` | Nivel de contexto (1–4) |
| `who` | `string` | Identidad o colectivo |
| `what` | `string` | Datos visibles en ese nivel |

Mismo patrón de tarjetas de vidrio que `history`, con una nota final que lista
las superficies del producto (embebido, inmersivo, app nativa, SO por voz).

---

## Expresiones de AVI (`Face`) y onda (`Waveform`)

Solo contorno: cejas + ojos + boca, trazo anime sobre glow, sin cuerpo ni
óvalo de cara. El color del trazo cambia con la emoción.

| Expresión | Cejas | Ojos | Boca | Color |
|---|---|---|---|---|
| `joy` | altas y curvas | arcos cerrados ∩ (risa) | sonrisa abierta (D) | ámbar `#ffd166` |
| `surprise` | muy altas | redondos grandes, brillo | "o" pequeña | violeta `#c792ea` |
| `anger` | en V hacia el centro | iris chico, párpado bajo tenso | ceño ∩ | rojo `#ff6b6b` |
| `sad` | interiores alzados | iris bajo + lágrima que cae | línea triste | azul `#74a7ff` |
| `listening` | levantadas | abiertos 1.14×, sin parpadeo | "ooh" pulsante | teal (accent) |
| `thinking` | una alzada, otra baja | un ojo a media asta, mirada arriba | línea dudosa ~ | teal (accent) |
| `speaking` | levemente alzadas | parpadeo rápido | elipse que habla (0.24 s) | teal (accent) |
| `idle` | neutras | parpadeo + mirada errante (9 s) | sonrisa | teal (accent) |

La onda son 48 barras. Con permiso de micrófono pintan el nivel real medido por
`AnalyserNode` (historial deslizante: el centro = ahora); sin permiso, amplitud
y ritmo simulados por `data-mood` (2.5/2.2 s · 8/0.55 s · 3.5/1.1 s · 10/0.38 s).
Todas las animaciones respetan `prefers-reduced-motion`.
