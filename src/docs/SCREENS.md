## empty-state

**View**: `AviApp` (sin conversación)
**Input**: estado `messages.length === 0`, `mood` actual

| Campo | Tipo | Descripción |
|---|---|---|
| `mood` | `"idle" \| "listening" \| "thinking" \| "speaking"` | Estado animado del Face SVG |
| `role` | `"anon" \| "patient" \| "tutor" \| "professional" \| "admin"` | Identidad seleccionada |

```
┌──────────────────────────────┐
│                              │
│                              │
│        ┌──────────┐          │
│        │  AVI     │          │
│        │  Face    │          │
│        │  (320px) │          │
│        └──────────┘          │
│                              │
│   Hola, soy AVI — háblame    │
│   o escribe.                 │
│                              │
│  [ Sugerencia 1 ] [ Sug 2 ]  │
│                              │
│  [ ○ ] [ Escribe…       ] [Enviar]
│                              │
└──────────────────────────────┘
```

---

## conversation

**View**: `AviApp` (con conversación activa)
**Input**: `messages[]`, `mood`, `role`, `listening`, `pending`, `speaking`

| Campo | Tipo | Descripción |
|---|---|---|
| `messages` | `Message[]` | Lista de mensajes con autor y texto |
| `mood` | `Mood` | Estado del Face (se reduce a 140px) |
| `listening` | `boolean` | Indicador de dictado activo |
| `pending` | `boolean` | AVI está procesando respuesta |
| `speaking` | `boolean` | AVI "hablando" tras responder |
| `role` | `Role` | Contexto activo |

```
┌──────────────────────────────┐
│ ● AVI     [Identidad ▼] [Inmersivo]
│──────────────────────────────│
│ Chat │ Historial │ Info       │
│──────────────────────────────│
│ Contexto · Paciente: historia│
│ médica, citas, medicamentos  │
│                              │
│       ┌──────────┐           │
│       │  AVI     │           │
│       │  (140px) │           │
│       └──────────┘           │
│                              │
│  AVI                         │
│  Hola, ¿en qué puedo…        │
│                              │
│                     Tú       │
│          Necesito agendar…   │
│                              │
│  AVI                         │
│  Claro, reviso tu agenda…    │
│                              │
│──────────────────────────────│
│ [ Sugerencia 1 ] [ Sug 2 ]   │
│──────────────────────────────│
│ [ ○ ] [ Escribe…       ] [Enviar]
└──────────────────────────────┘
```

---

## listening

**View**: `AviApp` (modo dictado)
**Input**: `listening = true`, texto parcial

| Campo | Tipo | Descripción |
|---|---|---|
| `listening` | `boolean` | Siempre `true` durante captura de voz |
| `input` | `string` | Texto dictado acumulándose |

```
┌──────────────────────────────┐
│ ● AVI     [Identidad ▼] [Inmersivo]
│──────────────────────────────│
│ Chat │ Historial │ Info       │
│──────────────────────────────│
│ Contexto · Profesional: …    │
│                              │
│  Escuchando…                 │
│  (pulso en color accent)     │
│                              │
│──────────────────────────────│
│ [ Sugerencia 1 ] [ Sug 2 ]   │
│──────────────────────────────│
│ [ ● ] » dictado de ej…  ] [Enviar]
└──────────────────────────────┘
```

---

## history

**View**: `AviApp` (vista historial)
**Input**: `HISTORY[]` — lista estática de ejemplo

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador de conversación |
| `title` | `string` | Título de la conversación |
| `when` | `string` | Fecha/hora relativa |

```
┌──────────────────────────────┐
│ ● AVI     [Identidad ▼] [Inmersivo]
│──────────────────────────────│
│ Chat │ Historial │ Info       │
│──────────────────────────────│
│                              │
│ Historial de conversaciones  │
│                              │
│ ┌──────────────────────────┐ │
│ │ Consulta de resultados   │ │
│ │ Hace 2 horas             │ │
│ ├──────────────────────────┤ │
│ │ Agendamiento cardiología │ │
│ │ Ayer                     │ │
│ └──────────────────────────┘ │
│                              │
│ Lista estática de ejemplo    │
│ (sin backend).               │
└──────────────────────────────┘
```

---

## info

**View**: `AviApp` (vista info)
**Input**: `CONTEXT_TIERS[]` — niveles de contexto

| Campo | Tipo | Descripción |
|---|---|---|
| `level` | `number` | Nivel de contexto (1–4) |
| `who` | `string` | Rol o tipo de usuario |
| `what` | `string` | Datos accesibles en ese nivel |

```
┌──────────────────────────────┐
│ ● AVI     [Identidad ▼] [Inmersivo]
│──────────────────────────────│
│ Chat │ Historial │ Info       │
│──────────────────────────────│
│                              │
│ Contexto por identidad       │
│                              │
│ ┌──────────────────────────┐ │
│ │ Nivel 1 · Anónimo        │ │
│ │ Info general del hospital│ │
│ ├──────────────────────────┤ │
│ │ Nivel 2 · Paciente       │ │
│ │ Historia, citas, recetas │ │
│ └──────────────────────────┘ │
│                              │
│ Superficies: embebido ·      │
│ inmersivo · app · SO por voz │
└──────────────────────────────┘
```
