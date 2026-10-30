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
  showMeta?: boolean;
}

export default function Waveform({
  mood,
  micOn,
  styleVariant = "fluid",
  onStyleChange,
  showMeta = false,
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
          if (audioCtx.state === "suspended") {
            try {
              await audioCtx.resume();
            } catch {
              // ignore
            }
          }
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

    // Partículas y estados reactivos del visualizador
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];
    const peakCaps = new Array(36).fill(4);
    const shockwaves: { radius: number; maxRadius: number; alpha: number; speed: number }[] = [];
    let lastShockwaveTime = 0;

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

      // ── MODO 2: ESPECTRO HOLOGRÁFICO ANIME (MIRRORED EQUALIZER + PEAK CAPS) ────────
      else if (currentStyle === "bars") {
        const barCount = 36;
        const totalGap = (barCount - 1) * 3.5;
        const availableW = Math.min(w * 0.9, 440);
        const barW = Math.max(3.5, (availableW - totalGap) / barCount);
        const startX = (w - (barCount * barW + totalGap)) / 2;

        // Eje central de energía sutil
        const centerLineGrad = ctx.createLinearGradient(startX, cy, startX + availableW, cy);
        centerLineGrad.addColorStop(0, "transparent");
        centerLineGrad.addColorStop(0.2, "rgba(45, 212, 191, 0.4)");
        centerLineGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.8)");
        centerLineGrad.addColorStop(0.8, "rgba(192, 132, 252, 0.4)");
        centerLineGrad.addColorStop(1, "transparent");
        ctx.save();
        ctx.strokeStyle = centerLineGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, cy);
        ctx.lineTo(startX + availableW, cy);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < barCount; i++) {
          const normI = i / (barCount - 1);
          // Campana envolvente para que el centro tenga mayor rango dinámico y los bordes se desvanezcan
          const envelope = Math.pow(Math.sin(normI * Math.PI), 1.3);

          let barHeight = 4;
          if (micOn && freqData) {
            const binIdx = Math.floor(normI * (Math.min(56, freqData.length) - 1));
            const prev = binIdx > 0 ? freqData[binIdx - 1] : freqData[binIdx];
            const next = binIdx < freqData.length - 1 ? freqData[binIdx + 1] : freqData[binIdx];
            const val = ((freqData[binIdx] * 0.6) + (prev * 0.2) + (next * 0.2)) / 255;
            barHeight = 4 + val * (cy * 1.55) * envelope;
          } else {
            const wave1 = Math.sin(normI * Math.PI * 3.2 + phaseRef.current * 2.2);
            const wave2 = Math.cos(normI * Math.PI * 6.4 - phaseRef.current * 1.4);
            const procedural = (wave1 * 0.65 + wave2 * 0.35) * 0.5 + 0.5;
            barHeight = 4 + procedural * (cy * 1.45) * level * envelope;
          }

          // Actualizar posición de la cápsula flotante de pico (Peak Cap)
          if (barHeight > peakCaps[i]) {
            peakCaps[i] = barHeight;
          } else {
            peakCaps[i] = Math.max(barHeight, peakCaps[i] - 0.7);
          }

          const bx = startX + i * (barW + 3.5);
          const halfH = barHeight / 2;
          const peakH = peakCaps[i] / 2;

          ctx.save();
          // Desvanecer alpha en laterales según envolvente
          ctx.globalAlpha = 0.2 + envelope * 0.8;

          // 1. Barra principal superior (hacia arriba)
          const topGrad = ctx.createLinearGradient(bx, cy, bx, cy - halfH);
          topGrad.addColorStop(0, "rgba(45, 212, 191, 0.95)");
          topGrad.addColorStop(0.55, "rgba(56, 189, 248, 0.9)");
          topGrad.addColorStop(1, "rgba(192, 132, 252, 0.95)");

          ctx.fillStyle = topGrad;
          ctx.shadowColor = "rgba(45, 212, 191, 0.7)";
          ctx.shadowBlur = 8 + level * 10;
          ctx.beginPath();
          ctx.roundRect(bx, cy - halfH, barW, halfH, [barW / 2, barW / 2, 0, 0]);
          ctx.fill();

          // 2. Reflejo especular inferior (hacia abajo, más suave y estilizado)
          const botGrad = ctx.createLinearGradient(bx, cy, bx, cy + halfH * 0.65);
          botGrad.addColorStop(0, "rgba(45, 212, 191, 0.6)");
          botGrad.addColorStop(1, "rgba(168, 85, 247, 0.05)");

          ctx.fillStyle = botGrad;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.roundRect(bx, cy, barW, halfH * 0.65, [0, 0, barW / 2, barW / 2]);
          ctx.fill();

          // 3. Cápsula flotante de pico superior (HUD Cyberpunk Peak Meter)
          if (peakH > 4) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#5eead4";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(bx, cy - peakH - 3, barW, 2.2, 1.1);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // ── MODO 3: ORBE RESONANTE (NÚCLEO SÓNICO LÍQUIDO CON ONDAS EXPANSIVAS) ──────
      else if (currentStyle === "orbital") {
        const cx = w / 2;
        const baseRad = Math.min(w, h) * 0.22;
        const currentRad = baseRad + level * 16;

        // Spawn de ondas de choque acústicas expansivas
        const now = Date.now();
        if ((level > 0.32 || Math.random() < 0.04) && now - lastShockwaveTime > 280) {
          shockwaves.push({
            radius: currentRad,
            maxRadius: currentRad * (1.8 + Math.random() * 0.8),
            alpha: 0.75,
            speed: 1.2 + level * 2.0,
          });
          lastShockwaveTime = now;
        }

        // Renderizar y actualizar ondas expansivas de choque
        for (let s = shockwaves.length - 1; s >= 0; s--) {
          const sw = shockwaves[s];
          sw.radius += sw.speed;
          sw.alpha *= 0.94;

          if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(s, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(45, 212, 191, ${sw.alpha * 0.7})`;
          ctx.lineWidth = 1.6;
          ctx.shadowColor = "rgba(45, 212, 191, 0.8)";
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }

        // Resplandor ambiental de fondo (Nebulosa del orbe)
        const haloGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, currentRad * 2.2);
        haloGrad.addColorStop(0, `rgba(45, 212, 191, ${0.2 + level * 0.35})`);
        haloGrad.addColorStop(0.45, `rgba(168, 85, 247, ${0.12 + level * 0.22})`);
        haloGrad.addColorStop(1, "transparent");
        ctx.save();
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRad * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Núcleo líquido deformable orgánicamente (Forma armónica continua)
        const totalVertices = 48;
        ctx.save();
        ctx.beginPath();
        for (let v = 0; v <= totalVertices; v++) {
          const angle = (v / totalVertices) * Math.PI * 2;
          const deform1 = Math.sin(angle * 3 + phaseRef.current * 2.2) * (5 * level);
          const deform2 = Math.cos(angle * 5 - phaseRef.current * 1.6) * (4 * level);
          const deform3 = Math.sin(angle * 2 + phaseRef.current * 0.9) * (3 * level);
          const r = currentRad + deform1 + deform2 + deform3;

          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;

          if (v === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, currentRad);
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        coreGrad.addColorStop(0.35, "rgba(94, 234, 212, 0.85)");
        coreGrad.addColorStop(0.75, "rgba(56, 189, 248, 0.7)");
        coreGrad.addColorStop(1, "rgba(192, 132, 252, 0.4)");

        ctx.fillStyle = coreGrad;
        ctx.shadowColor = "#2dd4bf";
        ctx.shadowBlur = 18 + level * 16;
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Filamento orbital resonante que gira en 3D
        ctx.save();
        ctx.beginPath();
        const filamentRad = currentRad * 1.28;
        for (let v = 0; v <= totalVertices; v++) {
          const angle = (v / totalVertices) * Math.PI * 2;
          const deform = Math.sin(angle * 4 + phaseRef.current * 3.0) * (6 * level);
          const r = filamentRad + deform;
          const px = cx + Math.cos(angle + phaseRef.current * 0.5) * r;
          const py = cy + Math.sin(angle + phaseRef.current * 0.5) * (r * 0.55);

          if (v === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 2.0;
        ctx.shadowColor = "rgba(56, 189, 248, 0.9)";
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();

        // Singularidad central brillante
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + level * 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 16;
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

      {/* Barra de metadatos y selector de estilo (opcional) */}
      {showMeta && (
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
      )}
    </div>
  );
}
