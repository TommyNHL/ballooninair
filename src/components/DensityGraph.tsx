import { useMemo } from "react";
import { motion } from "framer-motion";

interface DensityGraphProps {
  temperature: number;
  medium: "air" | "freshwater" | "saltwater";
}

const getMediumDensity = (medium: "air" | "freshwater" | "saltwater", temp: number) => {
  if (medium === "air") return 1.293 * (273.15 / (273.15 + temp));
  if (medium === "freshwater") return 999.97 - 0.0053 * (temp - 4) * (temp - 4);
  return 1025 - 0.005 * (temp - 4) * (temp - 4);
};

const DensityGraph = ({ temperature, medium }: DensityGraphProps) => {
  const points = useMemo(() => {
    const pts: { x: number; y: number; temp: number; density: number }[] = [];
    const minT = -20, maxT = 100;
    const densities = [];
    
    for (let t = minT; t <= maxT; t += 2) {
      densities.push(getMediumDensity(medium, t));
    }
    const maxD = Math.max(...densities);
    const minD = Math.min(...densities);
    
    for (let t = minT; t <= maxT; t += 2) {
      const d = getMediumDensity(medium, t);
      pts.push({
        temp: t,
        density: d,
        x: ((t - minT) / (maxT - minT)) * 280 + 30,
        y: 120 - ((d - minD) / (maxD - minD || 1)) * 100,
      });
    }
    return pts;
  }, [medium]);

  const currentDensity = getMediumDensity(medium, temperature);
  const densities = points.map(p => p.density);
  const maxD = Math.max(...densities);
  const minD = Math.min(...densities);
  
  const curX = ((temperature - (-20)) / 120) * 280 + 30;
  const curY = 120 - ((currentDensity - minD) / (maxD - minD || 1)) * 100;
  
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h4 className="font-heading text-sm font-semibold mb-2 text-foreground">
        Density vs Temperature
      </h4>
      <svg viewBox="0 0 320 150" className="w-full">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(pct => (
          <line
            key={pct}
            x1={30} y1={20 + pct} x2={310} y2={20 + pct}
            stroke="hsl(var(--border))" strokeWidth={0.5}
          />
        ))}
        
        {/* Axes labels */}
        <text x={170} y={145} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          Temperature (°C)
        </text>
        <text x={8} y={70} textAnchor="middle" className="fill-muted-foreground text-[7px]" 
          transform="rotate(-90, 8, 70)">
          Density
        </text>

        {/* Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
        
        {/* Current point */}
        <motion.circle
          cx={curX}
          cy={curY}
          r={5}
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--card))"
          strokeWidth={2}
          animate={{ cx: curX, cy: curY }}
          transition={{ type: "spring", stiffness: 80 }}
        />
        <motion.text
          x={curX}
          y={curY - 10}
          textAnchor="middle"
          className="fill-foreground text-[7px] font-semibold"
          animate={{ x: curX, y: curY - 10 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          {currentDensity.toFixed(medium === "air" ? 3 : 1)}
        </motion.text>
      </svg>
    </div>
  );
};

export default DensityGraph;
