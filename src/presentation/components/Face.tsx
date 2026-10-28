import styles from "./Face.module.css";

export type Mood = "idle" | "listening" | "thinking" | "speaking";

interface FaceProps {
  mood: Mood;
  size?: number;
}

export default function Face({ mood, size = 320 }: FaceProps) {
  return (
    <svg
      className={styles.face}
      data-mood={mood}
      width={size}
      height={Math.round(size * 0.55)}
      viewBox="0 0 240 132"
      role="img"
      aria-label={`AVI — ${mood}`}
    >
      <g className={styles.eyeGroup}>
        <ellipse className={styles.eye} cx="70" cy="56" rx="16" ry="19" />
        <circle className={styles.pupil} cx="70" cy="56" r="6" />
      </g>
      <g className={styles.eyeGroup}>
        <ellipse className={styles.eye} cx="170" cy="56" rx="16" ry="19" />
        <circle className={styles.pupil} cx="170" cy="56" r="6" />
      </g>
      {mood === "speaking" ? (
        <ellipse className={styles.mouthOpen} cx="120" cy="102" rx="20" ry="9" />
      ) : (
        <path className={styles.mouth} d="M 94 100 Q 120 109 146 100" />
      )}
    </svg>
  );
}
