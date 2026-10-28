"use client";

import { useEffect, useRef, useState } from "react";
import type { Message, Role, View } from "@/domain/types";
import { aviService } from "@/infrastructure";
import { CONTEXT_TIERS, HISTORY, ROLE_KEYS, ROLES, SUGGESTIONS } from "@/shared/mock/avi";
import Face, { type Mood } from "./Face";
import styles from "./AviApp.module.css";

const NAV: { key: View; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "history", label: "Historial" },
  { key: "info", label: "Info" },
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
  const endRef = useRef<HTMLDivElement>(null);

  const mood: Mood = listening
    ? "listening"
    : pending
      ? "thinking"
      : speaking
        ? "speaking"
        : "idle";
  const hasConversation = messages.length > 0;

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
    pushMessage(trimmed, "user");
    setInput("");
    setPending(true);
    void aviService.reply(role, trimmed).then((reply) => {
      setPending(false);
      pushMessage(reply, "avi");
      setSpeaking(true);
      window.setTimeout(() => setSpeaking(false), 1600);
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
    setListening((v) => !v);
    if (!listening) {
      window.setTimeout(() => {
        setListening(false);
        setInput((v) => (v || "» dictado de ejemplo (mock)"));
      }, 1200);
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          AVI
          <span className={styles.badge}>shell</span>
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
            title="Pantalla completa (inmersivo)"
          >
            {isFullscreen ? "Salir de inmersivo" : "⛶ Inmersivo"}
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            className={`${styles.navItem} ${view === n.key ? styles.navItemActive : ""}`}
            onClick={() => setView(n.key)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      {view === "chat" && (
        <>
          <div className={styles.context}>
            Contexto · {ROLES[role].label}: <strong>{ROLES[role].context}</strong>
          </div>

          {hasConversation ? (
            <>
              <div className={styles.faceBar}>
                <Face mood={mood} size={140} />
              </div>
              <main className={styles.thread}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.msg} ${m.author === "user" ? styles.user : styles.avi}`}
                  >
                    <span className={styles.msgAuthor}>
                      {m.author === "user" ? "Tú" : "AVI"}
                    </span>
                    <p className={styles.msgText}>{m.text}</p>
                  </div>
                ))}
                {listening && <div className={styles.listening}>Escuchando…</div>}
                <div ref={endRef} />
              </main>
            </>
          ) : (
            <div className={styles.faceHero}>
              <Face mood={mood} size={320} />
              <p className={styles.faceHint}>Hola, soy AVI — háblame o escribe.</p>
            </div>
          )}

          <div className={styles.suggestions}>
            {SUGGESTIONS[role].map((s) => (
              <button key={s} type="button" className={styles.chip} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          <footer className={styles.composer}>
            <button
              type="button"
              className={`${styles.mic} ${listening ? styles.micActive : ""}`}
              onClick={toggleMic}
              title="Dictado por voz (mock)"
            >
              🎙
            </button>
            <input
              className={styles.input}
              value={input}
              placeholder="Escribe o dicta una instrucción…"
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
        <main className={styles.panel}>
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
        <main className={styles.panel}>
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
  );
}
