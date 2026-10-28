"use client";

import { useEffect, useRef, useState } from "react";
import type { Message, Role, View } from "@/domain/types";
import { aviService } from "@/infrastructure";
import { CONTEXT_TIERS, HISTORY, ROLE_KEYS, ROLES, SUGGESTIONS } from "@/shared/mock/avi";
import Face, { EXPRESSIONS, type Expression, type Mood } from "./Face";
import Waveform from "./Waveform";
import styles from "./AviApp.module.css";

const NAV: { key: View; label: string; icon: React.ReactNode }[] = [
  {
    key: "chat",
    label: "Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Historial",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    key: "info",
    label: "Info",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    key: "expressions",
    label: "Expresiones",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
];

const STATUS: Record<Mood, string> = {
  idle: "En línea",
  listening: "Escuchando…",
  thinking: "Pensando…",
  speaking: "Hablando…",
  sleeping: "Durmiendo… 💤 (mueve el mouse)",
};

const EMOTION_LABEL: Record<Expression, string> = {
  ...STATUS,
  joy: "Alegría",
  anger: "Enojo",
  annoyed: "Molesta 💢",
  sad: "Tristeza",
  surprise: "Sorpresa",
};

const ANNOYED_LINES = [
  "¡Oye, no me piques tanto! >_<",
  "¡Eso hace cosquillas, ya basta! 💢",
  "¡Ouch! ¿Por qué tantos clics? (｀ε´)",
  "¡Déjame en paz un ratito! 😤",
];

let nextId = 0;

export default function AviApp() {
  const [view, setView] = useState<View>("chat");
  const [role, setRole] = useState<Role>("anon");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [pending, setPending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [manualExpression, setManualExpression] = useState<Expression | null>(null);

  // Estados interactivos estilo avatar lab
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isSleeping, setIsSleeping] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [pokeMessage, setPokeMessage] = useState<string | null>(null);

  const lastPokeTime = useRef(0);
  const pokeTimer = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);
  const hasConversationRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const mood: Mood = listening
    ? "listening"
    : pending
      ? "thinking"
      : speaking
        ? "speaking"
        : isSleeping
          ? "sleeping"
          : "idle";
  const hasConversation = messages.length > 0;
  const expression: Expression = manualExpression ?? mood;

  // Mantener el valor actual en un ref para que el effect de inactividad
  // (montado una sola vez) no duerma a AVI si hay conversación activa.
  useEffect(() => {
    hasConversationRef.current = hasConversation;
  }, [hasConversation]);

  // Detección de inactividad para dormir y seguimiento suave del puntero del mouse
  useEffect(() => {
    let animId = 0;
    let pendingX = 0;
    let pendingY = 0;

    function resetInactivity() {
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
      }
      setIsSleeping(false);

      // Duerme tras 14 s de inactividad solo si no hay conversación activa
      inactivityTimer.current = window.setTimeout(() => {
        if (!hasConversationRef.current) setIsSleeping(true);
      }, 14000);
    }

    function onPointerMove(e: PointerEvent) {
      resetInactivity();
      pendingX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      pendingY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      pendingX = Math.max(-1, Math.min(1, pendingX));
      pendingY = Math.max(-1, Math.min(1, pendingY));

      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        setPointer({ x: pendingX, y: pendingY });
      });
    }

    function onUserInteraction() {
      resetInactivity();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });

    resetInactivity();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onUserInteraction);
      window.removeEventListener("click", onUserInteraction);
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  useEffect(() => {
    function onFs() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Interacción al tocar / hacer clics repetidos en AVI
  function handleFaceClick() {
    setIsSleeping(false);
    const now = Date.now();
    const isRapid = now - lastPokeTime.current < 2200;
    lastPokeTime.current = now;

    const nextCount = isRapid ? pokeCount + 1 : 1;
    setPokeCount(nextCount);

    if (pokeTimer.current) window.clearTimeout(pokeTimer.current);

    if (nextCount === 1) {
      setPokeMessage("✨ ¡Hola!");
      pokeTimer.current = window.setTimeout(() => {
        setPokeMessage(null);
        setPokeCount(0);
      }, 1500);
    } else if (nextCount === 2 || nextCount === 3) {
      setPokeMessage("¿Eh? ¿Por qué me tocas?");
      pokeTimer.current = window.setTimeout(() => {
        setPokeMessage(null);
        setPokeCount(0);
      }, 2000);
    } else {
      // 4 o más clics rápidos: AVI se molesta con puchero y marca 💢
      const randomLine = ANNOYED_LINES[Math.floor(Math.random() * ANNOYED_LINES.length)];
      setManualExpression("annoyed");
      setPokeMessage(randomLine);
      pokeTimer.current = window.setTimeout(() => {
        setManualExpression(null);
        setPokeMessage(null);
        setPokeCount(0);
      }, 3800);
    }
  }

  function pushMessage(text: string, author: "user" | "avi") {
    setMessages((prev) => [...prev, { id: nextId++, author, text }]);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setManualExpression(null);
    pushMessage(trimmed, "user");
    setInput("");
    setShowThread(true);
    setPending(true);
    void aviService.reply(role, trimmed).then((reply) => {
      setPending(false);
      pushMessage(reply, "avi");
      setSpeaking(true);
      window.setTimeout(() => setSpeaking(false), 1800);
    });
  }

  function changeRole(next: Role) {
    setRole(next);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  function toggleMic() {
    setManualExpression(null);
    if (listening) {
      setListening(false);
      // al terminar el dictado se envía (mock) y el ciclo sigue a thinking/speaking
      send("» dictado de ejemplo (mock)");
      return;
    }
    // el mic queda encendido hasta que el usuario lo apague
    setListening(true);
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="Secciones">
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            className={`${styles.railItem} ${view === n.key ? styles.railItemActive : ""}`}
            onClick={() => setView(n.key)}
            aria-current={view === n.key ? "page" : undefined}
            title={n.label}
          >
            {n.icon}
            <span className={styles.railLabel}>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headLeft}>
            <h1 className={styles.brand}>
              <span className={styles.dot} />
              AVI
            </h1>
            <span className={styles.tagline}>asistente de salud</span>
          </div>

          <div className={styles.controls}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Identidad</span>
              <select
                className={styles.select}
                value={role}
                onChange={(e) => changeRole(e.target.value as Role)}
              >
                {ROLE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ROLES[k].label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={styles.iconButton}
              onClick={toggleFullscreen}
              aria-pressed={isFullscreen}
              title="Pantalla completa (inmersivo)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                )}
              </svg>
              <span>{isFullscreen ? "Salir" : "Inmersivo"}</span>
            </button>
          </div>
        </header>

        {view === "chat" && (
          <>
            <div className={styles.stage}>
              <div className={styles.stageGlow} aria-hidden="true" />
              <div className={styles.stageFace}>
                <Face
                  expression={expression}
                  pointer={pointer}
                  pokeCount={pokeCount}
                  pokeMessage={pokeMessage}
                  onFaceClick={handleFaceClick}
                />
              </div>
              <div className={styles.presenceMeta}>
                <span className={styles.presenceStatus} data-mood={expression}>
                  {manualExpression ? `${EMOTION_LABEL[expression]} (Previsualización)` : STATUS[mood]}
                </span>
                {manualExpression && (
                  <button
                    type="button"
                    className={styles.resetMoodBtn}
                    onClick={() => {
                      setManualExpression(null);
                    }}
                    title="Restablecer al estado en vivo"
                  >
                    ✕ En vivo
                  </button>
                )}
              </div>
              <Waveform mood={mood} micOn={listening} />

              {!hasConversation && (
                <>
                  <h2 className={styles.heroTitle}>Hola, soy AVI</h2>
                  <p className={styles.heroHint}>
                    Toca el micrófono y háblame, o escribe abajo. {ROLES[role].context}
                  </p>
                </>
              )}
            </div>

            {showThread && hasConversation && (
              <main className={styles.thread} aria-live="polite" aria-label="Conversación con AVI">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.msg} ${m.author === "user" ? styles.user : styles.avi}`}
                  >
                    <p className={styles.msgAuthor}>{m.author === "user" ? "Tú" : "AVI"}</p>
                    <p className={styles.msgText}>{m.text}</p>
                  </div>
                ))}
                <div ref={endRef} />
              </main>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.bigMic} ${listening ? styles.bigMicActive : ""}`}
                onClick={toggleMic}
                aria-label={listening ? "Detener dictado" : "Hablar con AVI"}
                aria-pressed={listening}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>
              <span className={styles.actionsHint}>
                {listening ? "Escuchando — toca para terminar" : "Toca para hablar"}
              </span>
            </div>

            <div className={styles.suggestions} aria-label="Sugerencias">
              {SUGGESTIONS[role].map((s) => (
                <button key={s} type="button" className={styles.chip} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>

            <footer className={styles.composer}>
              {hasConversation && (
                <button
                  type="button"
                  className={`${styles.threadToggle} ${showThread ? styles.threadToggleActive : ""}`}
                  onClick={() => setShowThread((v) => !v)}
                  aria-expanded={showThread}
                  aria-label={showThread ? "Ocultar conversación" : "Ver conversación"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
                  </svg>
                </button>
              )}
              <input
                className={styles.input}
                value={input}
                placeholder="…o escribe una instrucción"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
              />
              <button type="button" className={styles.send} onClick={() => send(input)}>
                Enviar
              </button>
            </footer>
          </>
        )}

        {view === "history" && (
          <main className={styles.panel} aria-label="Historial de conversaciones">
            <h2 className={styles.panelTitle}>Historial de conversaciones</h2>
            <ul className={styles.list}>
              {HISTORY.map((h) => (
                <li key={h.id} className={styles.listItem}>
                  <span className={styles.listTitle}>{h.title}</span>
                  <span className={styles.listMeta}>{h.when}</span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>Lista estática de ejemplo (sin backend).</p>
          </main>
        )}

        {view === "info" && (
          <main className={styles.panel} aria-label="Contexto por identidad">
            <h2 className={styles.panelTitle}>Contexto por identidad</h2>
            <ul className={styles.list}>
              {CONTEXT_TIERS.map((t) => (
                <li key={t.level} className={styles.listItem}>
                  <span className={styles.listTitle}>
                    Nivel {t.level} · {t.who}
                  </span>
                  <span className={styles.listMeta}>{t.what}</span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              Superficies: embebido (landing · dashboard · tami · admin) · inmersivo{" "}
              <code>avi.libersalus.dev</code> · app nativa AVI · SO por voz.
            </p>
          </main>
        )}

        {view === "expressions" && (
          <main className={styles.panel} aria-label="Catálogo de expresiones">
            <h2 className={styles.panelTitle}>Catálogo de expresiones</h2>
            <p className={styles.note}>Toca una expresión para aplicársela a AVI.</p>
            <div className={styles.exprGrid}>
              {EXPRESSIONS.map((exp) => {
                const active = manualExpression === exp;
                return (
                  <div
                    key={exp}
                    role="button"
                    tabIndex={0}
                    className={`${styles.exprCard} ${active ? styles.exprCardActive : ""}`}
                    onClick={() => {
                      setManualExpression(exp);
                      setView("chat");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setManualExpression(exp);
                        setView("chat");
                      }
                    }}
                    aria-pressed={active}
                  >
                    <div className={styles.exprFace}>
                      <Face expression={exp} interactive={false} />
                    </div>
                    <span className={styles.exprLabel}>{EMOTION_LABEL[exp]}</span>
                  </div>
                );
              })}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
