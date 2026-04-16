import { useState } from "react";
import { motion } from "framer-motion";
import ParticleModel from "@/components/ParticleModel";

const Index = () => {
  const [temp, setTemp] = useState(20);
  const tempRatio = (temp + 20) / 120;
  const hue = 210 - tempRatio * 210;

  // Air density decreases with temperature
  const airDensity = 1.293 * (273.15 / (273.15 + temp));
  const balloonDensity = 0.9; // lighter than cool air, heavier than very hot air envelope
  const floats = balloonDensity < airDensity;

  // Balloon position: floats high when air is cold/dense, sinks when air is hot/thin
  const yPercent = floats ? 10 + (balloonDensity / airDensity) * 30 : 55 + Math.min(25, (balloonDensity / airDensity - 1) * 40);

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-md mx-auto space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">🎈 Balloon in Air</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          How does air temperature affect a balloon's buoyancy?
        </p>
      </div>

      {/* Temperature slider */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Air Temperature</span>
          <span className="font-heading text-sm font-bold" style={{ color: `hsl(${hue},70%,50%)` }}>
            {temp}°C
          </span>
        </div>
        <input
          type="range" min={-20} max={100} value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(210,70%,55%), hsl(45,80%,55%), hsl(0,80%,55%))`,
          }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>-20°C</span>
          <span>100°C</span>
        </div>
      </div>

      {/* Sky tank */}
      <div
        className="relative w-full h-80 rounded-xl overflow-hidden border border-border"
        style={{
          background: `linear-gradient(to bottom, 
            hsla(${200 - tempRatio * 15}, ${50 + tempRatio * 15}%, ${80 - tempRatio * 15}%, 1) 0%, 
            hsla(${200 - tempRatio * 15}, ${40 + tempRatio * 10}%, ${90 - tempRatio * 10}%, 1) 65%,
            hsla(195, 60%, 45%, 1) 65%,
            hsla(210, 65%, 30%, 1) 100%)`,
        }}
      >
        {/* Heat shimmer at high temp */}
        {temp > 50 && (
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            style={{
              background: "repeating-linear-gradient(0deg, transparent, hsla(30,80%,60%,0.1) 2px, transparent 4px)",
            }}
          />
        )}

        {/* Sea level line */}
        <div className="absolute left-0 right-0" style={{ top: "65%" }}>
          <div className="w-full border-t border-dashed border-sky-200/50" />
          <span className="absolute right-2 -top-4 text-[9px] font-medium text-sky-200/70 tracking-wide">
            SEA LEVEL
          </span>
        </div>

        {/* Waves */}
        <motion.div
          className="absolute left-0 right-0 overflow-hidden"
          style={{ top: "64%", height: "4%" }}
        >
          <motion.div
            className="w-[200%] h-full opacity-30"
            animate={{ x: [0, "-50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              background: "repeating-linear-gradient(90deg, transparent, hsla(195,70%,70%,0.4) 20px, transparent 40px)",
            }}
          />
        </motion.div>

        {/* Balloon */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ top: `${yPercent}%` }}
          transition={{ type: "spring", stiffness: 30, damping: 10 }}
        >
          <motion.div
            className="text-6xl select-none"
            animate={{
              rotate: floats ? [0, 4, -4, 0] : 0,
              y: floats ? [0, -6, 0] : [0, 2, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🎈
          </motion.div>
        </motion.div>

        {/* Status */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
            <div className="text-muted-foreground">
              Air ρ = <span className="font-semibold text-foreground">{airDensity.toFixed(3)}</span> kg/m³
            </div>
            <div className="text-muted-foreground">
              Balloon ρ = <span className="font-semibold text-foreground">{balloonDensity.toFixed(3)}</span> kg/m³
            </div>
          </div>
          <motion.div
            className="rounded-full px-2.5 py-1 text-xs font-bold text-primary-foreground"
            animate={{ backgroundColor: floats ? "hsl(160,60%,40%)" : "hsl(0,60%,50%)" }}
          >
            {floats ? "⬆ RISES" : "⬇ FALLS"}
          </motion.div>
        </div>
      </div>

      {/* Particle model */}
      <ParticleModel temperature={temp} medium="air" />

      {/* Explanation */}
      <div className="bg-card rounded-xl border border-border p-3 text-[11px] text-muted-foreground space-y-1">
        <p className="font-heading font-semibold text-foreground text-xs">💡 What's happening</p>
        <p>• <strong>Cold air</strong> → particles packed tight → dense air → balloon rises</p>
        <p>• <strong>Hot air</strong> → particles spread out → thin air → balloon struggles to float</p>
        <p>• The balloon floats when the surrounding air is <strong>denser</strong> than it</p>
      </div>
    </div>
  );
};

export default Index;
