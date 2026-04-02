import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import pinkMoonImg from "@/assets/pink-moon.png";
import FloatingPetals from "./FloatingPetals";

const phases = [
  { label: "Sentimental", sub: "", gradient: "linear-gradient(135deg, hsl(250 40% 15%), hsl(280 35% 20%))", poem: "May your deepest wishes come true" },
  { label: "Affection", sub: "", gradient: "linear-gradient(135deg, hsl(280 40% 18%), hsl(330 50% 25%))", poem: "I wonder if the monn will lead me to you" },
  { label: "Longing", sub: "", gradient: "linear-gradient(135deg, hsl(320 50% 22%), hsl(340 65% 30%))", poem: "Your voice is the most beautiful melody" },
  { label: "Enchantment", sub: "", gradient: "linear-gradient(135deg, hsl(340 70% 28%), hsl(350 80% 35%))", poem: "To love and be loved is a true miracle" },
  { label: "Destiny", sub: "", gradient: "linear-gradient(135deg, hsl(270 50% 20%), hsl(290 60% 30%))", poem: "I was born for the moment I finally met you" },
];

/** タップのたびにフェーズとともに月の見え方を変える */
const MOON_COLORS = [
  "hue-rotate(0deg) saturate(1.2)",      // 切なさ：元の色（ピンク）
  "hue-rotate(80deg) saturate(0.6) brightness(0.7)",   // 想い：暗い薄い黄緑
  "hue-rotate(120deg) saturate(1.8)",    // 恋：緑
  "hue-rotate(60deg) saturate(2)",       // いざない：黄色
  "hue-rotate(270deg) saturate(1.5) brightness(0.8)",
];

const MOON_SIZES = [
  "w-[5.5rem] h-[5.5rem] sm:w-28 sm:h-28",
  "w-32 h-32 sm:w-40 sm:h-40",
  "w-36 h-36 sm:w-48 sm:h-48",
  "w-28 h-28 sm:w-36 sm:h-36",
  "w-48 h-48 sm:w-48 sm:h-48",
];

const PinkMoonHero = () => {
  const [phase, setPhase] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setRipples((prev) => [...prev.slice(-5), { id: Date.now(), x: clientX - rect.left, y: clientY - rect.top }]);
    setPhase((prev) => (prev + 1) % phases.length);
  }, []);

  const current = phases[phase];
  const intensity = phase / (phases.length - 1);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden shimmer-bg"
      style={{ background: current.gradient, backgroundSize: "400% 400%" }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      <FloatingPetals intensity={intensity} />

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              border: "2px solid hsl(330 100% 70% / 0.6)",
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            onAnimationComplete={() =>
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
            }
          />
        ))}
      </AnimatePresence>

      {/* Moon — タップでフェーズとサイズが変わる */}
      <motion.div
        className="relative z-20 mb-8 flex items-center justify-center w-full"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.img
          key={phase}
          src={pinkMoonImg}
          alt="Pink Moon"
          width={512}
          height={512}
          initial={{ scale: 0.88, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`moon-glow object-contain ${MOON_SIZES[phase]}`}
style={{ filter: MOON_COLORS[phase] }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        className="relative z-20 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <h1 className="font-display text-base sm:text-lg font-light tracking-wider glow-text text-foreground mb-3">
          Guided by Love
        </h1>
        
          
        
        

        {/* Phase indicator */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="font-display text-1xl sm:text-3xl text-foreground glow-text">
            {current.label}
          </p>
        <p className="text-sm text-primary/60 mt-2 tracking-wider text-center">
  {current.poem}
</p>
        </motion.div>

        {/* Phase dots */}
        <div className="flex gap-3 justify-center mb-10">
          {phases.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: i <= phase ? "hsl(330 100% 70%)" : "hsl(330 30% 30%)",
                boxShadow: i <= phase ? "0 0 10px hsl(330 100% 70% / 0.6)" : "none",
              }}
            />
          ))}
        </div>

        {/* Message */}
        <motion.p
          className="font-body text-sm sm:text-base text-foreground/50 max-w-xs mx-auto leading-relaxed"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          画面をタップ
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link
            to="/future"
            onClick={(e) => e.stopPropagation()}
            className="font-body relative z-30 inline-block text-sm text-primary/70 px-4 py-2 rounded-full border border-primary/40 hover:bg-primary/10 transition-colors"
          >
            A letter to the future · A century's dream
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PinkMoonHero;
