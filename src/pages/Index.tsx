import { useState } from "react";
import { motion } from "framer-motion";
import FluidTank from "@/components/FluidTank";
import ParticleModel from "@/components/ParticleModel";

const objects = [
  { emoji: "🎈", label: "Balloon", density: 0.9 },
  { emoji: "🪵", label: "Wood", density: 600 },
  { emoji: "🧊", label: "Ice", density: 917 },
  { emoji: "🦆", label: "Duck", density: 850 },
  { emoji: "🪨", label: "Stone", density: 2500 },
  { emoji: "⚙️", label: "Steel", density: 7800 },
];

const mediums = [
  { key: "air" as const, label: "Air", emoji: "🌬️" },
  { key: "freshwater" as const, label: "Fresh Water", emoji: "💧" },
  { key: "saltwater" as const, label: "Salt Water", emoji: "🌊" },
];

const Index = () => {
  const [temp, setTemp] = useState(20);
  const [objIdx, setObjIdx] = useState(2);
  const [medium, setMedium] = useState<"air" | "freshwater" | "saltwater">("freshwater");

  const obj = objects[objIdx];
  const tempRatio = (temp + 20) / 120;
  const hue = 210 - tempRatio * 210;

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto space-y-5">
      {/* Title */}
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">🔬 Density & Buoyancy Lab</h1>
        <p className="text-xs text-muted-foreground mt-0.5">See how temperature affects density and floating/sinking</p>
      </div>

      {/* Medium picker */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {mediums.map((m) => (
          <button
            key={m.key}
            onClick={() => setMedium(m.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              medium === m.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Temperature */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Temperature</span>
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
      </div>

      {/* Object picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {objects.map((o, i) => (
          <motion.button
            key={o.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => setObjIdx(i)}
            className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-center transition-colors ${
              objIdx === i ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <span className="text-lg">{o.emoji}</span>
            <span className="text-[9px] font-medium text-foreground">{o.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tank */}
      <FluidTank
        temperature={temp}
        medium={medium}
        objectDensity={obj.density}
        objectLabel={obj.label}
        objectEmoji={obj.emoji}
      />

      {/* Particle Model */}
      <ParticleModel temperature={temp} medium={medium} />

      {/* Key facts */}
      <div className="bg-card rounded-xl border border-border p-3 text-[11px] text-muted-foreground space-y-1">
        <p className="font-heading font-semibold text-foreground text-xs">💡 Key ideas</p>
        <p>• <strong>Hot</strong> → particles move faster & spread out → lower density</p>
        <p>• <strong>Cold</strong> → particles slow down & pack tight → higher density</p>
        <p>• Objects <strong>float</strong> when they're less dense than the medium</p>
        <p>• Salt water is denser → more things float in it</p>
      </div>
    </div>
  );
};

export default Index;
