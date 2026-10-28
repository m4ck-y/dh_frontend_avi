import type { ReactNode } from "react";
import styles from "./Face.module.css";

export type Mood = "idle" | "listening" | "thinking" | "speaking";
export type Emotion = "joy" | "anger" | "sad" | "surprise";
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
];

/* Paleta de gradientes y brillos por emoción */
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
  sad: {
    irisTop: "#111827",
    irisMid: "#3b82f6",
    irisBot: "#60a5fa",
    irisRim: "#bfdbfe",
    stroke: "#74a7ff",
    blush: "rgba(116, 167, 255, 0.4)",
  },
};

/* Ojo Anime Abierto (Izquierdo, centrado aprox en X=80, Y=86) */
function AnimeOpenEye({
  expression,
  gazeX = 0,
  gazeY = 0,
  pupilScale = 1,
  narrow = false,
}: {
  expression: Expression;
  gazeX?: number;
  gazeY?: number;
  pupilScale?: number;
  narrow?: boolean;
}) {
  const isSurprise = expression === "surprise";
  const isSad = expression === "sad";

  return (
    <g className={styles.eyeInner}>
      {/* Pliegue del párpado superior */}
      <path
        d={narrow ? "M 62 64 Q 80 59 98 64" : "M 60 60 Q 80 54 99 60"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Iris con máscara ovalada para que no sobresalga del párpado */}
      <g className={styles.irisContainer}>
        {/* Base del Iris con gradiente anime */}
        <ellipse
          cx={80 + gazeX}
          cy={86 + gazeY}
          rx={isSurprise ? 17 : 15}
          ry={narrow ? 16 : isSurprise ? 21 : 19}
          fill={`url(#iris-grad-${expression})`}
        />

        {/* Zona sombreada superior del iris (profundidad manga) */}
        <path
          d={`M ${65 + gazeX} ${82 + gazeY} Q ${80 + gazeX} ${90 + gazeY} ${95 + gazeX} ${82 + gazeY} L ${95 + gazeX} ${67 + gazeY} Q ${80 + gazeX} ${65 + gazeY} ${65 + gazeX} ${67 + gazeY} Z`}
          fill="#020617"
          opacity="0.68"
        />

        {/* Pupila vertical */}
        <ellipse
          cx={80 + gazeX}
          cy={84 + gazeY}
          rx={6 * pupilScale}
          ry={(narrow ? 8 : 10) * pupilScale}
          fill="#020617"
        />

        {/* Reflejo semicircular inferior brillante (resplandor de cristal del iris) */}
        <path
          d={`M ${68 + gazeX} ${89 + gazeY} Q ${80 + gazeX} ${103 + gazeY} ${92 + gazeX} ${89 + gazeY} Q ${80 + gazeX} ${95 + gazeY} ${68 + gazeX} ${89 + gazeY} Z`}
          fill={`url(#iris-rim-${expression})`}
          opacity="0.85"
        />

        {/* Brillos de luz especular Anime (Catchlights) */}
        {/* 1. Brillo principal grande (oval inclinado arriba a la izquierda) */}
        <ellipse
          cx={74 + gazeX}
          cy={77 + gazeY}
          rx={isSurprise ? 5 : 4.5}
          ry={isSurprise ? 6.5 : 6}
          transform={`rotate(-18 ${74 + gazeX} ${77 + gazeY})`}
          fill="#ffffff"
        />
        {/* 2. Brillo secundario inferior derecho */}
        <circle
          cx={87 + gazeX}
          cy={91 + gazeY}
          r={isSurprise ? 2.8 : 2.4}
          fill="#ffffff"
          opacity="0.9"
        />
        {/* 3. Micro destello estelar lateral */}
        <circle
          cx={85 + gazeX}
          cy={76 + gazeY}
          r="1.4"
          fill="#ffffff"
          opacity="0.8"
        />

        {/* Destellos extra para sorpresa */}
        {isSurprise && (
          <circle
            cx={75 + gazeX}
            cy={92 + gazeY}
            r="1.8"
            fill="#ffffff"
            opacity="0.85"
          />
        )}
      </g>

      {/* Pestaña superior Anime con grosor cónico y ala lateral (Wing lash) */}
      <path
        d={
          narrow
            ? "M 48 72 C 58 64, 78 63, 108 72 C 96 66, 76 65, 56 73 Z"
            : "M 46 70 C 58 58, 80 56, 108 70 C 96 62, 76 60, 54 72 Z"
        }
        fill="currentColor"
      />
      {/* Punta afilada del ala externa anime */}
      <polygon
        points={narrow ? "48,72 40,68 52,70" : "46,70 38,65 50,68"}
        fill="currentColor"
      />
      {/* Segundo mechón de pestaña estilizada */}
      <path
        d={narrow ? "M 44 71 L 39 67" : "M 42 69 L 36 64"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Pestaña inferior delicada con pequeñas marcas de máscara de pestañas */}
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

      {/* Lágrima acuosa brillante en los ojos tristes */}
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

/* Ojos cerrados de sonrisa feliz (Joy / Alegría - Arco estilo manga) */
function AnimeJoyEye() {
  return (
    <g className={styles.eyeInner}>
      {/* Pestaña superior curva cerrada gruesa con doble ala externa */}
      <path
        d="M 46 82 C 60 56, 88 56, 108 80 C 94 65, 68 65, 54 84 Z"
        fill="currentColor"
      />
      {/* Alas laterales de la sonrisa */}
      <path
        d="M 48 83 Q 41 78 38 82 M 45 87 L 39 90"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Pliegue inferior de la mejilla al sonreír */}
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

/* Ojo guiñado / pensando asimétrico */
function AnimeThinkingEyeR() {
  return (
    <g className={styles.eyeInner}>
      <path
        d="M 152 74 C 166 65, 186 65, 206 74 C 194 68, 174 68, 158 75 Z"
        fill="currentColor"
      />
      <polygon points="206,74 214,70 202,72" fill="currentColor" />
      {/* Iris ligeramente más entrecerrado mirando arriba */}
      <ellipse
        cx={178}
        cy={82}
        rx={13}
        ry={14}
        fill="url(#iris-grad-thinking)"
      />
      <ellipse cx={178} cy={80} rx={5} ry={7} fill="#020617" />
      <ellipse cx={173} cy={76} rx={3.5} ry={4.5} fill="#ffffff" />
      <circle cx={183} cy={86} r="2" fill="#ffffff" opacity="0.9" />
      <path
        d="M 164 96 Q 178 99 192 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

/* Espejado horizontal con respecto al centro X=130 */
function Mirror({ children }: { children: ReactNode }) {
  return <g transform="translate(260 0) scale(-1 1)">{children}</g>;
}

/* Cejas anime expresivas */
const BROWS: Record<Expression, ReactNode> = {
  idle: (
    <>
      <path d="M 54 52 Q 78 44 104 50" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 156 50 Q 182 44 206 52" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  joy: (
    <>
      {/* Cejas arqueadas altas y relajadas por felicidad */}
      <path d="M 52 46 Q 78 34 104 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 156 44 Q 182 34 208 46" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </>
  ),
  listening: (
    <>
      {/* Inquisitiva, atenta */}
      <path d="M 54 48 Q 78 39 104 46" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 156 46 Q 182 39 206 48" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  thinking: (
    <>
      {/* Asimétrica clásica anime: una levantada y otra ligeramente fruncida */}
      <path d="M 52 44 Q 78 36 104 44" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 156 53 Q 182 49 208 55" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </>
  ),
  speaking: (
    <>
      <path d="M 54 49 Q 78 41 104 48" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 156 48 Q 182 41 206 49" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  surprise: (
    <>
      {/* Cejas muy levantadas por el asombro */}
      <path d="M 54 36 Q 78 26 104 35" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 156 35 Q 182 26 206 36" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </>
  ),
  anger: (
    <>
      {/* Cejas en V agresiva / decidida */}
      <path d="M 52 42 Q 78 48 106 62" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 154 62 Q 182 48 208 42" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Pequeño frunce central entrecejo */}
      <path d="M 127 58 L 130 63 L 133 58" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  sad: (
    <>
      {/* Cejas preocupadas / acongojadas inclinadas hacia el centro (hachiji) */}
      <path d="M 54 58 Q 80 54 104 42" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 156 42 Q 180 54 206 58" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </>
  ),
};

/* Bocas anime expresivas */
const MOUTHS: Record<Expression, ReactNode> = {
  idle: (
    <g>
      {/* Sonrisa sutil anime con pequeño pliegue de labio inferior */}
      <path d="M 121 138 Q 130 144 139 138" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M 128 145 Q 130 146 132 145" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  joy: (
    <g>
      {/* Boca abierta radiante estilo D anime con lengua y dientes */}
      <path
        d="M 114 133 Q 130 133 146 133 Q 146 153 130 155 Q 114 153 114 133 Z"
        fill="#3b0814"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Dientes superiores */}
      <path d="M 117 134 Q 130 134 143 134 Q 141 138 130 138 Q 119 138 117 134 Z" fill="#ffffff" />
      {/* Lengua rosada brillante */}
      <ellipse cx="130" cy="150" rx="9" ry="5.5" fill="#fb7185" />
    </g>
  ),
  listening: (
    <g className={styles.mouthOoh}>
      {/* Pequeña boca en "o" atenta */}
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
  ),
  thinking: (
    <g>
      {/* Sonrisita pensativa de lado */}
      <path
        d="M 119 141 Q 128 136 141 140"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M 132 146 Q 134 147 136 146" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.45" />
    </g>
  ),
  speaking: (
    <g className={styles.mouthTalk}>
      {/* Boca animada hablando */}
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
  ),
  surprise: (
    <g>
      {/* Boca redondeada abierta de sorpresa */}
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
  ),
  anger: (
    <g>
      {/* Boca gritando / enérgica decidida */}
      <path
        d="M 115 137 Q 130 133 145 137 Q 142 154 130 152 Q 118 154 115 137 Z"
        fill="#3b0808"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Dientes apretados */}
      <path d="M 117 137 L 143 137 Q 140 142 130 142 Q 120 142 117 137 Z" fill="#ffffff" />
      <path d="M 119 152 L 141 152 Q 138 147 130 147 Q 122 147 119 152 Z" fill="#ffffff" opacity="0.9" />
    </g>
  ),
  sad: (
    <g className={styles.mouthSad}>
      {/* Boca temblorosa hacia abajo con labio vacilante */}
      <path
        d="M 116 142 Q 130 136 144 142 Q 140 152 130 151 Q 120 152 116 142 Z"
        fill="#111827"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M 120 142 Q 130 140 140 142" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
    </g>
  ),
};

/* Marcas de sonrojo anime (Blush ///) */
function AnimeBlush({ expression }: { expression: Expression }) {
  const isJoy = expression === "joy";
  const isSpeaking = expression === "speaking" || expression === "listening";
  const isSad = expression === "sad";
  const isThinking = expression === "thinking";
  const isAnger = expression === "anger";

  const opacity = isJoy ? 0.85 : isAnger ? 0.6 : isSad ? 0.55 : isSpeaking ? 0.4 : isThinking ? 0.35 : 0.25;

  return (
    <g className={styles.blushGroup} opacity={opacity}>
      {/* Mejilla izquierda */}
      <g transform="translate(54 104)">
        <line x1="0" y1="8" x2="6" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="8" x2="11" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="8" x2="16" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="8" cy="4" rx="12" ry="6" fill={`url(#blush-radial-${expression})`} />
      </g>
      {/* Mejilla derecha */}
      <g transform="translate(190 104)">
        <line x1="0" y1="8" x2="6" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="8" x2="11" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="8" x2="16" y2="0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="8" cy="4" rx="12" ry="6" fill={`url(#blush-radial-${expression})`} />
      </g>
    </g>
  );
}

export default function Face({ expression }: { expression: Expression }) {
  const palette = PALETTES[expression];

  return (
    <svg
      viewBox="0 0 260 180"
      className={styles.face}
      data-expression={expression}
      role="img"
      aria-label={`AVI — Expresión ${expression}`}
      fill="none"
      stroke="currentColor"
    >
      <defs>
        {/* Generar gradientes para todas las expresiones para transiciones fluidas */}
        {EXPRESSIONS.map((exp) => {
          const pal = PALETTES[exp];
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
                <stop offset="0%" stopColor={pal.stroke} stopOpacity="0.35" />
                <stop offset="100%" stopColor={pal.stroke} stopOpacity="0" />
              </radialGradient>
            </g>
          );
        })}
      </defs>

      <g key={expression} className={styles.pop}>
        {/* Cejas Anime */}
        <g className={styles.brows}>{BROWS[expression]}</g>

        {/* Sonrojo Anime */}
        <AnimeBlush expression={expression} />

        {/* Nariz anime minimalista (delicada sombra sutil) */}
        <path
          d="M 130 114 L 128 118"
          stroke={palette.stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Ojos Izquierdo y Derecho */}
        {expression === "joy" ? (
          <>
            <g className={styles.eyeL}>
              <AnimeJoyEye />
            </g>
            <g className={styles.eyeR}>
              <Mirror>
                <AnimeJoyEye />
              </Mirror>
            </g>
          </>
        ) : expression === "thinking" ? (
          <>
            <g className={styles.eyeL}>
              <AnimeOpenEye expression="thinking" gazeX={2} gazeY={-3} narrow={true} />
            </g>
            <g className={styles.eyeR}>
              <AnimeThinkingEyeR />
            </g>
          </>
        ) : expression === "surprise" ? (
          <>
            <g className={styles.eyeL}>
              <AnimeOpenEye expression="surprise" pupilScale={0.8} />
            </g>
            <g className={styles.eyeR}>
              <Mirror>
                <AnimeOpenEye expression="surprise" pupilScale={0.8} />
              </Mirror>
            </g>
          </>
        ) : expression === "anger" ? (
          <>
            <g className={styles.eyeL}>
              <AnimeOpenEye expression="anger" narrow={true} gazeY={1} />
            </g>
            <g className={styles.eyeR}>
              <Mirror>
                <AnimeOpenEye expression="anger" narrow={true} gazeY={1} />
              </Mirror>
            </g>
          </>
        ) : (
          <>
            <g className={styles.eyeL}>
              <AnimeOpenEye expression={expression} />
            </g>
            <g className={styles.eyeR}>
              <Mirror>
                <AnimeOpenEye expression={expression} />
              </Mirror>
            </g>
          </>
        )}

        {/* Lágrimas animadas para Tristeza (Sad) */}
        {expression === "sad" && (
          <g className={styles.tearsStream}>
            {/* Lágrima izquierda fluyendo */}
            <path
              className={styles.tearL}
              d="M 64 98 C 60 110, 58 124, 62 136 C 66 142, 60 148, 58 152"
              stroke="#93c5fd"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx="62" cy="136" r="2.8" fill="#ffffff" className={styles.tearDropL} />

            {/* Lágrima derecha fluyendo */}
            <path
              className={styles.tearR}
              d="M 196 98 C 200 110, 202 124, 198 136 C 194 142, 200 148, 202 152"
              stroke="#93c5fd"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx="198" cy="136" r="2.8" fill="#ffffff" className={styles.tearDropR} />
          </g>
        )}

        {/* Boca Anime */}
        <g className={styles.mouth}>{MOUTHS[expression]}</g>
      </g>
    </svg>
  );
}
