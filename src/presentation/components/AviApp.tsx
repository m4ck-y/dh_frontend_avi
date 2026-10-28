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
];

const STATUS: Record<Mood, string> = {
  idle: "En línea",
  listening: "Escuchando…",
  thinking: "Pensando…",
  speaking: "Hablando…",
};

const EMOTION_LABEL: Record<Expression, string> = {
  ...STATUS,
  joy: "Alegría",
  anger: "Enojo",
  sad: "Tristeza",
  surprise: "Sorpresa",
};

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
  const [autoCycle, setAutoCycle] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const mood: Mood = listening
    ? "listening"
    : pending
      ? "thinking"
      : speaking
        ? "speaking"
        : "idle";
  const hasConversation = messages.length > 0;
  const expression: Expression = manualExpression ?? mood;

  // Ciclo automático para previsualizar todas las expresiones anime
  useEffect(() => {
    if (!autoCycle) return;
    const t = window.setTimeout(() => {
      setManualExpression((prev) => {
        const currentIdx = prev ? EXPRESSIONS.indexOf(prev) : 0;
        const nextIdx = (currentIdx + 1) % EXPRESSIONS.length;
        return EXPRESSIONS[nextIdx];
      });
    }, 1800);
    return () => window.clearTimeout(t);
  }, [autoCycle, manualExpression]);

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

  function pushMessage(text: string, author: "user" | "avi") {
    setMessages((prev) => [...prev, { id: nextId++, author, text }]);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setManualExpression(null);
    setAutoCycle(false);
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
    setAutoCycle(false);
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
                <Face expression={expression} />
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
                      setAutoCycle(false);
                    }}
                    title="Restablecer al estado en vivo"
                  >
                    ✕ En vivo
                  </button>
                )}
              </div>
              <Waveform mood={mood} micOn={listening} />

              <div className={styles.expressionBar} aria-label="Expresiones anime de AVI">
                <span className={styles.expressionLabel}>Expresiones:</span>
                <button
                  type="button"
                  className={`${styles.expressionBtn} ${autoCycle ? styles.expressionBtnActive : ""}`}
                  onClick={() => {
                    if (autoCycle) {
                      setAutoCycle(false);
                      setManualExpression(null);
                    } else {
                      setAutoCycle(true);
                      if (!manualExpression) setManualExpression(EXPRESSIONS[0]);
                    }
                  }}
                  aria-pressed={autoCycle}
                >
                  {autoCycle ? "Detener ciclo" : "▶ Ciclo auto"}
                </button>
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    className={`${styles.expressionBtn} ${expression === exp && !autoCycle ? styles.expressionBtnActive : ""}`}
                    onClick={() => {
                      setAutoCycle(false);
                      setManualExpression((prev) => (prev === exp ? null : exp));
                    }}
                    aria-pressed={expression === exp && !autoCycle}
                  >
                    {EMOTION_LABEL[exp]}
                  </button>
                ))}
              </div>

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
      </div>
    </div>
  );
}
