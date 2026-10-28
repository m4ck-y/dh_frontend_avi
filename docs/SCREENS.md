# SCREENS — AVI

## chat

**View**: `AviApp` (pestaña `chat`)

| Field | Type | Required | Validation / Notes |
|---|---|---|---|
| `role` | select (`anon` \| `patient` \| `tutor` \| `professional` \| `admin`) | sí | define el contexto cargado (strip + sugerencias) |
| `message` | text | no | instrucción o mensaje; `Enter` envía |
| `mic` | button | — | dictado mock ("Escuchando…" → texto de ejemplo) |
| `fullscreen` | button | — | entra/sale del modo inmersivo (Fullscreen API) |

```
┌──────────────────────────────────────────────┐
│ ● AVI [shell]    Identidad [Anónimo       ▼] │
│                              [⛶ Inmersivo]   │
│  Chat │ Historial │ Info                     │
├──────────────────────────────────────────────┤
│ Contexto · Anónimo: Público… (sin clínico)   │
│                                              │
│  AVI   Hola, soy AVI. Este es el esqueleto…  │
│  Tú    Registrar mi glucosa                  │
│  AVI   [simulado] Recibido: … (dh_avi)       │
│                                              │
│ [¿Qué es LiberSalus?] [¿Qué puede hacer AVI?]│
│ [🎙] [ Escribe o dicta una instrucción…  ]   │
│                                        [Enviar]
└──────────────────────────────────────────────┘
```

## history

**View**: `AviApp` (pestaña `history`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `threads` | list (mock) | — | título + fecha relativa; estático, sin backend |

```
┌──────────────────────────────────────────────┐
│ ● AVI [shell]                                │
│  Chat │ Historial │ Info                     │
├──────────────────────────────────────────────┤
│ Historial de conversaciones                  │
│  ┌────────────────────────────────────────┐  │
│  │ Dudas sobre mi glucosa            hoy │  │
│  │ Recordatorio de medicamento      ayer │  │
│  │ Interpretar un resultado  hace 3 días │  │
│  └────────────────────────────────────────┘  │
│ Lista estática de ejemplo (sin backend).     │
└──────────────────────────────────────────────┘
```

## info

**View**: `AviApp` (pestaña `info`)

Contenido estático, sin campos de entrada.

```
┌──────────────────────────────────────────────┐
│ ● AVI [shell]                                │
│  Chat │ Historial │ Info                     │
├──────────────────────────────────────────────┤
│ Contexto por identidad                       │
│  Nivel 0 · Anónimo     Público…              │
│  Nivel 1 · Paciente    Su PHR + chat…        │
│  Nivel 1b · Tutor      Dependientes…         │
│  Nivel 2 · Profesional Consentimiento…       │
│  Nivel 3 · Admin       Operacional…          │
│                                              │
│ Superficies: embebido · inmersivo            │
│              · app nativa · SO por voz       │
└──────────────────────────────────────────────┘
```
