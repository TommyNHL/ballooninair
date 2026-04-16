import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface ParticleModelProps {
  temperature: number;
  medium: "air" | "freshwater" | "saltwater";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const ParticleModel = ({ temperature, medium }: ParticleModelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const config = useMemo(() => {
    const speed = 0.3 + ((temperature + 20) / 120) * 3.5; // maps -20→100 to 0.3→3.8
    const isSalt = medium === "saltwater";

    if (medium === "air") {
      return {
        count: 30,
        baseRadius: 4,
        spacing: 1, // loose
        speed,
        particleColor: "hsla(200, 50%, 70%, 0.8)",
        bondColor: "",
        showBonds: false,
        label: "Gas molecules",
      };
    }
    // liquid
    const count = isSalt ? 50 : 40;
    return {
      count,
      baseRadius: 5,
      spacing: temperature < 4 ? 0.85 : 0.7 - (temperature / 200), // tighter when cold
      speed: speed * 0.5,
      particleColor: isSalt ? "hsla(190, 60%, 55%, 0.85)" : "hsla(210, 60%, 55%, 0.85)",
      saltColor: "hsla(40, 70%, 65%, 0.9)",
      bondColor: "hsla(210, 40%, 60%, 0.15)",
      showBonds: temperature < 20,
      label: isSalt ? "H₂O + NaCl molecules" : "H₂O molecules",
      saltCount: isSalt ? 10 : 0,
    };
  }, [temperature, medium]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Initialize particles
    const particles: Particle[] = [];
    const totalCount = config.count + ((config as any).saltCount || 0);

    for (let i = 0; i < totalCount; i++) {
      const isSaltParticle = i >= config.count;
      particles.push({
        x: 20 + Math.random() * (W - 40),
        y: 20 + Math.random() * (H - 40),
        vx: (Math.random() - 0.5) * config.speed * 2,
        vy: (Math.random() - 0.5) * config.speed * 2,
        radius: isSaltParticle ? 3.5 : config.baseRadius,
        color: isSaltParticle ? (config as any).saltColor : config.particleColor,
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Update & draw
      for (const p of particles) {
        // Scale velocity toward target speed
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const targetSpeed = config.speed;
        if (currentSpeed > 0) {
          const scale = targetSpeed / currentSpeed;
          p.vx += (p.vx * scale - p.vx) * 0.05;
          p.vy += (p.vy * scale - p.vy) * 0.05;
        }

        // Add random jitter proportional to temperature
        p.vx += (Math.random() - 0.5) * config.speed * 0.3;
        p.vy += (Math.random() - 0.5) * config.speed * 0.3;

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
        if (p.x > W - p.radius) { p.x = W - p.radius; p.vx *= -1; }
        if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
        if (p.y > H - p.radius) { p.y = H - p.radius; p.vy *= -1; }
      }

      // Particle repulsion/attraction for liquids
      if (medium !== "air") {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particles[i].x;
            const dy = particles[j].y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (particles[i].radius + particles[j].radius) * 2.2;

            if (dist < minDist && dist > 0) {
              const force = (minDist - dist) / minDist * 0.3;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              particles[i].vx -= fx;
              particles[i].vy -= fy;
              particles[j].vx += fx;
              particles[j].vy += fy;
            }

            // Draw bonds at low temp
            if (config.showBonds && dist < minDist * 1.3) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = config.bondColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Glow at high temp
        if (temperature > 60) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(p.x, p.y, p.radius * 0.5, p.x, p.y, p.radius * 1.8);
          glow.addColorStop(0, `hsla(30, 80%, 60%, ${(temperature - 60) / 200})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

      // Draw motion trails for high temp
      if (temperature > 40 && medium === "air") {
        for (const p of particles) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.strokeStyle = "hsla(200, 50%, 70%, 0.2)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [config, temperature, medium]);

  // State of matter label
  const stateLabel = medium === "air" 
    ? (temperature > 0 ? "Gas – fast, spread out" : "Cold gas – slower, denser")
    : temperature > 99 
      ? "Boiling! → Gas transition" 
      : temperature < 1 
        ? "Near freezing – structured bonds" 
        : temperature < 20 
          ? "Cool liquid – closer molecules"
          : "Warm liquid – more movement";

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-foreground">
          🔬 Particle Model
        </h4>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {config.label}
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-foreground/5 border border-border">
        <canvas
          ref={canvasRef}
          width={360}
          height={200}
          className="w-full h-auto"
        />
        
        {/* State indicator overlay */}
        <motion.div
          key={stateLabel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-foreground"
        >
          {stateLabel}
        </motion.div>
      </div>

      <div className="flex items-start gap-3 text-[11px] text-muted-foreground leading-relaxed">
        <div className="flex-1 space-y-1">
          <p>
            <span className="font-semibold text-hot">↑ Higher temp</span> → particles move faster, spread apart → <span className="font-semibold">lower density</span>
          </p>
          <p>
            <span className="font-semibold text-cold">↓ Lower temp</span> → particles slow down, pack together → <span className="font-semibold">higher density</span>
          </p>
        </div>
        <div className="flex flex-col gap-1 items-center shrink-0">
          <div className="flex gap-1 items-center">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: config.particleColor }} />
            <span>{medium === "air" ? "Gas" : "H₂O"}</span>
          </div>
          {medium === "saltwater" && (
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsla(40, 70%, 65%, 0.9)" }} />
              <span>NaCl</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticleModel;
