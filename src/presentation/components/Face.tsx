"use client";

import React, { useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
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
  gazeX: MotionValue<number>;
  gazeY: MotionValue<number>;
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
      <motion.g
        className={styles.irisGroup}
        style={{ x: gazeX, y: gazeY }}
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
      </motion.g>

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

/* Bocas anime expresivas y finas con anatomía manga */
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
    case "joy":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthJoy}`}>
          {/* Cavidad bucal anime clásica en forma de frijol/medialuna con contorno fino */}
          <path
            d="M 116 136 Q 130 137.8 144 136 C 144.5 149.5, 138.5 157, 130 157 C 121.5 157, 115.5 149.5, 116 136 Z"
            fill="url(#anime-mouth-cavity)"
            stroke="#5c0b20"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Dientes superiores con línea curva limpia */}
          <path
            d="M 117 136.4 Q 130 138.2 143 136.4 C 140 140.2, 135 141, 130 141 C 125 141, 120 140.2, 117 136.4 Z"
            fill="url(#anime-teeth-grad)"
          />
          {/* Lengua anime suave rosada */}
          <path
            d="M 121 152 C 122 146, 125.5 144, 130 144 C 134.5 144, 138 146, 139 152 C 136.5 156, 133 157, 130 157 C 127 157, 123.5 156, 121 152 Z"
            fill="url(#anime-tongue-grad)"
          />
          {/* Brillo especular anime en la comisura */}
          <ellipse cx="140" cy="138.5" rx="1.4" ry="0.9" fill="#ffffff" opacity="0.8" />
        </g>
      );
    case "speaking":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthTalk}`}>
          {/* Boca parlante anime modulada y fina con visemas */}
          <path
            d="M 117 136 Q 130 134.5 143 136 C 143.5 148.5, 138 154.5, 130 154.5 C 122 154.5, 116.5 148.5, 117 136 Z"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Arco de dientes superiores */}
          <path
            d="M 118 136.4 Q 130 135 142 136.4 C 139 139.6, 135 140.4, 130 140.4 C 125 140.4, 121 139.6, 118 136.4 Z"
            fill="url(#anime-teeth-grad)"
          />
          {/* Lengua modulando fonemas */}
          <path
            d="M 122 151 C 123 146, 126 144.2, 130 144.2 C 134 144.2, 137 146, 138 151 C 135.5 153.6, 133 154.5, 130 154.5 C 127 154.5, 124.5 153.6, 122 151 Z"
            fill="url(#anime-tongue-grad)"
          />
          {/* Resalte sutil de labio inferior */}
          <path
            d="M 128.8 157.5 Q 130 158 131.2 157.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      );
    case "listening":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthOoh}`}>
          {/* Pequeña boca atenta 'o' estilo anime */}
          <path
            d="M 126 138.5 Q 130 136 134 138.5 C 135.5 143.5, 134.5 148, 130 148 C 125.5 148, 124.5 143.5, 126 138.5 Z"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Pequeño diente visible */}
          <path
            d="M 127.5 138.8 Q 130 137.2 132.5 138.8 C 132 140.8, 131 141.2, 130 141.2 C 129 141.2, 128 140.8, 127.5 138.8 Z"
            fill="#ffffff"
          />
          {/* Pequeña lengua rosada */}
          <ellipse cx="130" cy="146" rx="2.8" ry="1.7" fill="url(#anime-tongue-grad)" />
        </g>
      );
    case "thinking":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthThinking}`}>
          {/* Boca anime pensativa / pouting con asimetría sutil */}
          <path
            d="M 122 140.5 Q 126.5 138.5 131 141 Q 135 142 138.5 140"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="129.5" cy="143.8" rx="2.4" ry="1" fill="#fb7185" opacity="0.32" />
          <path
            d="M 129 146.5 Q 130.5 147 132 146.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
        </g>
      );
    case "surprise":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthSurprise}`}>
          {/* Boca vertical ovalada anime con dientes y lengua */}
          <ellipse
            cx="130"
            cy="143"
            rx="8"
            ry="11.5"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          {/* Asomo de diente superior */}
          <path
            d="M 124 135 Q 130 133 136 135 C 134 137.5, 132 138.2, 130 138.2 C 128 138.2, 126 137.5, 124 135 Z"
            fill="#ffffff"
          />
          {/* Fondo de lengua rosada */}
          <ellipse cx="130" cy="150" rx="5.2" ry="3.6" fill="url(#anime-tongue-grad)" />
          {/* Brillo especular */}
          <circle cx="134" cy="139" r="1.2" fill="#ffffff" opacity="0.8" />
        </g>
      );
    case "anger":
    case "annoyed":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthAnger}`}>
          {/* Boca anime de enojo con colmillo afilado (yaeba) característico */}
          <path
            d="M 116 138 Q 123 135 130 135.5 Q 137 135 144 138 C 143 149.5, 138 154.5, 130 154 C 122 154.5, 117 149.5, 116 138 Z"
            fill="url(#anime-mouth-cavity-dark)"
            stroke="#7f1d1d"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          {/* Dientes superiores con colmillo afilado a la derecha (yaeba) */}
          <path
            d="M 117 138.2 L 136.5 136 L 138.8 141.2 L 141 136.4 L 143 138.2 C 140 140.6, 135 140.8, 130 140.8 C 125 140.8, 120 140.2, 117 138.2 Z"
            fill="#ffffff"
          />
          {/* Dientes inferiores con línea fina */}
          <path
            d="M 119 152.2 Q 130 149.4 141 152.2 C 138 154, 130 154, 119 152.2 Z"
            fill="#ffffff"
            opacity="0.9"
          />
          {/* Lengua de fondo tenso */}
          <ellipse cx="130" cy="147.5" rx="7.2" ry="4" fill="#f43f5e" />
        </g>
      );
    case "sad":
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthSad}`}>
          {/* Boca temblorosa anime con labio ondulante hacia abajo */}
          <path
            d="M 117 142.5 C 121 138, 125 140, 130 139 C 135 140, 139 138, 143 142.5 C 141 151, 136 153.5, 130 153 C 124 153.5, 119 151, 117 142.5 Z"
            fill="url(#anime-mouth-cavity)"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Dientes superiores temblando */}
          <path
            d="M 119 142 Q 130 140.2 141 142 C 138 144, 134 144.5, 130 144.5 C 126 144.5, 122 144, 119 142 Z"
            fill="#ffffff"
            opacity="0.9"
          />
          {/* Lengua triste */}
          <ellipse cx="130" cy="149" rx="6.5" ry="3.2" fill="url(#anime-tongue-grad)" opacity="0.85" />
        </g>
      );
    default:
      return (
        <g className={`${styles.mouthWrapper} ${styles.mouthIdle}`}>
          {/* Labio superior fino con curvatura anime delicada */}
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

export default function Face({
  expression,
  pokeCount = 0,
  pokeMessage = null,
  onFaceClick,
  interactive = true,
}: FaceProps) {
  const isSleeping = expression === "sleeping";
  const isJoy = expression === "joy";
  const isAnnoyed = expression === "annoyed" || expression === "anger" || pokeCount >= 4;

  // Motion values para el seguimiento del puntero (imperativo, sin re-render de React)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  useEffect(() => {
    if (!interactive || isSleeping) return;
    let animId = 0;
    function updateCoords(clientX: number, clientY: number) {
      const px = Math.max(-1, Math.min(1, (clientX - window.innerWidth / 2) / (window.innerWidth / 2)));
      const py = Math.max(-1, Math.min(1, (clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        pointerX.set(px);
        pointerY.set(py);
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

  // Springs suaves: el ojo persigue al puntero con inercia (sin re-render)
  const spring = { stiffness: 120, damping: 20, mass: 0.6 };
  const sx = useSpring(pointerX, spring);
  const sy = useSpring(pointerY, spring);

  const gazeX = useTransform(sx, (v) => (isSleeping ? 0 : expression === "thinking" ? 3.5 : v * 9.5));
  const gazeY = useTransform(sy, (v) => (isSleeping ? 2 : expression === "thinking" ? -3.5 : v * 6));
  const gazeXNeg = useTransform(gazeX, (v) => -v);
  const tiltX = useTransform(sy, (v) => v * -6);
  const tiltY = useTransform(sx, (v) => v * 8);

  const palette = PALETTES[expression] || PALETTES.idle;

  return (
    <motion.div
      className={`${styles.faceWrapper} ${isAnnoyed ? styles.shaking : ""}`}
      style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 700 }}
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
        </defs>

        {/* Capa de expresión con interpolación fluida entre emociones */}
        <g className={styles.faceElements}>
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
                    gazeX={gazeXNeg}
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
    </motion.div>
  );
}
