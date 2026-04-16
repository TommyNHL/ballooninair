import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface ParticleModelProps {
  temperature: number;
  gasId?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVel: number;
  shapeOverride?: MoleculeShape;
}

type MoleculeShape =
  | { type: "single"; radius: number; color: string }
  | { type: "dumbbell"; radius: number; gap: number; color: string }
  | { type: "v-shape"; radius: number; gap: number; angle: number; colors: [string, string] }
  | { type: "linear3"; radius: number; gap: number; colors: [string, string] };

interface MoleculeEntry {
  shape: MoleculeShape;
  label: string;
  mix?: { shape: MoleculeShape; ratio: number }[];
}

const MOLECULE_SHAPES: Record<string, MoleculeEntry> = {
  hydrogen: {
    label: "H₂ — diatomic",
    shape: { type: "dumbbell", radius: 4, gap: 7, color: "hsla(0, 0%, 85%, 0.9)" },
  },
  helium: {
    label: "He — monatomic",
    shape: { type: "single", radius: 5, color: "hsla(50, 70%, 70%, 0.9)" },
  },
  nitrogen: {
    label: "N₂ — diatomic",
    shape: { type: "dumbbell", radius: 4.5, gap: 8, color: "hsla(210, 60%, 65%, 0.9)" },
  },
  air: {
    label: "Air — N₂ + O₂ mix",
    shape: { type: "dumbbell", radius: 4.5, gap: 8, color: "hsla(210, 60%, 65%, 0.9)" },
    mix: [
      { shape: { type: "dumbbell", radius: 4.5, gap: 8, color: "hsla(210, 60%, 65%, 0.9)" } as MoleculeShape, ratio: 0.78 },
      { shape: { type: "dumbbell", radius: 4.5, gap: 8, color: "hsla(0, 60%, 60%, 0.9)" } as MoleculeShape, ratio: 0.22 },
    ],
  },
  oxygen: {
    label: "O₂ — diatomic",
    shape: { type: "dumbbell", radius: 4.5, gap: 8, color: "hsla(0, 60%, 60%, 0.9)" },
  },
  ozone: {
    label: "O₃ — bent/V-shape",
    shape: { type: "v-shape", radius: 4, gap: 8, angle: 117, colors: ["hsla(0, 60%, 60%, 0.9)", "hsla(0, 60%, 60%, 0.9)"] },
  },
  co2: {
    label: "CO₂ — linear triatomic",
    shape: { type: "linear3", radius: 4, gap: 8, colors: ["hsla(0, 0%, 40%, 0.9)", "hsla(0, 60%, 60%, 0.9)"] },
  },
};

function drawMolecule(ctx: CanvasRenderingContext2D, p: Particle, shape: MoleculeShape) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  if (shape.type === "single") {
    ctx.beginPath();
    ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
    ctx.fillStyle = shape.color;
    ctx.fill();
  } else if (shape.type === "dumbbell") {
    // bond line
    ctx.beginPath();
    ctx.moveTo(-shape.gap / 2, 0);
    ctx.lineTo(shape.gap / 2, 0);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // two atoms
    for (const dx of [-shape.gap / 2, shape.gap / 2]) {
      ctx.beginPath();
      ctx.arc(dx, 0, shape.radius, 0, Math.PI * 2);
      ctx.fillStyle = shape.color;
      ctx.fill();
    }
  } else if (shape.type === "v-shape") {
    const halfAngle = ((180 - shape.angle) / 2) * (Math.PI / 180);
    const ax = -Math.cos(halfAngle) * shape.gap;
    const ay = -Math.sin(halfAngle) * shape.gap;
    const bx = -Math.cos(halfAngle) * shape.gap;
    const by = Math.sin(halfAngle) * shape.gap;
    // bonds
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(0, 0);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = shape.colors[1];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // center atom
    ctx.beginPath();
    ctx.arc(0, 0, shape.radius + 1, 0, Math.PI * 2);
    ctx.fillStyle = shape.colors[0];
    ctx.fill();
    // outer atoms
    for (const [ox, oy] of [[ax, ay], [bx, by]]) {
      ctx.beginPath();
      ctx.arc(ox, oy, shape.radius, 0, Math.PI * 2);
      ctx.fillStyle = shape.colors[1];
      ctx.fill();
    }
  } else if (shape.type === "linear3") {
    // bonds
    ctx.beginPath();
    ctx.moveTo(-shape.gap, 0);
    ctx.lineTo(shape.gap, 0);
    ctx.strokeStyle = shape.colors[1];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // center (C)
    ctx.beginPath();
    ctx.arc(0, 0, shape.radius + 1, 0, Math.PI * 2);
    ctx.fillStyle = shape.colors[0];
    ctx.fill();
    // outer (O)
    for (const dx of [-shape.gap, shape.gap]) {
      ctx.beginPath();
      ctx.arc(dx, 0, shape.radius, 0, Math.PI * 2);
      ctx.fillStyle = shape.colors[1];
      ctx.fill();
    }
  }

  ctx.restore();
}

const ParticleModel = ({ temperature, gasId = "air" }: ParticleModelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const moleculeInfo = MOLECULE_SHAPES[gasId] || MOLECULE_SHAPES.air;
  const speed = 0.3 + ((temperature + 20) / 120) * 3.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    const particles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      let shapeOverride: MoleculeShape | undefined;
      if (moleculeInfo.mix) {
        const r = Math.random();
        let cumulative = 0;
        for (const m of moleculeInfo.mix) {
          cumulative += m.ratio;
          if (r < cumulative) { shapeOverride = m.shape; break; }
        }
        if (!shapeOverride) shapeOverride = moleculeInfo.mix[0].shape;
      }
      particles.push({
        x: 20 + Math.random() * (W - 40),
        y: 20 + Math.random() * (H - 40),
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        angle: Math.random() * Math.PI * 2,
        angularVel: (Math.random() - 0.5) * 0.05,
        shapeOverride,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > 0) {
          const scale = speed / currentSpeed;
          p.vx += (p.vx * scale - p.vx) * 0.05;
          p.vy += (p.vy * scale - p.vy) * 0.05;
        }
        p.vx += (Math.random() - 0.5) * speed * 0.3;
        p.vy += (Math.random() - 0.5) * speed * 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angularVel * (speed / 2);

        const r = 12;
        if (p.x < r) { p.x = r; p.vx *= -1; }
        if (p.x > W - r) { p.x = W - r; p.vx *= -1; }
        if (p.y < r) { p.y = r; p.vy *= -1; }
        if (p.y > H - r) { p.y = H - r; p.vy *= -1; }
      }

      // trails at high temp
      if (temperature > 40) {
        for (const p of particles) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.strokeStyle = "hsla(200, 50%, 70%, 0.15)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      for (const p of particles) {
        drawMolecule(ctx, p, p.shapeOverride || moleculeInfo.shape);

        if (temperature > 60) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(p.x, p.y, 3, p.x, p.y, 12);
          glow.addColorStop(0, `hsla(30, 80%, 60%, ${(temperature - 60) / 200})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [temperature, gasId, speed, moleculeInfo]);

  const stateLabel = temperature > 0
    ? "Gas – fast, spread out"
    : "Cold gas – slower, denser";

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-foreground">
          🔬 Particle Model
        </h4>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {moleculeInfo.label}
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-foreground/5 border border-border">
        <canvas ref={canvasRef} width={360} height={200} className="w-full h-auto" />
        <motion.div
          key={stateLabel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-foreground"
        >
          {stateLabel}
        </motion.div>
      </div>
    </div>
  );
};

export default ParticleModel;
