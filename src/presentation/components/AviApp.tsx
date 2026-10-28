"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Message, Role, View } from "@/domain/types";
import { aviService } from "@/infrastructure";
import { CONTEXT_TIERS, HISTORY, ROLE_KEYS, ROLES, SUGGESTIONS } from "@/shared/mock/avi";
import Face, { EXPRESSIONS, type Expression, type Mood } from "./Face";
import Waveform from "./Waveform";
import styles from "./AviApp.module.css";

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
  const [manualExpression, setManualExpression] = useState<Expression | null>(null);

  // Estados de interacción fluida
  const [chatExpanded, setChatExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

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

      // Duerme tras 14 s de inactividad solo si no hay conversación activa ni dictado
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
  }, [messages, chatExpanded]);

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
    setChatExpanded(true);
    setPending(true);
    void aviService.reply(role, trimmed).then((reply) => {
      setPending(false);
      pushMessage(reply, "avi");
      setSpeaking(true);
      window.setTimeout(() => setSpeaking(false), 1800);
    });
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
      send("» dictado de ejemplo (mock)");
      return;
    }
    setListening(true);
  }

  // Soporte de gestos táctiles (Swipe Up / Swipe Left para conversación)
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;

    // Deslizar arriba (diffY > 60) o deslizar izquierda (diffX > 70)
    if (diffY > 60 || diffX > 70) {
      setChatExpanded(true);
    }
    touchStartY.current = null;
    touchStartX.current = null;
  }

  function handleCompanionTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Deslizar abajo (diffY < -50) para colapsar conversación
    if (diffY < -50) {
      setChatExpanded(false);
    }
    touchStartY.current = null;
  }

  return (
    <div className={styles.shell}>
      {/* Barra ambiental superior minimalista */}
      <div className={styles.ambientBar}>
        <div className={styles.brandLockup}>
          <div className={styles.brandTitle}>
            <span className={styles.dot} />
            AVI
          </div>
          <button
            type="button"
            className={styles.rolePill}
            onClick={() => setView("settings")}
            title="Ajustes de identidad y simulación"
          >
            {ROLES[role].label} · Test Settings ⚙️
          </button>
        </div>

        {/* Botón flotante radial de menú (FAB) */}
        <div className={styles.fabContainer}>
          <button
            type="button"
            className={`${styles.fabTrigger} ${menuOpen ? styles.fabTriggerActive : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            )}
          </button>

          {/* Menú orbital desplegable con física fluida */}
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  className={styles.menuBackdrop}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMenuOpen(false)}
                />

                <motion.div
                  className={styles.radialMenu}
                  initial={{ opacity: 0, scale: 0.85, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("chat");
                      setChatExpanded(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Escenario Protagonista</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("chat");
                      setChatExpanded(true);
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Conversación / Chat</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("expressions");
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Catálogo de Expresiones</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("history");
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Historial de Sesiones</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("info");
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Contexto & Superficies</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 11v5" />
                        <path d="M12 8h.01" />
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      setView("settings");
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>Ajustes & Identidad</span>
                    <span className={styles.radialOrb}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Escenario Protagonista (Full Face & Voice Stage) */}
      <main
        className={styles.stage}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={(e) => {
          if (e.deltaY > 30) setChatExpanded(true);
        }}
      >
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
              onClick={() => setManualExpression(null)}
              title="Restablecer al estado en vivo"
            >
              ✕ En vivo
            </button>
          )}
        </div>

        <Waveform mood={mood} micOn={listening} />

        {!hasConversation ? (
          <>
            <h1 className={styles.heroTitle}>Hola, soy AVI</h1>
            <p className={styles.heroHint}>
              Toca el micrófono y háblame, o desliza hacia arriba para escribir. {ROLES[role].context}
            </p>
          </>
        ) : (
          <p className={styles.heroHint}>
            Conversación activa ({messages.length} mensajes). Desliza hacia arriba para leerla.
          </p>
        )}

        {/* Botón de voz protagonista */}
        <div className={styles.voiceActionGroup}>
          <button
            type="button"
            className={`${styles.bigMic} ${listening ? styles.bigMicActive : ""}`}
            onClick={toggleMic}
            aria-label={listening ? "Detener dictado" : "Hablar con AVI"}
            aria-pressed={listening}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          <span className={styles.actionsHint}>
            {listening ? "Escuchando — toca para terminar" : "Toca para hablar"}
          </span>
        </div>

        {/* Sugerencias contextuales de la identidad activa */}
        <div className={styles.stageSuggestions}>
          {SUGGESTIONS[role].slice(0, 2).map((s) => (
            <button
              key={s}
              type="button"
              className={styles.chip}
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Barra gestual inferior: Deslizar hacia arriba para abrir conversación */}
        <button
          type="button"
          className={styles.gestureBar}
          onClick={() => setChatExpanded(true)}
          aria-label="Abrir conversación de chat"
        >
          <svg className={styles.gestureChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span>
            {hasConversation ? `Ver conversación (${messages.length})` : "Desliza hacia arriba para escribir"}
          </span>
        </button>
      </main>

      {/* Modo Conversación Deslizante (Chat Sheet) */}
      <AnimatePresence>
        {chatExpanded && (
          <motion.div
            className={styles.chatSheet}
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleCompanionTouchEnd}
          >
            {/* Cabecera del compañero avatar */}
            <div
              className={styles.companionHeader}
              onClick={() => setChatExpanded(false)}
              title="Toca o desliza hacia abajo para volver al escenario completo"
            >
              <div className={styles.companionLeft}>
                <div className={styles.miniFace}>
                  <Face expression={expression} interactive={false} pointer={pointer} />
                </div>
                <div className={styles.companionInfo}>
                  <span className={styles.companionTitle}>AVI</span>
                  <span className={styles.companionStatus}>
                    {manualExpression ? EMOTION_LABEL[expression] : STATUS[mood]}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles.collapseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setChatExpanded(false);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>Escenario</span>
              </button>
            </div>

            {/* Hilo de mensajes */}
            <main className={styles.thread} aria-live="polite" aria-label="Historial de mensajes">
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--muted)", margin: "auto", padding: "20px" }}>
                  <p>Aún no hay mensajes. Háblale o escribe una instrucción abajo.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.msg} ${m.author === "user" ? styles.user : styles.avi}`}
                  >
                    <p className={styles.msgAuthor}>{m.author === "user" ? "Tú" : "AVI"}</p>
                    <p className={styles.msgText}>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </main>

            {/* Sugerencias en el chat */}
            <div className={styles.stageSuggestions} style={{ padding: "4px 0" }}>
              {SUGGESTIONS[role].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.chip}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Composer al pie */}
            <footer className={styles.composer}>
              <button
                type="button"
                className={`${styles.micSmall} ${listening ? styles.micSmallActive : ""}`}
                onClick={toggleMic}
                aria-label={listening ? "Detener dictado" : "Dictar por voz"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>

              <input
                className={styles.input}
                value={input}
                placeholder="Escribe una instrucción para AVI…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
              />

              <button type="button" className={styles.send} onClick={() => send(input)}>
                Enviar
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Flotante de Ajustes & Test Settings */}
      <AnimatePresence>
        {view === "settings" && (
          <div className={styles.modalOverlay} onClick={() => setView("chat")}>
            <motion.div
              className={styles.modalSheet}
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={styles.dot} />
                  <h2 className={styles.modalTitle}>Ajustes & Simulación (Test Settings)</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setView("chat")}
                  aria-label="Cerrar ajustes"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Selector de Rol / Identidad */}
                <div className={styles.settingsSection}>
                  <span className={styles.settingsSectionTitle}>Identidad activa (Alcance de datos)</span>
                  <div className={styles.roleSelectorGrid}>
                    {ROLE_KEYS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`${styles.roleCard} ${role === k ? styles.roleCardActive : ""}`}
                        onClick={() => setRole(k)}
                      >
                        <span className={styles.roleName}>{ROLES[k].label}</span>
                      </button>
                    ))}
                  </div>
                  <p className={styles.roleContextNote}>
                    <strong>Contexto actual:</strong> {ROLES[role].context}
                  </p>
                </div>

                {/* Acciones de Simulación del Avatar */}
                <div className={styles.settingsSection}>
                  <span className={styles.settingsSectionTitle}>Simulación y pruebas de Avatar</span>
                  <div className={styles.actionButtonRow}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setIsSleeping(true);
                        setView("chat");
                      }}
                    >
                      💤 Dormir a AVI
                    </button>

                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setIsSleeping(false);
                        setManualExpression(null);
                        setView("chat");
                      }}
                    >
                      ✨ Despertar a AVI
                    </button>

                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setManualExpression("annoyed");
                        setPokeMessage("¡Oye, no me piques tanto! >_<");
                        setView("chat");
                        window.setTimeout(() => {
                          setManualExpression(null);
                          setPokeMessage(null);
                        }, 3800);
                      }}
                    >
                      💢 Probar reacción de enojo
                    </button>

                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setMessages([]);
                        setChatExpanded(false);
                        setView("chat");
                      }}
                    >
                      🗑️ Reiniciar conversación
                    </button>
                  </div>
                </div>

                {/* Modo inmersivo */}
                <div className={styles.settingsSection}>
                  <span className={styles.settingsSectionTitle}>Visualización</span>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={toggleFullscreen}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {isFullscreen ? (
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      ) : (
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      )}
                    </svg>
                    <span>{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa (Modo inmersivo)"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Flotante de Catálogo de Expresiones */}
      <AnimatePresence>
        {view === "expressions" && (
          <div className={styles.modalOverlay} onClick={() => setView("chat")}>
            <motion.div
              className={styles.modalSheet}
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={styles.dot} />
                  <h2 className={styles.modalTitle}>Catálogo de Expresiones Anime</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setView("chat")}
                  aria-label="Cerrar catálogo"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                  Toca cualquier tarjeta para aplicar esa emoción a AVI en el escenario principal.
                </p>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Flotante de Historial */}
      <AnimatePresence>
        {view === "history" && (
          <div className={styles.modalOverlay} onClick={() => setView("chat")}>
            <motion.div
              className={styles.modalSheet}
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={styles.dot} />
                  <h2 className={styles.modalTitle}>Historial de Sesiones</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setView("chat")}
                  aria-label="Cerrar historial"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.historyList}>
                  {HISTORY.map((h) => (
                    <div
                      key={h.id}
                      className={styles.historyItem}
                      onClick={() => {
                        pushMessage(`[Historial]: Retomando sesión "${h.title}"`, "avi");
                        setView("chat");
                        setChatExpanded(true);
                      }}
                    >
                      <span className={styles.historyTitle}>{h.title}</span>
                      <span className={styles.historyWhen}>{h.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Flotante de Info */}
      <AnimatePresence>
        {view === "info" && (
          <div className={styles.modalOverlay} onClick={() => setView("chat")}>
            <motion.div
              className={styles.modalSheet}
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <span className={styles.dot} />
                  <h2 className={styles.modalTitle}>Contexto y Arquitectura de AVI</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setView("chat")}
                  aria-label="Cerrar información"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.infoTiers}>
                  {CONTEXT_TIERS.map((t) => (
                    <div key={t.level} className={styles.tierCard}>
                      <span className={styles.tierWho}>Nivel {t.level} · {t.who}</span>
                      <p className={styles.tierWhat}>{t.what}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
