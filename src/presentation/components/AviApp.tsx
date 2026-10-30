"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Compass,
  Cpu,
  Flame,
  History as HistoryIcon,
  Info,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Moon,
  Radio,
  RotateCcw,
  Send,
  Settings,
  Smile,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { Message, Role, View } from "@/domain/types";
import { aviService } from "@/infrastructure";
import { isSoundEnabled, playSfx, setSoundEnabled, triggerHaptic } from "@/shared/sound";
import { CONTEXT_TIERS, HISTORY, ROLE_KEYS, ROLES, SUGGESTIONS } from "@/shared/mock/avi";
import Face, { EXPRESSIONS, type Expression, type Mood } from "./Face";
import Waveform, { type WaveStyle } from "./Waveform";
import styles from "./AviApp.module.css";

const STATUS: Record<Mood, string> = {
  idle: "En línea",
  listening: "Escuchando…",
  thinking: "Pensando…",
  speaking: "Hablando…",
  sleeping: "Durmiendo… (mueve el cursor)",
};

const EMOTION_LABEL: Record<Expression, string> = {
  ...STATUS,
  joy: "Alegría",
  anger: "Enojo",
  annoyed: "Molesta",
  sad: "Tristeza",
  surprise: "Sorpresa",
};

const ANNOYED_LINES = [
  "¡Oye, no me piques tanto!",
  "¡Eso hace cosquillas, ya basta!",
  "¡Ouch! ¿Por qué tantos clics?",
  "¡Déjame en paz un ratito!",
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
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("avi_theme");
        if (saved === "light" || saved === "dark") return saved;
      } catch {
        // ignore
      }
    }
    return "dark";
  });

  const [waveStyle, setWaveStyle] = useState<WaveStyle>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("avi_wave_style");
        if (saved === "fluid" || saved === "bars" || saved === "orbital") return saved;
      } catch {
        // ignore
      }
    }
    return "fluid";
  });

  const handleWaveStyleChange = (style: WaveStyle) => {
    setWaveStyle(style);
    try {
      localStorage.setItem("avi_wave_style", style);
    } catch {
      // ignore
    }
  };

  // Estados interactivos estilo avatar lab
  const [isSleeping, setIsSleeping] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [pokeMessage, setPokeMessage] = useState<string | null>(null);

  const lastPokeTime = useRef(0);
  const pokeTimer = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);
  const isSleepingRef = useRef(false);
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

  // Telemetría vital biológica estimada
  const vitalBpm = isSleeping
    ? 54
    : expression === "surprise" || expression === "anger" || expression === "annoyed"
      ? 118
      : expression === "joy"
        ? 104
        : listening
          ? 94
          : speaking
            ? 88
            : pending
              ? 82
              : 72;

  useEffect(() => {
    hasConversationRef.current = hasConversation;
  }, [hasConversation]);

  useEffect(() => {
    isSleepingRef.current = isSleeping;
  }, [isSleeping]);

  // Detección de inactividad para dormir (sin re-renders continuos durante el movimiento)
  useEffect(() => {
    function resetInactivity() {
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
      }
      if (isSleepingRef.current) {
        setIsSleeping(false);
      }

      // Duerme tras 14 s de inactividad solo si no hay conversación activa ni dictado
      inactivityTimer.current = window.setTimeout(() => {
        if (!hasConversationRef.current) {
          setIsSleeping(true);
        }
      }, 14000);
    }

    function onPointerMove() {
      resetInactivity();
    }

    function onUserInteraction() {
      resetInactivity();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });

    resetInactivity();

    return () => {
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

  // Inicialización y sincronización del tema (Dark / Light) con Glassmorfismo
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    playSfx("toggle");
    try {
      localStorage.setItem("avi_theme", next);
    } catch {
      // ignore
    }
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSfx("chime");
  }

  // Atajos de teclado en PC (Espacio/M para mic, / para chat, T para tema, Esc para cerrar)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInput = activeTag === "input" || activeTag === "textarea";

      if (e.key === "Escape") {
        if (view !== "chat") {
          setView("chat");
        } else if (chatExpanded) {
          setChatExpanded(false);
        }
        return;
      }

      if (isInput) return;

      if (e.key === " " || e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMic();
      } else if (e.key === "/") {
        e.preventDefault();
        setChatExpanded(true);
        window.setTimeout(() => {
          document.querySelector<HTMLInputElement>("." + styles.input)?.focus();
        }, 120);
      } else if (e.key.toLowerCase() === "t") {
        toggleTheme();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, chatExpanded, listening, theme]);

  // Interacción al tocar / hacer clics repetidos en AVI
  function handleFaceClick() {
    setIsSleeping(false);
    playSfx("poke");
    triggerHaptic(18);
    const now = Date.now();
    const isRapid = now - lastPokeTime.current < 2200;
    lastPokeTime.current = now;

    const nextCount = isRapid ? pokeCount + 1 : 1;
    setPokeCount(nextCount);

    if (pokeTimer.current) window.clearTimeout(pokeTimer.current);

    if (nextCount === 1) {
      setPokeMessage("¡Hola!");
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

  function send(text: string, expandChat: boolean = false) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setManualExpression(null);
    pushMessage(trimmed, "user");
    setInput("");
    if (expandChat) {
      setChatExpanded(true);
    }
    setPending(true);
    void aviService.reply(role, trimmed).then((reply) => {
      setPending(false);
      pushMessage(reply, "avi");
      setSpeaking(true);
      playSfx("reply");
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
      playSfx("micOff");
      send("» dictado de ejemplo (mock)", false);
      return;
    }
    playSfx("micOn");
    triggerHaptic(25);
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
      <div className={`${styles.ambientBar} ${chatExpanded ? styles.ambientBarHidden : ""}`}>
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
            {ROLES[role].label} · Test Settings
          </button>
        </div>

        {/* Telemetría periférica sutil en la barra ambiental */}
        <div className={styles.telemetryPill} title="Telemetría vital y biológica de AVI">
          <Activity size={12} className={styles.pulseIcon} />
          <span className={styles.vitalVal}>{vitalBpm}</span>
          <span className={styles.vitalUnit}>BPM</span>
          <span className={styles.telemetryDot} />
          <Cpu size={12} />
          <span className={styles.vitalVal}>99.6%</span>
          <span className={styles.vitalUnit}>SYNC</span>
          <span className={styles.telemetryDot} />
          <span className={styles.vitalDot} data-mood={expression} />
          <span className={styles.vitalStatus}>{EMOTION_LABEL[expression]}</span>
        </div>

        {/* Controles de la esquina superior derecha: Selector de sonido, tema Glass & FAB */}
        <div className={styles.ambientControls}>
          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={toggleSound}
            aria-label={soundOn ? "Silenciar efectos sonoros" : "Activar efectos sonoros"}
            title={soundOn ? "Sonido activado (clic para silenciar)" : "Silenciado (clic para activar)"}
          >
            {soundOn ? (
              <Volume2 size={19} strokeWidth={2.2} />
            ) : (
              <VolumeX size={19} strokeWidth={2.2} />
            )}
          </button>

          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Cambiar a modo claro pastel" : "Cambiar a modo oscuro obsidian"}
            title={theme === "dark" ? "Activar Modo Claro Pastel (Tecla T)" : "Activar Modo Oscuro Obsidian (Tecla T)"}
          >
            {theme === "dark" ? (
              <Sun size={19} strokeWidth={2.2} />
            ) : (
              <Moon size={19} strokeWidth={2.2} />
            )}
          </button>

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
                <X size={20} strokeWidth={2.4} />
              ) : (
                <Compass size={22} strokeWidth={2.2} />
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
                      <Radio size={18} strokeWidth={2} />
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
                      <MessageSquare size={18} strokeWidth={2} />
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
                      <Smile size={18} strokeWidth={2} />
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
                      <HistoryIcon size={18} strokeWidth={2} />
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
                      <Info size={18} strokeWidth={2} />
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
                    <span className={styles.radialLabel}>Ajustes & Simulación</span>
                    <span className={styles.radialOrb}>
                      <Settings size={18} strokeWidth={2} />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.radialItem}
                    onClick={() => {
                      toggleTheme();
                      setMenuOpen(false);
                    }}
                  >
                    <span className={styles.radialLabel}>
                      {theme === "dark" ? "Modo Claro Pastel" : "Modo Oscuro Obsidian"}
                    </span>
                    <span className={styles.radialOrb}>
                      {theme === "dark" ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

      {/* Escenario Protagonista (Full Face & Voice Stage Purificado) */}
      <main
        className={styles.stage}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.stageGlow} aria-hidden="true" />

        <div className={styles.stageFace}>
          <Face
            expression={expression}
            pokeCount={pokeCount}
            pokeMessage={pokeMessage}
            onFaceClick={handleFaceClick}
          />
        </div>

        <Waveform
          mood={mood}
          micOn={listening}
          styleVariant={waveStyle}
          showMeta={false}
        />

        {/* Botón de voz protagonista */}
        <div className={styles.voiceActionGroup}>
          <button
            type="button"
            className={`${styles.bigMic} ${listening ? styles.bigMicActive : ""}`}
            onClick={toggleMic}
            aria-label={listening ? "Detener dictado" : "Hablar con AVI"}
            aria-pressed={listening}
          >
            <Mic size={32} strokeWidth={2.2} />
          </button>
        </div>

        {/* Barra gestual inferior: Deslizar hacia arriba o pulsar para abrir conversación */}
        <button
          type="button"
          className={styles.gestureBar}
          onClick={() => setChatExpanded(true)}
          aria-label="Abrir conversación de chat"
        >
          <ChevronUp size={16} strokeWidth={2.5} className={styles.gestureChevron} />
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
                  <Face expression={expression} interactive={false} />
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
                <ChevronDown size={14} strokeWidth={2.5} />
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
                  onClick={() => send(s, true)}
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
                <Mic size={18} strokeWidth={2} />
              </button>

              <input
                className={styles.input}
                value={input}
                placeholder="Escribe una instrucción para AVI…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input, true);
                }}
              />

              <button type="button" className={styles.send} onClick={() => send(input, true)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Send size={14} strokeWidth={2.2} /> Enviar
                </span>
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
                  <X size={18} strokeWidth={2.2} />
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
                      <Moon size={15} /> Dormir a AVI
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
                      <Sun size={15} /> Despertar a AVI
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
                      <Flame size={15} /> Probar reacción de enojo
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
                      <RotateCcw size={15} /> Reiniciar conversación
                    </button>
                  </div>
                </div>

                {/* Estilo Visual & Glassmorfismo */}
                <div className={styles.settingsSection}>
                  <span className={styles.settingsSectionTitle}>Estilo Visual & Glassmorfismo</span>
                  <div className={styles.actionButtonRow}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${theme === "dark" ? styles.roleCardActive : ""}`}
                      onClick={() => {
                        if (theme !== "dark") toggleTheme();
                      }}
                    >
                      <Moon size={16} /> Modo Oscuro (Obsidian Glass)
                    </button>

                    <button
                      type="button"
                      className={`${styles.actionBtn} ${theme === "light" ? styles.roleCardActive : ""}`}
                      onClick={() => {
                        if (theme !== "light") toggleTheme();
                      }}
                    >
                      <Sun size={16} /> Modo Claro (Pastel Milk Glass)
                    </button>
                  </div>
                </div>

                {/* Estilo del Visualizador Acústico */}
                <div className={styles.settingsSection}>
                  <span className={styles.settingsSectionTitle}>Gráfica Acústica (Visualizador de Voz)</span>
                  <div className={styles.roleGrid}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${waveStyle === "fluid" ? styles.roleCardActive : ""}`}
                      onClick={() => handleWaveStyleChange("fluid")}
                    >
                      <Radio size={16} /> Aurora Fluida (Líquida continua)
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${waveStyle === "bars" ? styles.roleCardActive : ""}`}
                      onClick={() => handleWaveStyleChange("bars")}
                    >
                      <Compass size={16} /> Espectro Holográfico (Barras anime)
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${waveStyle === "orbital" ? styles.roleCardActive : ""}`}
                      onClick={() => handleWaveStyleChange("orbital")}
                    >
                      <Flame size={16} /> Orbe Resonante (Pulso concéntrico)
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
                    {isFullscreen ? (
                      <>
                        <Minimize2 size={16} />
                        <span>Salir de pantalla completa</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 size={16} />
                        <span>Pantalla completa (Modo inmersivo)</span>
                      </>
                    )}
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
                  <X size={18} strokeWidth={2.2} />
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
                  <X size={18} strokeWidth={2.2} />
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
                  <X size={18} strokeWidth={2.2} />
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
