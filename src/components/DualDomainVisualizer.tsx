"use client";

import GraphRenderer from "./renderers/GraphRenderer";
import SandboxRenderer from "./renderers/SandboxRenderer";
import SolverRenderer from "./renderers/SolverRenderer";
import DiagramRenderer from "./renderers/DiagramRenderer";
import AnimationRenderer from "./renderers/AnimationRenderer";
import SimulationRenderer from "./renderers/SimulationRenderer";
import { VisualizerState } from "@/lib/schema/lesson";

export type { VisualizerState };

export default function DualDomainVisualizer({
  currentState,
  isDarkMode,
  globalFunc,
  setGlobalFunc,
  callouts = []
}: {
  currentState: VisualizerState;
  isDarkMode: boolean;
  globalFunc: string;
  setGlobalFunc: (value: string) => void;
  callouts?: { label: string; description: string }[];
}) {

  const renderEngine = () => {

    switch (currentState.type) {

      case "plot":
        return (
          <GraphRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
          />
        );

      case "sandbox":
        return (
          <SandboxRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
            setGlobalFunc={setGlobalFunc}
          />
        );

      case "solver":
        return (
          <SolverRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
          />
        );

      case "diagram":
        return (
          <DiagramRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
          />
        );

      case "animation":
        return (
          <AnimationRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
          />
        );

      case "simulation":
        return (
          <SimulationRenderer
            spec={currentState}
            isDarkMode={isDarkMode}
            globalFunc={globalFunc}
          />
        );

      default:
        return (
          <div className="text-slate-500 font-mono text-sm">
            Unsupported visualization type: {currentState.type}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderEngine()}

      {callouts.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 pointer-events-none">
          {callouts.map((callout) => (
            <div
              key={callout.label}
              className="rounded-xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md px-4 py-3 shadow-lg"
            >
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
                {callout.label}
              </span>
              <p className="text-slate-300 text-sm mt-1">
                {callout.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
