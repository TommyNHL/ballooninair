import { useState } from "react";
import { motion } from "framer-motion";
import TemperatureSlider from "@/components/TemperatureSlider";
import FluidTank from "@/components/FluidTank";
import DensityGraph from "@/components/DensityGraph";
import ObjectSelector, { labObjects, type LabObject } from "@/components/ObjectSelector";

const Index = () => {
  const [temperature, setTemperature] = useState(20);
  const [selectedObject, setSelectedObject] = useState<LabObject>(labObjects[3]); // ice
  const [activeTab, setActiveTab] = useState<"air" | "freshwater" | "saltwater">("freshwater");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              🔬 Density & Buoyancy Lab
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore how temperature affects density, and whether objects float or sink
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Simulation */}
          <div className="space-y-5">
            {/* Medium tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
              {(["air", "freshwater", "saltwater"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveTab(m)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "air" ? "🌬️ Air" : m === "freshwater" ? "💧 Fresh Water" : "🌊 Salt Water"}
                </button>
              ))}
            </div>

            {/* Tank */}
            <motion.div layout>
              <FluidTank
                temperature={temperature}
                medium={activeTab}
                objectDensity={selectedObject.density}
                objectLabel={selectedObject.label}
                objectEmoji={selectedObject.emoji}
              />
            </motion.div>

            {/* Graph */}
            <DensityGraph temperature={temperature} medium={activeTab} />

            {/* Info card */}
            <motion.div
              className="bg-card rounded-xl border border-border p-4 text-sm text-muted-foreground space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-heading font-semibold text-foreground">💡 How it works</h4>
              <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
                <li><strong>Heating a fluid</strong> makes molecules move faster and spread apart → density decreases</li>
                <li><strong>Cooling a fluid</strong> makes molecules pack tighter → density increases</li>
                <li>An object <strong>floats</strong> when its density is less than the surrounding medium</li>
                <li><strong>Salt water</strong> is denser than fresh water, so more objects float in it</li>
                <li><strong>Water is special:</strong> maximum density at 4°C — ice floats because it's less dense!</li>
              </ul>
            </motion.div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-4 space-y-5 sticky top-4">
              <h3 className="font-heading text-base font-semibold text-foreground">Controls</h3>
              
              <TemperatureSlider
                temperature={temperature}
                onChange={setTemperature}
                min={-20}
                max={100}
                label="Medium Temperature"
              />

              <ObjectSelector
                selected={selectedObject}
                onSelect={setSelectedObject}
              />

              {/* Quick info */}
              <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Object density:</span>
                  <span className="font-semibold text-foreground">{selectedObject.density} kg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-semibold text-foreground">{temperature}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
