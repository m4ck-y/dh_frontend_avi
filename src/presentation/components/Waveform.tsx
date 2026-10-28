import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Mood } from "./Face";
import styles from "./Waveform.module.css";

const BARS = 48;

/* Historial inicial plano: sin mic, la animación CSS manda por mood */
const INIT = Array.from({ length: BARS }, () => 0.2);

export type MicState = "off" | "live" | "denied";

export default function Waveform({ mood, micOn }: { mood: Mood; micOn: boolean }) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [micState, setMicState] = useState<MicState>("off");
  const raf = useRef(0);

  useEffect(() => {
    if (!micOn) {
      setMicState("off");
      return;
    }
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        if (!cancelled) setMicState("denied");
        return;
      }
      if (cancelled) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      setMicState("live");

      // oscilograma: historial deslizante, lo más nuevo a la derecha
      const hist = new Float32Array(BARS);
      let frame = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128) / 128;
          if (v > peak) peak = v;
        }
        // gamma baja + ganancia: amplifica los susurros para que se note lo pequeño
        const level = Math.min(1, Math.pow(peak, 0.5) * 2);
        // cada 2 frames (~30 fps): 48 barras ≈ 1.6 s de ventana
        if (++frame % 2 === 0) {
          hist.copyWithin(0, 1);
          hist[BARS - 1] = level;
          for (let i = 0; i < BARS; i++) {
            const el = barRefs.current[i];
            if (!el) continue;
            // ×7.5 sobre barras de 6px: silencio ≈2px, grito ≈46px
            el.style.transform = `scaleY(${(0.25 + hist[i] * 7.5).toFixed(2)})`;
            el.style.opacity = (0.35 + hist[i] * 0.65).toFixed(2);
          }
        }
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
    };
  }, [micOn]);

  return (
    <div
      className={`${styles.wave} ${micState === "live" ? styles.live : ""}`}
      data-mood={mood}
      data-mic={micState}
      aria-hidden="true"
    >
      {INIT.map((h, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          style={{ "--i": i, "--h": h } as CSSProperties}
        />
      ))}
      {micState === "denied" && (
        <span className={styles.denied}>micrófono sin permiso — onda simulada</span>
      )}
    </div>
  );
}
