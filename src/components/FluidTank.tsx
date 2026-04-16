import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface FluidTankProps {
  temperature: number;
  medium: "air" | "freshwater" | "saltwater";
  objectDensity: number;
  objectLabel: string;
  objectEmoji: string;
}

const getMediumDensity = (medium: "air" | "freshwater" | "saltwater", temp: number) => {
  if (medium === "air") {
    // Air density decreases with temperature: ~1.29 kg/m³ at 0°C
    return 1.293 * (273.15 / (273.15 + temp));
  }
  if (medium === "freshwater") {
    // Water density peaks at 4°C (~999.97), decreases above and below
    const t = temp;
    return 999.97 - 0.0053 * (t - 4) * (t - 4);
  }
  // Saltwater: ~1025 kg/m³ at ~4°C
  return 1025 - 0.005 * (temp - 4) * (temp - 4);
};

const getMediumColor = (medium: "air" | "freshwater" | "saltwater", temp: number) => {
  const warmRatio = Math.max(0, Math.min(1, (temp - 0) / 80));
  if (medium === "air") {
    return {
      top: `hsla(${200 - warmRatio * 20}, ${40 + warmRatio * 20}%, ${85 - warmRatio * 10}%, 0.3)`,
      bottom: `hsla(${200 - warmRatio * 20}, ${40 + warmRatio * 20}%, ${75 - warmRatio * 10}%, 0.5)`,
    };
  }
  if (medium === "freshwater") {
    return {
      top: `hsla(${195 - warmRatio * 15}, ${50 + warmRatio * 10}%, ${60 - warmRatio * 10}%, 0.6)`,
      bottom: `hsla(${210 - warmRatio * 10}, ${55 + warmRatio * 10}%, ${35 - warmRatio * 5}%, 0.85)`,
    };
  }
  return {
    top: `hsla(${190 - warmRatio * 15}, ${55 + warmRatio * 10}%, ${55 - warmRatio * 10}%, 0.65)`,
    bottom: `hsla(${215 - warmRatio * 10}, ${60 + warmRatio * 10}%, ${25 - warmRatio * 5}%, 0.9)`,
  };
};

const FluidTank = ({ temperature, medium, objectDensity, objectLabel, objectEmoji }: FluidTankProps) => {
  const mediumDensity = useMemo(() => getMediumDensity(medium, temperature), [medium, temperature]);
  const colors = useMemo(() => getMediumColor(medium, temperature), [medium, temperature]);
  
  const floats = objectDensity < mediumDensity;
  const densityRatio = objectDensity / mediumDensity;
  
  // Position: 15% = floating at top, 75% = sunk at bottom
  const yPosition = floats 
    ? 15 + Math.min(30, densityRatio * 20) 
    : Math.min(75, 40 + (densityRatio - 1) * 35);

  // Bubbles for water
  const bubbles = useMemo(() => {
    if (medium === "air") return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      size: 3 + Math.random() * 6,
    }));
  }, [medium]);

  const mediumLabel = medium === "air" ? "Air" : medium === "freshwater" ? "Fresh Water" : "Salt Water";

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-semibold text-foreground">{mediumLabel}</h3>
      
      <div
        className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-border shadow-inner"
        style={{
          background: `linear-gradient(to bottom, ${colors.top}, ${colors.bottom})`,
        }}
      >
        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute rounded-full opacity-30"
              style={{
                left: `${b.x}%`,
                width: b.size,
                height: b.size,
                background: "hsla(0,0%,100%,0.6)",
              }}
              animate={{
                y: [200, -20],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Thermometer particles */}
        {temperature > 50 && medium !== "air" && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`steam-${i}`}
                className="absolute top-0 opacity-20"
                style={{ left: `${20 + i * 25}%` }}
                animate={{ y: [-5, -25], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity }}
              >
                ♨️
              </motion.div>
            ))}
          </>
        )}

        {/* Object */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: `${yPosition}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 12 }}
        >
          <motion.div
            className="text-4xl select-none"
            animate={{ 
              rotate: floats ? [0, 3, -3, 0] : 0,
              y: floats ? [0, -4, 0] : 0,
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {objectEmoji}
          </motion.div>
          <span className="text-xs font-medium mt-1 bg-card/80 px-2 py-0.5 rounded-full text-card-foreground backdrop-blur-sm">
            {objectLabel}
          </span>
        </motion.div>

        {/* Status badge */}
        <motion.div
          className="absolute bottom-3 left-3 right-3 flex justify-between items-end"
          layout
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs space-y-0.5">
            <div className="text-muted-foreground">
              ρ<sub>medium</sub> = <span className="font-semibold text-foreground">{mediumDensity.toFixed(2)}</span>
              <span className="text-muted-foreground"> kg/m³</span>
            </div>
          </div>
          <motion.div
            className="rounded-full px-3 py-1 text-xs font-bold"
            animate={{
              backgroundColor: floats ? "hsl(160,60%,40%)" : "hsl(0,60%,50%)",
              color: "#fff",
            }}
          >
            {floats ? "⬆ FLOATS" : "⬇ SINKS"}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FluidTank;
