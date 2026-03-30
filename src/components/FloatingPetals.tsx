import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const FloatingPetals = ({ intensity = 0 }: { intensity: number }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const count = 8 + intensity * 12;
    const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
      size: 4 + Math.random() * 8,
    }));
    setPetals(newPetals);
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute rounded-full"
            style={{
              left: `${petal.x}%`,
              bottom: "-20px",
              width: petal.size,
              height: petal.size,
              background: `radial-gradient(circle, hsl(330 100% ${70 + intensity * 15}% / 0.8), hsl(340 80% 60% / 0.3))`,
              boxShadow: `0 0 ${petal.size * 2}px hsl(330 100% 70% / 0.5)`,
            }}
            animate={{
              y: [0, -window.innerHeight - 40],
              x: [0, Math.sin(petal.delay) * 60, -Math.sin(petal.delay) * 40, 0],
              rotate: [0, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingPetals;
