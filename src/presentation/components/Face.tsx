import type { ReactNode } from "react";
import styles from "./Face.module.css";

export type Mood = "idle" | "listening" | "thinking" | "speaking";
export type Emotion = "joy" | "anger" | "sad" | "surprise";
export type Expression = Mood | Emotion;

/* Orden del ciclo del botón "Probar expresiones" */
export const EXPRESSIONS: Expression[] = [
  "joy",
  "surprise",
  "anger",
  "sad",
  "listening",
  "thinking",
  "speaking",
  "idle",
];

/* Ojos en coordenadas del ojo izquierdo (centro ~85,70); el derecho se espeja. */

function OpenEye({ iris = 10, cy = 72 }: { iris?: number; cy?: number }) {
  return (
    <>
      <path d="M64 62 Q85 48 106 62" strokeWidth="5" />
      <g className={styles.pupil}>
        <circle cx="85" cy={cy} r={iris} strokeWidth="3" />
        <circle cx="81" cy={cy - 4} r="2.6" fill="currentColor" stroke="none" />
      </g>
      <path d="M72 84 Q85 89 98 84" strokeWidth="2" opacity="0.45" />
    </>
  );
}

function RoundEye() {
  return (
    <>
      <path d="M63 58 Q85 42 107 58" strokeWidth="5" />
      <g className={styles.pupil}>
        <circle cx="85" cy="72" r="13" strokeWidth="3" />
        <circle cx="80" cy="66" r="2.8" fill="currentColor" stroke="none" />
      </g>
    </>
  );
}

/* Ojo derecho a media asta, solo para thinking (asimetría anime) */
const HALF_EYE = (
  <>
    <path d="M134 64 Q155 58 176 64" strokeWidth="5" />
    <circle cx="155" cy="68" r="8" strokeWidth="3" />
    <path d="M136 72 Q155 78 174 72" strokeWidth="3" />
  </>
);

function Mirror({ children }: { children: ReactNode }) {
  return <g transform="translate(240 0) scale(-1 1)">{children}</g>;
}

const EYES: Record<Expression, ReactNode> = {
  idle: <OpenEye />,
  joy: <path d="M64 76 Q85 54 106 76" strokeWidth="5" />,
  anger: (
    <>
      <path d="M64 64 Q85 58 106 70" strokeWidth="5" />
      <circle cx="85" cy="75" r="6" strokeWidth="3" />
      <path d="M70 82 Q85 86 100 82" strokeWidth="2" opacity="0.5" />
    </>
  ),
  sad: (
    <>
      <path d="M64 70 Q85 58 106 66" strokeWidth="5" />
      <circle cx="85" cy="75" r="9" strokeWidth="3" />
      <circle cx="82" cy="71" r="2.4" fill="currentColor" stroke="none" />
      <path d="M72 85 Q85 89 98 85" strokeWidth="2" opacity="0.45" />
    </>
  ),
  surprise: <RoundEye />,
  listening: <OpenEye iris={11} cy={71} />,
  thinking: <OpenEye iris={9} cy={66} />,
  speaking: <OpenEye />,
};

const BROWS: Record<Expression, ReactNode> = {
  idle: (
    <>
      <path d="M62 44 Q84 37 104 43" />
      <path d="M136 43 Q156 37 178 44" />
    </>
  ),
  joy: (
    <>
      <path d="M60 40 Q84 30 104 38" />
      <path d="M136 38 Q156 30 180 40" />
    </>
  ),
  anger: (
    <>
      <path d="M60 44 Q82 42 104 54" />
      <path d="M136 54 Q158 42 180 44" />
    </>
  ),
  sad: (
    <>
      <path d="M60 50 Q82 48 104 40" />
      <path d="M136 40 Q158 48 180 50" />
    </>
  ),
  surprise: (
    <>
      <path d="M62 34 Q84 26 104 33" />
      <path d="M136 33 Q156 26 178 34" />
    </>
  ),
  listening: (
    <>
      <path d="M62 38 Q84 31 104 37" />
      <path d="M136 37 Q156 31 178 38" />
    </>
  ),
  thinking: (
    <>
      <path d="M62 40 Q84 33 104 39" />
      <path d="M136 47 Q156 45 178 49" />
    </>
  ),
  speaking: (
    <>
      <path d="M62 42 Q84 35 104 41" />
      <path d="M136 41 Q156 35 178 42" />
    </>
  ),
};

const MOUTHS: Record<Expression, ReactNode> = {
  idle: <path d="M100 112 Q120 126 140 112" strokeWidth="4" />,
  joy: <path d="M98 106 Q120 136 142 106 Q120 114 98 106 Z" strokeWidth="4" />,
  anger: <path d="M102 122 Q120 108 138 122" strokeWidth="4" />,
  sad: <path d="M108 121 Q120 113 132 121" strokeWidth="4" />,
  surprise: <circle cx="120" cy="116" r="7" strokeWidth="4" />,
  listening: (
    <ellipse className={styles.mouthOoh} cx="120" cy="116" rx="8" ry="9" strokeWidth="4" />
  ),
  thinking: <path d="M104 117 Q112 111 120 117 Q128 123 136 117" strokeWidth="4" />,
  speaking: (
    <ellipse className={styles.mouthTalk} cx="120" cy="116" rx="11" ry="9" strokeWidth="4" />
  ),
};

export default function Face({ expression }: { expression: Expression }) {
  return (
    <svg
      viewBox="0 0 240 160"
      className={styles.face}
      data-expression={expression}
      role="img"
      aria-label={`AVI — ${expression}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g key={expression} className={styles.pop}>
        <g strokeWidth="4">{BROWS[expression]}</g>
        <g className={styles.eyeL}>{EYES[expression]}</g>
        <g className={styles.eyeR}>
          {expression === "thinking" ? HALF_EYE : <Mirror>{EYES[expression]}</Mirror>}
        </g>
        {expression === "sad" && (
          <path
            className={styles.tear}
            d="M64 86 c4 6 4 10 0 13 c-4 -3 -4 -7 0 -13"
            fill="currentColor"
            stroke="none"
          />
        )}
        {MOUTHS[expression]}
      </g>
    </svg>
  );
}
