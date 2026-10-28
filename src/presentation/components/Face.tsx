"use client";

import React, { type ReactNode } from "react";
import styles from "./Face.module.css";

export type Mood = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type Emotion = "joy" | "anger" | "sad" | "surprise" | "annoyed";
export type Expression = Mood | Emotion;

export const EXPRESSIONS: Expression[] = [
  "idle",
  "listening",
  "thinking",
  "speaking",
  "joy",
  "surprise",
  "anger",
  "sad",
  "sleeping",
  "annoyed",
];

interface Palette {
  irisTop: string;
  irisMid: string;
  irisBot: string;
  irisRim: string;
  stroke: string;
  blush: string;
}

const PALETTES: Record<Expression, Palette> = {
  idle: {
    irisTop: "#081b29",
    irisMid: "#0284c7",
    irisBot: "#2dd4bf",
    irisRim: "#a5f3fc",
    stroke: "#2dd4bf",
    blush: "rgba(45, 212, 191, 0.35)",
  },
  listening: {
    irisTop: "#081b29",
    irisMid: "#0ea5e9",
    irisBot: "#38bdf8",
    irisRim: "#bae6fd",
    stroke: "#38bdf8",
    blush: "rgba(56, 189, 248, 0.4)",
  },
  thinking: {
    irisTop: "#0f172a",
    irisMid: "#0d9488",
    irisBot: "#14b8a6",
    irisRim: "#99f6e4",
    stroke: "#14b8a6",
    blush: "rgba(20, 184, 166, 0.3)",
  },
  speaking: {
    irisTop: "#061e28",
    irisMid: "#06b6d4",
    irisBot: "#22d3ee",
    irisRim: "#cffafe",
    stroke: "#22d3ee",
    blush: "rgba(34, 211, 238, 0.35)",
  },
  joy: {
    irisTop: "#2a1502",
    irisMid: "#d97706",
    irisBot: "#fbbf24",
    irisRim: "#fef08a",
    stroke: "#ffd166",
    blush: "rgba(255, 107, 139, 0.65)",
  },
  surprise: {
    irisTop: "#240e3f",
    irisMid: "#9333ea",
    irisBot: "#c084fc",
    irisRim: "#f3e8ff",
    stroke: "#c792ea",
    blush: "rgba(199, 146, 234, 0.45)",
  },
  anger: {
    irisTop: "#330808",
    irisMid: "#dc2626",
    irisBot: "#f87171",
    irisRim: "#fecaca",
    stroke: "#ff6b6b",
    blush: "rgba(255, 107, 107, 0.55)",
  },
  annoyed: {
    irisTop: "#3b0808",
    irisMid: "#e11d48",
    irisBot: "#f43f5e",
    irisRim: "#fecdd3",
    stroke: "#ff4b6e",
    blush: "rgba(255, 75, 110, 0.7)",
  },
  sad: {
    irisTop: "#111827",
    irisMid: "#3b82f6",
    irisBot: "#60a5fa",
    irisRim: "#bfdbfe",
    stroke: "#74a7ff",
    blush: "rgba(116, 167, 255, 0.4)",
  },
  sleeping: {
    irisTop: "#08121f",
    irisMid: "#1e293b",
    irisBot: "#334155",
    irisRim: "#94a3b8",
    stroke: "#818cf8",
    blush: "rgba(129, 140, 248, 0.3)",
  },
};

export interface FaceProps {
  expression: Expression;
  pointer?: { x: number; y: number };
  pokeCount?: number;
  pokeMessage?: string | null;
  onFaceClick?: (e: React.MouseEvent) => void;
  interactive?: boolean;
}

/* Ojos durmiendo (Anime Sleeping Eyes ˘ ˘) */
function AnimeSleepingEye() {
  return (
    <g className={styles.sleepingEye}>
      <path
        d="M 52 82 Q 78 96 104 82"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Pestañas caídas relajadas */}
      <path
        d="M 64 88 L 60 93 M 78 91 L 78 96 M 92 88 L 96 93"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

/* Ojos de sonrisa feliz (Joy) */
function AnimeJoyEye() {
  return (
    <g className={styles.joyEye}>
      <path
        d="M 46 82 C 60 56, 88 56, 108 80 C 94 65, 68 65, 54 84 Z"
        fill="currentColor"
      />
      <path
        d="M 48 83 Q 41 78 38 82 M 45 87 L 39 90"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 66 90 Q 80 94 94 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  );
}

/* Ojo Anime Abierto con seguimiento dinámico de puntero */
function AnimeOpenEye({
  expression,
  gazeX,
  gazeY,
}: {
  expression: Expression;
  gazeX: number;
  gazeY: number;
}) {
  const isSurprise = expression === "surprise";
  const isNarrow = expression === "anger" || expression === "annoyed" || expression === "thinking";
  const isSad = expression === "sad";

  const pupilScale = isSurprise ? 0.8 : isNarrow ? 0.9 : 1;

  return (
    <g className={styles.openEye}>
      {/* Pliegue del párpado superior */}
      <path
        d={isNarrow ? "M 62 64 Q 80 59 98 64" : "M 60 60 Q 80 54 99 60"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
        className={styles.eyelidCrease}
      />

      {/* Iris con seguimiento fluido del puntero del mouse */}
      <g
        className={styles.irisGroup}
        style={{
          transform: `translate(${gazeX}px, ${gazeY}px)`,
        }}
      >
        <ellipse
          cx={80}
          cy={86}
          rx={isSurprise ? 17 : 15}
          ry={isNarrow ? 16 : isSurprise ? 21 : 19}
          fill={`url(#iris-grad-${expression})`}
        />

        {/* Zona sombreada superior */}
        <path
          d="M 65 82 Q 80 90 95 82 L 95 67 Q 80 65 65 67 Z"
          fill="#020617"
          opacity="0.68"
        />

        {/* Pupila vertical */}
        <ellipse
          cx={80}
          cy={84}
          rx={6 * pupilScale}
          ry={(isNarrow ? 8 : 10) * pupilScale}
          fill="#020617"
        />

        {/* Reflejo inferior brillante */}
        <path
          d="M 68 89 Q 80 103 92 89 Q 80 95 68 89 Z"
          fill={`url(#iris-rim-${expression})`}
          opacity="0.85"
        />

        {/* Brillos especulares (Catchlights) */}
        <ellipse
          cx={74}
          cy={77}
          rx={isSurprise ? 5 : 4.5}
          ry={isSurprise ? 6.5 : 6}
          transform="rotate(-18 74 77)"
          fill="#ffffff"
        />
        <circle
          cx={87}
          cy={91}
          r={isSurprise ? 2.8 : 2.4}
          fill="#ffffff"
          opacity="0.9"
        />
        <circle
          cx={85}
          cy={76}
          r="1.4"
          fill="#ffffff"
          opacity="0.8"
        />

        {isSurprise && (
          <circle
            cx={75}
            cy={92}
            r="1.8"
            fill="#ffffff"
            opacity="0.85"
          />
        )}
      </g>

      {/* Pestaña superior con ala externa */}
      <path
        d={
          isNarrow
            ? "M 48 72 C 58 64, 78 63, 108 72 C 96 66, 76 65, 56 73 Z"
            : "M 46 70 C 58 58, 80 56, 108 70 C 96 62, 76 60, 54 72 Z"
        }
        fill="currentColor"
        className={styles.upperLash}
      />
      <polygon
        points={isNarrow ? "48,72 40,68 52,70" : "46,70 38,65 50,68"}
        fill="currentColor"
      />
      <path
        d={isNarrow ? "M 44 71 L 39 67" : "M 42 69 L 36 64"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Pestaña inferior delicada */}
      <path
        d="M 68 102 Q 80 105 94 101"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M 66 102 L 62 106 M 72 104 L 70 108"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Reflejo acuoso triste */}
      {isSad && (
        <path
          d="M 66 98 Q 80 107 94 98 Q 80 102 66 98 Z"
          fill="#ffffff"
          opacity="0.75"
        />
      )}
    </g>
  );
}

function Mirror({ children }: { children: ReactNode }) {
  return <g transform="translate(260 0) scale(-1 1)">{children}</g>;
}

/* Cejas anime expresivas */
function AnimeBrows({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return (
        <g className={styles.brows}>
          <path d="M 56 56 Q 78 50 102 54" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 158 54 Q 182 50 204 56" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case "joy":
      return (
        <g className={styles.brows}>
          <path d="M 52 46 Q 78 34 104 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 44 Q 182 34 208 46" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "surprise":
      return (
        <g className={styles.brows}>
          <path d="M 54 36 Q 78 26 104 35" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 35 Q 182 26 206 36" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "anger":
    case "annoyed":
      return (
        <g className={styles.brows}>
          <path d="M 52 42 Q 78 48 106 62" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M 154 62 Q 182 48 208 42" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M 127 58 L 130 63 L 133 58" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75" />
        </g>
      );
    case "sad":
      return (
        <g className={styles.brows}>
          <path d="M 54 58 Q 80 54 104 42" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 42 Q 180 54 206 58" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "thinking":
      return (
        <g className={styles.brows}>
          <path d="M 52 44 Q 78 36 104 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 53 Q 182 49 208 55" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "listening":
      return (
        <g className={styles.brows}>
          <path d="M 54 48 Q 78 39 104 46" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 156 46 Q 182 39 206 48" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g className={styles.brows}>
          <path d="M 54 52 Q 78 44 104 50" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 156 50 Q 182 44 206 52" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

/* Bocas anime expresivas */
function AnimeMouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return (
        <g className={styles.mouthSleep}>
          <path d="M 124 140 Q 130 143 136 140" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "joy":
      return (
        <g className={styles.mouthJoy}>
          <path
            d="M 114 133 Q 130 133 146 133 Q 146 153 130 155 Q 114 153 114 133 Z"
            fill="#3b0814"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M 117 134 Q 130 134 143 134 Q 141 138 130 138 Q 119 138 117 134 Z" fill="#ffffff" />
          <ellipse cx="130" cy="150" rx="9" ry="5.5" fill="#fb7185" />
        </g>
      );
    case "speaking":
      return (
        <g className={styles.mouthTalk}>
          <path
            d="M 116 135 Q 130 132 144 135 Q 144 150 130 152 Q 116 150 116 135 Z"
            fill="#031b26"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M 119 135 Q 130 134 141 135 Q 140 138 130 138 Q 120 138 119 135 Z" fill="#ffffff" />
          <ellipse cx="130" cy="148" rx="8" ry="4.5" fill="#22d3ee" opacity="0.75" />
        </g>
      );
    case "listening":
      return (
        <g className={styles.mouthOoh}>
          <ellipse
            cx="130"
            cy="142"
            rx="7"
            ry="8"
            fill="#04121b"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <ellipse cx="130" cy="144" rx="4" ry="3.5" fill="#38bdf8" opacity="0.6" />
        </g>
      );
    case "thinking":
      return (
        <g className={styles.mouthThinking}>
          <path
            d="M 119 141 Q 128 136 141 140"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M 132 146 Q 134 147 136 146" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.45" />
        </g>
      );
    case "surprise":
      return (
        <g className={styles.mouthSurprise}>
          <ellipse
            cx="130"
            cy="143"
            rx="9"
            ry="12"
            fill="#240e3f"
            stroke="currentColor"
            strokeWidth="2.6"
          />
          <ellipse cx="130" cy="148" rx="6" ry="4" fill="#c084fc" opacity="0.5" />
        </g>
      );
    case "anger":
    case "annoyed":
      return (
        <g className={styles.mouthAnger}>
          <path
            d="M 115 137 Q 130 133 145 137 Q 142 154 130 152 Q 118 154 115 137 Z"
            fill="#3b0808"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M 117 137 L 143 137 Q 140 142 130 142 Q 120 142 117 137 Z" fill="#ffffff" />
          <path d="M 119 152 L 141 152 Q 138 147 130 147 Q 122 147 119 152 Z" fill="#ffffff" opacity="0.9" />
        </g>
      );
    case "sad":
      return (
        <g className={styles.mouthSad}>
          <path
            d="M 116 142 Q 130 136 144 142 Q 140 152 130 151 Q 120 152 116 142 Z"
            fill="#111827"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <path d="M 120 142 Q 130 140 140 142" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        </g>
      );
    default:
      return (
        <g className={styles.mouthIdle}>
          <path d="M 121 138 Q 130 144 139 138" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 128 145 Q 130 146 132 145" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5" />
        </g>
      );
  }
}

/* Marca de enojo anime (💢 Anger Cross Vein) */
function AnimeAngerVein() {
  return (
    <g className={styles.angerVein} transform="translate(198 42)">
      {/* 4 marcas curvas de tensión anime */}
      <path
        d="M -9 -4 Q -4 -4 -4 -9 M 9 -4 Q 4 -4 4 -9 M -9 4 Q -4 4 -4 9 M 9 4 Q 4 4 4 9"
        stroke="#ff2247"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
    </g>
  );
}

/* Letras Zzz flotantes para cuando está durmiendo */
function AnimeZzz() {
  return (
    <g className={styles.zzzGroup}>
      <text x="180" y="80" className={styles.zzz1}>z</text>
      <text x="194" y="64" className={styles.zzz2}>Z</text>
      <text x="212" y="44" className={styles.zzz3}>Z</text>
    </g>
  );
}

export default function Face({
  expression,
  pointer = { x: 0, y: 0 },
  pokeCount = 0,
  pokeMessage = null,
  onFaceClick,
  interactive = true,
}: FaceProps) {
  const isSleeping = expression === "sleeping";
  const isJoy = expression === "joy";
  const isAnnoyed = expression === "annoyed" || expression === "anger" || pokeCount >= 4;

  // Seguimiento suave del puntero (amortiguado)
  const gazeX = isSleeping ? 0 : expression === "thinking" ? 3.5 : pointer.x * 9.5;
  const gazeY = isSleeping ? 2 : expression === "thinking" ? -3.5 : pointer.y * 6;

  // Inclinación 3D sutil hacia el mouse
  const tiltX = (pointer.y * -6).toFixed(2);
  const tiltY = (pointer.x * 8).toFixed(2);

  const palette = PALETTES[expression] || PALETTES.idle;

  return (
    <div
      className={`${styles.faceWrapper} ${isAnnoyed ? styles.shaking : ""}`}
      style={{
        transform: `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      }}
      onClick={interactive ? onFaceClick : undefined}
      title={interactive ? "¡Toca a AVI para interactuar!" : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onFaceClick?.(e as unknown as React.MouseEvent);
              }
            }
          : undefined
      }
    >
      {/* Globo de reacción al tocar mucho a AVI */}
      {pokeMessage && (
        <div className={styles.pokeBubble} aria-live="polite">
          <span>{pokeMessage}</span>
          <div className={styles.bubbleTail} />
        </div>
      )}

      <svg
        viewBox="0 0 260 180"
        className={styles.face}
        data-expression={expression}
        role="img"
        aria-label={`AVI — ${expression}`}
        fill="none"
        stroke="currentColor"
      >
        <defs>
          {EXPRESSIONS.map((exp) => {
            const pal = PALETTES[exp] || PALETTES.idle;
            return (
              <g key={exp}>
                <linearGradient id={`iris-grad-${exp}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={pal.irisTop} />
                  <stop offset="45%" stopColor={pal.irisMid} />
                  <stop offset="90%" stopColor={pal.irisBot} />
                </linearGradient>

                <linearGradient id={`iris-rim-${exp}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={pal.irisRim} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={pal.irisRim} stopOpacity="0.9" />
                </linearGradient>

                <radialGradient id={`blush-radial-${exp}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={pal.stroke} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={pal.stroke} stopOpacity="0" />
                </radialGradient>
              </g>
            );
          })}
        </defs>

        {/* Capa de expresión con crossfade al cambiar de expresión */}
        <g key={expression} className={styles.faceElements}>
          {/* Cejas Anime con transición */}
          <AnimeBrows expression={expression} />

          {/* Marca de enojo anime cuando se molesta o enojo */}
          {isAnnoyed && <AnimeAngerVein />}

          {/* Letras Zzz flotantes al dormir */}
          {isSleeping && <AnimeZzz />}

          {/* Sonrojo Anime */}
          <g
            className={styles.blushContainer}
            data-expression={expression}
          >
            {/* Mejilla izquierda */}
            <g transform="translate(54 104)">
              <line x1="0" y1="8" x2="6" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="5" y1="8" x2="11" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="8" x2="16" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <ellipse cx="8" cy="4" rx="13" ry="7" fill={`url(#blush-radial-${expression})`} />
            </g>
            {/* Mejilla derecha */}
            <g transform="translate(190 104)">
              <line x1="0" y1="8" x2="6" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="5" y1="8" x2="11" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="8" x2="16" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <ellipse cx="8" cy="4" rx="13" ry="7" fill={`url(#blush-radial-${expression})`} />
            </g>
          </g>

          {/* Nariz anime minimalista */}
          <path
            d="M 130 114 L 128 118"
            stroke={palette.stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.45"
            className={styles.nose}
          />

          {/* Ojos Izquierdo y Derecho con transición suave */}
          {isSleeping ? (
            <g className={styles.eyesGroup}>
              <g className={styles.eyeL}>
                <AnimeSleepingEye />
              </g>
              <g className={styles.eyeR}>
                <Mirror>
                  <AnimeSleepingEye />
                </Mirror>
              </g>
            </g>
          ) : isJoy ? (
            <g className={styles.eyesGroup}>
              <g className={styles.eyeL}>
                <AnimeJoyEye />
              </g>
              <g className={styles.eyeR}>
                <Mirror>
                  <AnimeJoyEye />
                </Mirror>
              </g>
            </g>
          ) : (
            <g className={styles.eyesGroup}>
              <g className={styles.eyeL}>
                <AnimeOpenEye
                  expression={expression}
                  gazeX={gazeX}
                  gazeY={gazeY}
                />
              </g>
              <g className={styles.eyeR}>
                <Mirror>
                  <AnimeOpenEye
                    expression={expression}
                    gazeX={-gazeX}
                    gazeY={gazeY}
                  />
                </Mirror>
              </g>
            </g>
          )}

          {/* Lágrimas animadas para Tristeza */}
          {expression === "sad" && (
            <g className={styles.tearsStream}>
              <path
                className={styles.tearL}
                d="M 64 98 C 60 110, 58 124, 62 136 C 66 142, 60 148, 58 152"
                stroke="#93c5fd"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="62" cy="136" r="2.8" fill="#ffffff" className={styles.tearDropL} />

              <path
                className={styles.tearR}
                d="M 196 98 C 200 110, 202 124, 198 136 C 194 142, 200 148, 202 152"
                stroke="#93c5fd"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="198" cy="136" r="2.8" fill="#ffffff" className={styles.tearDropR} />
            </g>
          )}

          {/* Boca Anime */}
          <AnimeMouth expression={expression} />
        </g>
      </svg>
    </div>
  );
}
