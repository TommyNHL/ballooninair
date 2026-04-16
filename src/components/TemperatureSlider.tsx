import { motion } from "framer-motion";

interface TemperatureSliderProps {
  temperature: number;
  onChange: (temp: number) => void;
  min?: number;
  max?: number;
  label: string;
}

const TemperatureSlider = ({ temperature, onChange, min = -20, max = 100, label }: TemperatureSliderProps) => {
  const ratio = (temperature - min) / (max - min);
  const hue = 210 - ratio * 210; // blue to red

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <motion.span
          key={temperature}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-heading text-lg font-bold"
          style={{ color: `hsl(${hue}, 70%, 50%)` }}
        >
          {temperature}°C
        </motion.span>
      </div>
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full left-0 right-0"
          style={{
            background: `linear-gradient(to right, hsl(210,70%,55%), hsl(45,80%,55%), hsl(0,80%,55%))`,
            opacity: 0.3,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={temperature}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-3 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
          style={{
            // @ts-ignore
            '--tw-slider-thumb-bg': `hsl(${hue}, 70%, 50%)`,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            background: hsl(${hue}, 70%, 50%);
          }
        `}</style>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}°C</span>
        <span>{max}°C</span>
      </div>
    </div>
  );
};

export default TemperatureSlider;
