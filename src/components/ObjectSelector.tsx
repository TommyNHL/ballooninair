import { motion } from "framer-motion";

export interface LabObject {
  id: string;
  label: string;
  emoji: string;
  density: number; // kg/m³
}

export const labObjects: LabObject[] = [
  { id: "balloon", label: "Hot Air Balloon", emoji: "🎈", density: 0.9 },
  { id: "helium", label: "Helium Balloon", emoji: "🫧", density: 0.164 },
  { id: "wood", label: "Wood Block", emoji: "🪵", density: 600 },
  { id: "ice", label: "Ice Cube", emoji: "🧊", density: 917 },
  { id: "rubber", label: "Rubber Duck", emoji: "🦆", density: 850 },
  { id: "steel", label: "Steel Ball", emoji: "⚙️", density: 7800 },
  { id: "cork", label: "Cork", emoji: "🍾", density: 120 },
  { id: "stone", label: "Stone", emoji: "🪨", density: 2500 },
];

interface ObjectSelectorProps {
  selected: LabObject;
  onSelect: (obj: LabObject) => void;
}

const ObjectSelector = ({ selected, onSelect }: ObjectSelectorProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">Drop an object</span>
      <div className="grid grid-cols-4 gap-2">
        {labObjects.map((obj) => (
          <motion.button
            key={obj.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(obj)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors cursor-pointer ${
              selected.id === obj.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="text-xl">{obj.emoji}</span>
            <span className="text-[10px] font-medium text-foreground leading-tight text-center">
              {obj.label}
            </span>
            <span className="text-[9px] text-muted-foreground">{obj.density} kg/m³</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ObjectSelector;
