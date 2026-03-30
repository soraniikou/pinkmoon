import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pinkMoonImg from "@/assets/pink-moon.png";

type Particle = {
  id: number;
  tx: number;
  ty: number;
  size: number;
  delay: number;
  spawnRatio: number;
  jitter: number;
};

const CHERRY = "hsl(350 92% 62%)";
const CHERRY_SOFT = "hsl(340 85% 72%)";

type HoneyPinkMoonSliderProps = {
  value: number;
  onChange: (index: number) => void;
  steps: number;
  labels: string[];
};

export function HoneyPinkMoonSlider({ value, onChange, steps, labels }: HoneyPinkMoonSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastBurst = useRef(0);
  const burstSeq = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const id = useId();

  const max = Math.max(1, steps - 1);
  const ratio = value / max;

  const spawnBurst = useCallback((atRatio: number, intensity: number) => {
    const now = performance.now();
    if (now - lastBurst.current < 45 && intensity < 2) return;
    lastBurst.current = now;
    const n = Math.min(18, Math.ceil(8 + intensity * 4));
    const base = burstSeq.current++;
    const created: Particle[] = Array.from({ length: n }, (_, i) => ({
      id: base * 1000 + i,
      tx: (Math.random() - 0.5) * (55 + intensity * 12),
      ty: -12 - Math.random() * (48 + intensity * 8),
      size: 2 + Math.random() * 4,
      delay: i * 0.018,
      spawnRatio: atRatio,
      jitter: (Math.random() - 0.5) * 10,
    }));
    const ids = created.map((c) => c.id);
    setParticles((prev) => [...prev, ...created].slice(-64));
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !ids.includes(p.id)));
    }, 950);
  }, []);

  const ratioFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    },
    [],
  );

  const applyClientX = useCallback(
    (clientX: number, particleIntensity: number) => {
      const r = ratioFromClientX(clientX);
      if (r === null) return;
      const next = Math.round(r * max);
      if (next !== value) {
        onChange(next);
        spawnBurst(r, particleIntensity);
      } else {
        spawnBurst(r, particleIntensity * 0.6);
      }
    },
    [max, onChange, ratioFromClientX, spawnBurst, value],
  );

  const onPointerDownTrack = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    applyClientX(e.clientX, 1.2);
  };

  const onPointerMoveTrack = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    applyClientX(e.clientX, 1.5);
  };

  const onPointerUpTrack = () => {
    dragging.current = false;
  };

  useEffect(() => {
    const trim = window.setInterval(() => {
      setParticles((p) => (p.length > 48 ? p.slice(-40) : p));
    }, 2000);
    return () => clearInterval(trim);
  }, []);

  return (
    <div className="relative w-full select-none py-8">
      <motion.div
        className="pointer-events-none absolute -inset-6 rounded-[3rem] opacity-70 blur-2xl"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${CHERRY_SOFT} 0%, transparent 65%)`,
        }}
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.03, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative px-1">
        <p className="mb-3 text-center font-display text-sm tracking-wider text-primary/90">
          {labels[value] ?? ""}
        </p>

        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-labelledby={id}
          tabIndex={0}
          className="relative h-12 w-full cursor-pointer touch-none outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onPointerDown={onPointerDownTrack}
          onPointerMove={onPointerMoveTrack}
          onPointerUp={onPointerUpTrack}
          onPointerCancel={onPointerUpTrack}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              const nv = Math.max(0, value - 1);
              onChange(nv);
              spawnBurst(nv / max, 1);
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              const nv = Math.min(max, value + 1);
              onChange(nv);
              spawnBurst(nv / max, 1);
            }
          }}
        >
          {/* Honey track */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-7 -translate-y-1/2 overflow-visible rounded-full"
            style={{
              background: `
                linear-gradient(180deg,
                  hsl(330 100% 92%) 0%,
                  hsl(340 90% 78%) 28%,
                  hsl(325 75% 62%) 72%,
                  hsl(315 65% 48%) 100%
                )
              `,
              boxShadow: `
                inset 0 2px 8px rgba(255, 255, 255, 0.65),
                inset 0 -4px 14px rgba(140, 40, 80, 0.38),
                0 6px 24px rgba(255, 130, 170, 0.42),
                0 0 0 1px rgba(255, 200, 220, 0.35)
              `,
            }}
            animate={{
              filter: [
                "brightness(1) saturate(1.05)",
                "brightness(1.06) saturate(1.12)",
                "brightness(1) saturate(1.05)",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Gloss */}
          <div
            className="pointer-events-none absolute left-2 right-2 top-1/2 h-3 -translate-y-1/2 rounded-full opacity-90"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.08) 55%, transparent 100%)",
            }}
          />

          {/* Filled cherry glow (progress) */}
          <motion.div
            className="pointer-events-none absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-full"
            style={{
              width: `${ratio * 100}%`,
              background: `linear-gradient(90deg, ${CHERRY}00 0%, ${CHERRY}55 40%, ${CHERRY}88 100%)`,
              boxShadow: `inset 0 0 20px rgba(255, 80, 120, 0.35)`,
            }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />

          {/* Particles layer */}
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            <AnimatePresence>
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `calc(${p.spawnRatio * 100}% + ${p.jitter}px)`,
                    top: "50%",
                    width: p.size,
                    height: p.size,
                    marginLeft: -p.size / 2,
                    marginTop: -p.size / 2,
                    background: `radial-gradient(circle, ${CHERRY} 0%, ${CHERRY_SOFT} 45%, transparent 70%)`,
                    boxShadow: `0 0 ${p.size * 2}px ${CHERRY}`,
                  }}
                  initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0.85, 0],
                    scale: [0.4, 1.1, 0.9],
                    x: p.tx,
                    y: p.ty,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85 + Math.random() * 0.35, delay: p.delay, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Moon knob */}
          <motion.div
            className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ratio * 100}%` }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <motion.div
              className="relative h-14 w-14 rounded-full p-0.5"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.5), rgba(255,180,200,0.25))",
                boxShadow: `
                  0 0 0 1px rgba(255, 200, 220, 0.55),
                  0 8px 28px rgba(255, 100, 140, 0.45),
                  0 0 40px rgba(255, 150, 180, 0.5)
                `,
              }}
              animate={{
                boxShadow: [
                  "0 0 0 1px rgba(255, 200, 220, 0.55), 0 8px 28px rgba(255, 100, 140, 0.45), 0 0 40px rgba(255, 150, 180, 0.45)",
                  "0 0 0 1px rgba(255, 220, 235, 0.7), 0 10px 32px rgba(255, 120, 160, 0.55), 0 0 52px rgba(255, 170, 200, 0.65)",
                  "0 0 0 1px rgba(255, 200, 220, 0.55), 0 8px 28px rgba(255, 100, 140, 0.45), 0 0 40px rgba(255, 150, 180, 0.45)",
                ],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="h-full w-full overflow-hidden rounded-full"
                style={{
                  background: "rgba(255, 210, 225, 0.35)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <img
                  src={pinkMoonImg}
                  alt=""
                  className="h-full w-full object-cover opacity-[0.55]"
                  draggable={false}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <p id={id} className="sr-only">
          未来までの距離を選ぶスライダー
        </p>

        <div className="mt-4 flex max-w-full justify-between gap-1 overflow-x-auto px-0.5 pb-1 text-[9px] leading-tight text-muted-foreground/90 [scrollbar-width:thin] sm:gap-1.5 sm:text-[11px]">
          {labels.map((label, i) => (
            <span
              key={label}
              className={`shrink-0 text-center ${i === value ? "font-medium text-primary" : ""}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
