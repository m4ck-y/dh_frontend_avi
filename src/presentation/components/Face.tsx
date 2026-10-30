"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
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
  mouthLevel?: MotionValue<number>;
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
          <path d="M 56 56 Q 78 51 102 54" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 158 54 Q 182 51 204 56" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case "joy":
      return (
        <g className={styles.brows}>
          <path d="M 52 45 Q 78 34 104 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 44 Q 182 34 208 45" strokeWidth="3.2" fill="none" strokeLinecap="round" />
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
      return (
        <g className={styles.brows}>
          <path d="M 50 40 Q 78 48 106 63" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M 154 63 Q 182 48 210 40" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M 127 58 L 130 63 L 133 58" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "annoyed":
      return (
        <g className={styles.brows}>
          <path d="M 54 44 Q 78 48 104 57" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 57 Q 182 48 206 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "sad":
      return (
        <g className={styles.brows}>
          <path d="M 54 58 Q 80 54 104 43" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 43 Q 180 54 206 58" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "thinking":
      return (
        <g className={styles.brows}>
          <path d="M 52 44 Q 78 36 104 43" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 156 53 Q 182 49 208 55" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "listening":
      return (
        <g className={styles.brows}>
          <path d="M 54 47 Q 78 39 104 46" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 156 45 Q 182 37 206 47" strokeWidth="3" fill="none" strokeLinecap="round" />
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

/* Bocas anime expresivas y finas con estética manga y trazo limpio */
function AnimeMouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthSleep}`}>
          {/* Boca relajada durmiendo fina */}
          <path
            d="M 124 141 Q 130 143.4 136 141"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="130" cy="144" rx="2" ry="0.8" fill="#a5b4fc" opacity="0.35" />
          {/* Burbuja anime de sueño clásica (Sleeping Bubble) */}
          <g className={styles.sleepBubble}>
            <circle
              cx="137.5"
              cy="135.5"
              r="6.5"
              fill="rgba(199, 210, 254, 0.42)"
              stroke="rgba(165, 180, 252, 0.75)"
              strokeWidth="1.2"
            />
            <circle cx="135.8" cy="133.2" r="1.4" fill="#ffffff" opacity="0.85" />
          </g>
        </g>
      );

    case "listening":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthOoh}`}>
          {/* Boquita anime atenta y receptiva: estilo curiosa (・o・) con trazo limpio */}
          <ellipse
            cx="130"
            cy="142"
            rx="4.6"
            ry="5.2"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {/* Pequeño diente superior nítido */}
          <path
            d="M 126.8 139.2 Q 130 138.2 133.2 139.2 C 132.5 140.6, 131.2 141, 130 141 C 128.8 141, 127.5 140.6, 126.8 139.2 Z"
            fill="#ffffff"
          />
          {/* Lengüita suave rosada */}
          <ellipse cx="130" cy="145.2" rx="3" ry="1.6" fill="url(#anime-tongue-grad)" />
          {/* Sombra de labio inferior y destello */}
          <ellipse cx="130" cy="149.2" rx="2.4" ry="0.9" fill="currentColor" opacity="0.3" />
        </g>
      );

    case "annoyed":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthAnnoyed}`}>
          {/* Labio de puchero anime 'wavy pout' característico tsundere (forma omega sutil) */}
          <path
            d="M 122 143 Q 125.5 139.8 128 142 Q 130 143 132 142 Q 134.5 139.8 138 143"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Pestañas de tensión en las comisuras del puchero */}
          <path
            d="M 121.5 142.5 L 120.2 144.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 138.5 142.5 L 139.8 144.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Sombra de puchero en el labio inferior con rubor */}
          <ellipse cx="130" cy="145.8" rx="3" ry="1.1" fill="#f43f5e" opacity="0.4" />
          <path
            d="M 128 147.8 Q 130 148.4 132 147.8"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      );

    case "anger":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthAnger}`}>
          {/* Línea principal de dientes apretados con tensión y determinación */}
          <path
            d="M 120 142.5 Q 130 140.2 140 142.5"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Hendidura de dientes apretados formando tensión maxilar */}
          <path
            d="M 122.5 144.5 Q 130 142.8 137.5 144.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Tensión en las comisuras estilo manga */}
          <path
            d="M 120 140.5 L 120 145"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 140 140.5 L 140 145"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Sombra de enfado bajo el labio */}
          <ellipse cx="130" cy="147.2" rx="3" ry="1" fill="#dc2626" opacity="0.35" />
          <path
            d="M 127.5 149 Q 130 149.6 132.5 149"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
      );

    case "thinking":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthThinking}`}>
          {/* Labio asimétrico pensativo anime fino */}
          <path
            d="M 122 140.5 Q 126 138.8 130 141.2 Q 134.5 143.5 138 140.5"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Toque de labio pensativo */}
          <ellipse cx="129.5" cy="144" rx="2.2" ry="0.9" fill="currentColor" opacity="0.25" />
          <path
            d="M 128.5 146.2 Q 130 146.8 131.5 146.2"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
        </g>
      );

    case "joy":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthJoy}`}>
          {/* Sonrisa radiante curva anime fina */}
          <path
            d="M 118 138 Q 130 148.5 142 138"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Relleno sutil y suave de sonrisa alegre */}
          <path
            d="M 119.5 138.5 Q 130 148 140.5 138.5 C 137 141.2, 133.5 142.2, 130 142.2 C 126.5 142.2, 123 141.2, 119.5 138.5 Z"
            fill="url(#anime-tongue-grad)"
            opacity="0.75"
          />
          {/* Pequeñas comisuras hacia arriba */}
          <path
            d="M 117 137 Q 118 138.5 119 138"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M 143 137 Q 142 138.5 141 138"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <ellipse cx="130" cy="149" rx="2.5" ry="1" fill="#f59e0b" opacity="0.35" />
        </g>
      );

    case "surprise":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthSurprise}`}>
          {/* Boquita ovalada de sorpresa anime limpia */}
          <ellipse
            cx="130"
            cy="142"
            rx="5.5"
            ry="7.5"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {/* Dientito superior visible y limpio */}
          <path
            d="M 126 137.5 Q 130 136.5 134 137.5 C 133 139, 131.5 139.5, 130 139.5 C 128.5 139.5, 127 139, 126 137.5 Z"
            fill="#ffffff"
          />
          {/* Lengüita suave en la parte inferior */}
          <ellipse cx="130" cy="146.5" rx="3.5" ry="2.2" fill="url(#anime-tongue-grad)" />
        </g>
      );

    case "sad":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthSad}`}>
          {/* Labio triste anime con curva temblorosa hacia abajo */}
          <path
            d="M 122 144 Q 126 141.2 130 141.8 Q 134 141.2 138 144"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Hendidura temblorosa de labio inferior */}
          <path
            d="M 126 146 Q 130 147.2 134 146"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <ellipse cx="130" cy="144.5" rx="2" ry="0.8" fill="#60a5fa" opacity="0.35" />
        </g>
      );

    case "speaking":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthTalk}`}>
          {/* Contorno limpio estilizado anime modulando visemas fluidos */}
          <path
            d="M 121 138 Q 130 136 139 138 C 140 146.5, 136 151, 130 151 C 124 151, 120 146.5, 121 138 Z"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Dientes superiores con línea limpia */}
          <path
            d="M 122 138.2 Q 130 136.8 138 138.2 C 136 140.4, 133 141, 130 141 C 127 141, 124 140.4, 122 138.2 Z"
            fill="#ffffff"
          />
          {/* Lengua anime suave rosada */}
          <ellipse cx="130" cy="148" rx="4.5" ry="2.6" fill="url(#anime-tongue-grad)" />
          {/* Sombra de labio inferior */}
          <path
            d="M 128.5 153.5 Q 130 154 131.5 153.5"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      );

    default:
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthIdle}`}>
          {/* Labio superior fino con curvatura anime delicada (idle de referencia) */}
          <path
            d="M 121 140 Q 125.5 142.2 130 142 Q 134.5 142.2 139 140"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Sombra de labio inferior y destello sutil */}
          <ellipse cx="130" cy="144.5" rx="2.5" ry="1" fill="#fb7185" opacity="0.3" />
          <path
            d="M 128.8 146.8 Q 130 147.4 131.2 146.8"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
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

/* Gotita de sudor anime para Pensando / Dudando (Anime Sweatdrop en la sien) */
function AnimeSweatdrop() {
  return (
    <g className={styles.sweatdropGroup} transform="translate(196 44)">
      <path
        d="M 0 -11 C -4 -4, -6 0, -6 4 C -6 9, -2 13, 2 13 C 6 13, 10 9, 10 4 C 10 0, 8 -4, 0 -11 Z"
        fill="url(#anime-sweat-grad)"
        stroke="rgba(125, 211, 252, 0.85)"
        strokeWidth="1.2"
        className={styles.sweatdropBody}
      />
      <ellipse cx="3" cy="5" rx="1.5" ry="2.4" fill="#ffffff" opacity="0.85" transform="rotate(-20 3 5)" />
    </g>
  );
}

/* Burbuja nasal de respiración anime al dormir centrada en la nariz */
function AnimeSleepBubble() {
  return (
    <g className={styles.sleepBubbleGroup} transform="translate(136 112)">
      <circle cx="0" cy="0" r="9" fill="url(#anime-bubble-grad)" stroke="rgba(196, 181, 253, 0.7)" strokeWidth="1.2" />
      <ellipse cx="-2.5" cy="-3" rx="2.5" ry="1.5" fill="#ffffff" opacity="0.85" transform="rotate(-25 -2.5 -3)" />
    </g>
  );
}

export default function Face({
  expression,
  pointer,
  mouthLevel,
  pokeCount = 0,
  pokeMessage = null,
  onFaceClick,
  interactive = true,
}: FaceProps) {
  const isSleeping = expression === "sleeping";
  const isJoy = expression === "joy";
  const isAnnoyed = expression === "annoyed" || expression === "anger" || pokeCount >= 4;

  const [localPointer, setLocalPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [saccade, setSaccade] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Motor biológico 1: Sacadas oculares autónomas estocásticas (evita la mirada muerta)
  useEffect(() => {
    if (isSleeping) return;
    let timerId: number;
    function scheduleSaccade() {
      const delay = 1900 + Math.random() * 2400;
      timerId = window.setTimeout(() => {
        // Desplazamiento sutil de 1 a 2.5px
        const sx = (Math.random() - 0.5) * 4.4;
        const sy = (Math.random() - 0.5) * 2.8;
        setSaccade({ x: sx, y: sy });

        const holdTime = 300 + Math.random() * 320;
        window.setTimeout(() => {
          setSaccade({ x: 0, y: 0 });
          scheduleSaccade();
        }, holdTime);
      }, delay);
    }
    scheduleSaccade();
    return () => window.clearTimeout(timerId);
  }, [isSleeping]);

  // Motor biológico 2: Parpadeo estocástico natural (con probabilidad de doble parpadeo)
  useEffect(() => {
    if (isSleeping) return;
    let blinkTimer: number;
    function scheduleBlink() {
      const baseDelay = expression === "thinking" ? 2200 : expression === "joy" ? 2400 : 3600;
      const delay = Math.max(1400, baseDelay + (Math.random() - 0.5) * 1800);

      blinkTimer = window.setTimeout(() => {
        setIsBlinking(true);

        window.setTimeout(() => {
          setIsBlinking(false);

          // 18% probabilidad de doble parpadeo anime
          if (Math.random() < 0.18) {
            window.setTimeout(() => {
              setIsBlinking(true);
              window.setTimeout(() => {
                setIsBlinking(false);
                scheduleBlink();
              }, 95);
            }, 120);
          } else {
            scheduleBlink();
          }
        }, 115);
      }, delay);
    }
    scheduleBlink();
    return () => window.clearTimeout(blinkTimer);
  }, [isSleeping, expression]);

  useEffect(() => {
    if (!interactive || isSleeping) return;
    let animId = 0;
    function updateCoords(clientX: number, clientY: number) {
      const px = Math.max(-1, Math.min(1, (clientX - window.innerWidth / 2) / (window.innerWidth / 2)));
      const py = Math.max(-1, Math.min(1, (clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        setLocalPointer({ x: px, y: py });
      });
    }

    function onPointerMove(e: PointerEvent) {
      updateCoords(e.clientX, e.clientY);
    }

    function onTouch(e: TouchEvent) {
      if (e.touches && e.touches.length > 0) {
        updateCoords(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [interactive, isSleeping]);

  const activePointer = pointer ?? localPointer;

  // Seguimiento suave del puntero + sacadas biológicas
  const gazeX = isSleeping ? 0 : expression === "thinking" ? 3.5 : activePointer.x * 9.5 + saccade.x;
  const gazeY = isSleeping ? 2 : expression === "thinking" ? -3.5 : activePointer.y * 6 + saccade.y;

  // Inclinación 3D sutil hacia el mouse
  const tiltX = (activePointer.y * -6).toFixed(2);
  const tiltY = (activePointer.x * 8).toFixed(2);

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

          {/* Gradientes anatómicos anime para cavidad bucal, dientes y lengua */}
          <linearGradient id="anime-mouth-cavity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#350410" />
            <stop offset="100%" stopColor="#5c0b20" />
          </linearGradient>

          <linearGradient id="anime-mouth-cavity-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#250309" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="anime-tongue-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff758f" />
            <stop offset="50%" stopColor="#ff4d6d" />
            <stop offset="100%" stopColor="#c9184a" />
          </linearGradient>

          <linearGradient id="anime-teeth-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Gradiente para gota de sudor anime */}
          <linearGradient id="anime-sweat-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
          </linearGradient>

          {/* Gradiente para burbuja de respiración anime */}
          <radialGradient id="anime-bubble-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#818cf8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Capa de expresión con interpolación fluida entre emociones */}
        <g className={styles.faceElements}>
          {/* Cejas Anime con transición fluida */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.g
              key={expression}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimeBrows expression={expression} />
            </motion.g>
          </AnimatePresence>

          {/* Marca de enojo anime cuando se molesta o enojo */}
          <AnimatePresence>
            {isAnnoyed && (
              <motion.g
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <AnimeAngerVein />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Gotita de sudor anime al pensar */}
          <AnimatePresence>
            {expression === "thinking" && (
              <motion.g
                initial={{ scale: 0.3, y: -6, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.3, y: 6, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <AnimeSweatdrop />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Burbuja de respiración y Zzz al dormir */}
          <AnimatePresence>
            {isSleeping && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <AnimeSleepBubble />
                <AnimeZzz />
              </motion.g>
            )}
          </AnimatePresence>

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

          {/* Ojos Izquierdo y Derecho con parpadeo estocástico y transiciones */}
          {isSleeping || isBlinking ? (
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
          <AnimatePresence>
            {expression === "sad" && (
              <motion.g
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.32 }}
              >
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
              </motion.g>
            )}
          </AnimatePresence>

          {/* Boca Anime con transición suave entre emociones */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.g
              key={expression}
              initial={{ opacity: 0, scale: 0.93, y: 1.5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -1.5 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimeMouth expression={expression} />
            </motion.g>
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
}
