"use client";

import { useEffect, useRef, useState } from "react";
import type { Mood } from "./Face";
import styles from "./Waveform.module.css";

export type MicState = "off" | "live" | "denied";
export type WaveStyle = "fluid" | "bars" | "orbital";

interface WaveformProps {
  mood: Mood;
  micOn: boolean;
  styleVariant?: WaveStyle;
  onStyleChange?: (style: WaveStyle) => void;
}

export default function Waveform({
  mood,
  micOn,
  styleVariant = "fluid",
  onStyleChange,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const levelTextRef = useRef<HTMLSpanElement | null>(null);
  const [internalStyle, setInternalStyle] = useState<WaveStyle>("fluid");
  const [liveStatus, setLiveStatus] = useState<"off" | "live" | "denied">("off");

  const currentStyle = styleVariant ?? internalStyle;

  const rafRef = useRef<number>(0);
  const smoothedLevelRef = useRef<number>(0.1);
  const phaseRef = useRef<number>(0);

  const switchStyle = (style: WaveStyle) => {
    setInternalStyle(style);
    onStyleChange?.(style);
  };

  const effectiveMicState: MicState = !micOn ? "off" : liveStatus;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let freqData: Uint8Array<ArrayBuffer> | null = null;
    let timeData: Uint8Array<ArrayBuffer> | null = null;
    let cancelled = false;

    // Configurar micrófono si está encendido
    if (micOn) {
      void (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtx = new AudioContextClass();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.78;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          freqData = new Uint8Array(analyser.frequencyBinCount);
          timeData = new Uint8Array(analyser.fftSize);
          setLiveStatus("live");
        } catch {
          if (!cancelled) {
            setLiveStatus("denied");
          }
        }
      })();
    }

    // Configuración de tamaño del canvas respetando Device Pixel Ratio
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Partículas de energía vocal
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];

    // Bucle de renderizado a 60 FPS
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Calcular energía y velocidad según estado
      let targetLevel = 0.12;
      let waveSpeed = 0.035;

      if (micOn && analyser && freqData && timeData) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        // Frecuencias de la voz humana (bins 2 a 32 ~ 150Hz - 3500Hz)
        let sum = 0;
        const binCount = Math.min(36, freqData.length);
        for (let i = 2; i < binCount; i++) {
          sum += freqData[i];
        }
        const avg = sum / (binCount - 2);
        targetLevel = Math.min(1, Math.max(0.08, avg / 120));
        waveSpeed = 0.05 + targetLevel * 0.08;
      } else {
        // Simulación orgánica según mood
        switch (mood) {
          case "listening":
            targetLevel = 0.45 + Math.sin(phaseRef.current * 2) * 0.15;
            waveSpeed = 0.06;
            break;
          case "thinking":
            targetLevel = 0.3 + Math.sin(phaseRef.current * 1.5) * 0.12;
            waveSpeed = 0.04;
            break;
          case "speaking":
            targetLevel = 0.65 + Math.sin(phaseRef.current * 3.5) * 0.25;
            waveSpeed = 0.08;
            break;
          case "sleeping":
            targetLevel = 0.05 + Math.sin(phaseRef.current * 0.4) * 0.03;
            waveSpeed = 0.012;
            break;
          case "idle":
          default:
            targetLevel = 0.14 + Math.sin(phaseRef.current * 0.8) * 0.04;
            waveSpeed = 0.025;
            break;
        }
      }

      // Suavizado cinemático exponencial (Lerp)
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.14;
      phaseRef.current += waveSpeed;

      const level = smoothedLevelRef.current;
      if (levelTextRef.current && micOn) {
        levelTextRef.current.textContent = `Voz activa (${Math.round(level * 100)}%)`;
      }

      const cy = h / 2;

      // ── MODO 1: ONDA FLUIDA AURORA (BÉZIER CONTINUO MULTI-CAPA) ─────────────────
      if (currentStyle === "fluid") {
        // Halo de resplandor ambiental
        const glowGrad = ctx.createRadialGradient(w / 2, cy, 10, w / 2, cy, w * 0.5);
        glowGrad.addColorStop(0, `rgba(45, 212, 191, ${0.12 + level * 0.22})`);
        glowGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.05 + level * 0.15})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // Capas de ondas armónicas entrelazadas
        const layers = [
          {
            color: "rgba(56, 189, 248, 0.75)",
            glow: "rgba(56, 189, 248, 0.8)",
            freq: 1.8,
            speedOffset: 0,
            ampScale: 1.0,
            lineWidth: 2.6,
          },
          {
            color: "rgba(45, 212, 191, 0.9)",
            glow: "rgba(45, 212, 191, 0.9)",
            freq: 2.4,
            speedOffset: 1.2,
            ampScale: 0.85,
            lineWidth: 2.2,
          },
          {
            color: "rgba(192, 132, 252, 0.7)",
            glow: "rgba(192, 132, 252, 0.75)",
            freq: 3.1,
            speedOffset: 2.4,
            ampScale: 0.65,
            lineWidth: 2.0,
          },
        ];

        layers.forEach((layer) => {
          ctx.beginPath();
          ctx.save();
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = layer.lineWidth;
          ctx.shadowColor = layer.glow;
          ctx.shadowBlur = 10 + level * 16;
          ctx.lineCap = "round";

          const step = 8;
          let isFirst = true;

          for (let x = 0; x <= w; x += step) {
            // Ventana Hanning / Gaussiana para atenuar bordes hacia 0
            const normX = x / w;
            const envelope = Math.sin(normX * Math.PI); // 0 en extremos, 1 al centro

            // Modulación de onda con componentes armónicos
            const wave1 = Math.sin(normX * Math.PI * layer.freq * 2 + phaseRef.current + layer.speedOffset);
            const wave2 = Math.cos(normX * Math.PI * 4.2 - phaseRef.current * 0.7);
            const displacement = (wave1 * 0.7 + wave2 * 0.3) * (cy * 0.82) * level * layer.ampScale * envelope;

            const y = cy + displacement;

            if (isFirst) {
              ctx.moveTo(x, y);
              isFirst = false;
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.stroke();
          ctx.restore();
        });

        // Partículas flotantes cuando el nivel sube
        if (level > 0.28 && Math.random() < level * 0.6) {
          particles.push({
            x: w * (0.35 + Math.random() * 0.3),
            y: cy + (Math.random() - 0.5) * cy * level,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.8,
            life: 1.0,
            color: Math.random() > 0.5 ? "rgba(45, 212, 191, 0.9)" : "rgba(192, 132, 252, 0.9)",
            size: 1.5 + Math.random() * 2.5,
          });
        }

        // Renderizar y actualizar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.025;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── MODO 2: ESPECTRO HOLOGRÁFICO ANIME (BARRAS DE CRISTAL DINÁMICAS) ───────────
      else if (currentStyle === "bars") {
        const barCount = 36;
        const totalGap = (barCount - 1) * 3;
        const availableW = Math.min(w * 0.85, 380);
        const barW = Math.max(3, (availableW - totalGap) / barCount);
        const startX = (w - (barCount * barW + totalGap)) / 2;

        for (let i = 0; i < barCount; i++) {
          const normI = i / barCount;
          const envelope = Math.sin(normI * Math.PI); // Campana simétrica

          let barHeight = 4;
          if (micOn && freqData) {
            // Mapeo espectral directo de frecuencias
            const binIdx = Math.floor(normI * (Math.min(48, freqData.length) - 1));
            const val = freqData[binIdx] / 255;
            barHeight = 4 + val * (cy * 1.5) * envelope;
          } else {
            // Animación armónica procedural simétrica
            const wave = Math.sin(normI * Math.PI * 3 + phaseRef.current * 1.8) * 0.5 + 0.5;
            barHeight = 4 + wave * (cy * 1.4) * level * envelope;
          }

          const bx = startX + i * (barW + 3);
          const by = cy - barHeight / 2;

          // Gradiente vertical para cada barra
          const barGrad = ctx.createLinearGradient(bx, by, bx, by + barHeight);
          barGrad.addColorStop(0, "rgba(56, 189, 248, 0.95)");
          barGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.85)");
          barGrad.addColorStop(1, "rgba(168, 85, 247, 0.9)");

          ctx.save();
          ctx.fillStyle = barGrad;
          ctx.shadowColor = "rgba(45, 212, 191, 0.6)";
          ctx.shadowBlur = 6 + level * 8;

          // Dibujar cápsula con esquinas redondeadas
          const radius = barW / 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, barW, Math.max(barHeight, 4), radius);
          ctx.fill();
          ctx.restore();
        }
      }

      // ── MODO 3: ORBE / PULSO RESONANTE (ESTILO CHATGPT / SIRI AURA) ──────────────
      else if (currentStyle === "orbital") {
        const baseRadius = Math.min(w, h) * 0.28;
        const pulse = baseRadius + level * 26 + Math.sin(phaseRef.current * 2) * 4;

        // Anillos concéntricos difusos
        for (let r = 2; r >= 0; r--) {
          const ringRad = pulse + r * 10;
          ctx.save();
          ctx.beginPath();
          ctx.arc(w / 2, cy, ringRad, 0, Math.PI * 2);
          ctx.strokeStyle = r === 0 ? "rgba(45, 212, 191, 0.85)" : r === 1 ? "rgba(56, 189, 248, 0.5)" : "rgba(192, 132, 252, 0.3)";
          ctx.lineWidth = 2.2 - r * 0.5;
          ctx.shadowColor = "rgba(45, 212, 191, 0.8)";
          ctx.shadowBlur = 12 + level * 14;
          ctx.stroke();
          ctx.restore();
        }

        // Punto central de energía
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, cy, 4 + level * 8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#2dd4bf";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      void audioCtx?.close();
    };
  }, [micOn, mood, currentStyle]);

  return (
    <div className={styles.container} aria-label="Visualizador acústico de AVI">
      {/* Visualizador en Canvas de alta definición */}
      <div className={styles.canvasWrapper} data-mood={mood} data-active={effectiveMicState === "live"}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* Barra de metadatos y selector de estilo */}
      <div className={styles.metaRow}>
        <div className={styles.statusBadge} data-state={effectiveMicState}>
          <span className={styles.statusDot} />
          {effectiveMicState === "live" ? (
            <span ref={levelTextRef}>Voz activa</span>
          ) : effectiveMicState === "denied" ? (
            <span>Micrófono sin permiso (simulación)</span>
          ) : (
            <span>Frecuencia base ({mood})</span>
          )}
        </div>

        {/* Selector sutil de estilos interactivo */}
        <div className={styles.styleSelector} role="radiogroup" aria-label="Estilo de visualización">
          <button
            type="button"
            className={`${styles.styleBtn} ${currentStyle === "fluid" ? styles.styleBtnActive : ""}`}
            onClick={() => switchStyle("fluid")}
            title="Onda Fluida Aurora (Líquida continua con resplandor)"
            aria-checked={currentStyle === "fluid"}
            role="radio"
          >
            Aurora
          </button>
          <button
            type="button"
            className={`${styles.styleBtn} ${currentStyle === "bars" ? styles.styleBtnActive : ""}`}
            onClick={() => switchStyle("bars")}
            title="Espectro Holográfico (Barras de cristal anime)"
            aria-checked={currentStyle === "bars"}
            role="radio"
          >
            Espectro
          </button>
          <button
            type="button"
            className={`${styles.styleBtn} ${currentStyle === "orbital" ? styles.styleBtnActive : ""}`}
            onClick={() => switchStyle("orbital")}
            title="Orbe Resonante (Pulso acústico concéntrico)"
            aria-checked={currentStyle === "orbital"}
            role="radio"
          >
            Orbe
          </button>
        </div>
      </div>
    </div>
  );
}
