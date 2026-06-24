"use client";

import { motion } from "framer-motion";
import * as d3 from "d3";
import ComplexExponentialSandbox from "./ComplexExponentialSandbox"; 
import SPlane3DVisualizer from "./SPlane3DVisualizer";
import LaplaceIntegrationSolver from "./LaplaceIntegrationSolver";

interface EngineState {
  view: string;
  s_value?: number; 
  stage?: number; // ADDED THIS SO STAGE 2 PASSES THROUGH!
}

export default function DualDomainVisualizer({ 
  currentState, 
  isDarkMode,
  globalFunc,
  setGlobalFunc
}: { 
  currentState: EngineState, 
  isDarkMode: boolean,
  globalFunc: string,
  setGlobalFunc: (val: string) => void
}) {
  
  // --- ROUTE 1: The New 3D S-Plane View ---
  if (currentState.view === "SPlane") {
    return <SPlane3DVisualizer isDarkMode={isDarkMode} globalFunc={globalFunc} />;
  }

  // --- ROUTE 2: The Integration Solver (Math Steps) ---
  if (currentState.view === "Integration") {
    // PASSING THE STAGE PROP FIXES THE ISSUE WHERE THE ANSWER WOULD DISAPPEAR
    return <LaplaceIntegrationSolver isDarkMode={isDarkMode} globalFunc={globalFunc} stage={currentState.stage} />;
  }

  // --- ROUTE 3A: The Anatomy Lab (Sliders Only) ---
  if (currentState.view === "Anatomy") {
    return <ComplexExponentialSandbox isDarkMode={isDarkMode} viewMode="anatomy" globalFunc={globalFunc} setGlobalFunc={setGlobalFunc} />;
  }

  // --- ROUTE 3B: The Decomposer Lab (Input Only) ---
  if (currentState.view === "Decomposer") {
    return <ComplexExponentialSandbox isDarkMode={isDarkMode} viewMode="decomposer" globalFunc={globalFunc} setGlobalFunc={setGlobalFunc} />;
  }

  // --- ROUTE 4: The Original Premium 2D Graph ---
  if (currentState.view === "2D") {
    const s = currentState.s_value || 0;
    
    const data = [];
    for (let t = 0; t <= 10; t += 0.1) {
      let value = Math.exp((2 - s) * t) * Math.sin(5 * t);
      
      // Guard 1: Handle NaN or Infinity values gracefully before mapping
      if (isNaN(value) || !isFinite(value)) {
        value = 0;
      }
      
      data.push({ t, value: Math.max(Math.min(value, 100), -100) });
    }

    const width = 600; const height = 400;
    const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-20, 20]).range([height, 0]);

    const lineGenerator = d3.line<{t: number, value: number}>()
      .x(d => xScale(d.t))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
      
    // Guard 2: Ensure pathD defaults to an empty line command if D3 drops out
    const rawPath = lineGenerator(data);
    const pathD = (!rawPath || rawPath.includes("NaN") || rawPath === "undefined") 
      ? "M 0 200 L 600 200" // Renders a flat, stable center-line fallback
      : rawPath;

    return (
      <div className="relative w-[600px] h-[400px]">
        <div 
          className={`absolute inset-0 border rounded-xl pointer-events-none ${isDarkMode ? "border-slate-700/50" : "border-slate-300/50"}`}
          style={{ backgroundImage: isDarkMode ? 'radial-gradient(circle at center, transparent 0%, #0F111A 100%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)' : 'radial-gradient(circle at center, transparent 0%, #FFFFFF 100%), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '100% 100%, 40px 40px, 40px 40px' }} 
        />
        <svg width={width} height={height} className="overflow-visible">
          <line x1={0} y1={height/2} x2={width} y2={height/2} stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="2" strokeDasharray="4 4" />
          <motion.path 
            key={`path-s-value-${s.toFixed(1)}`}
            d={pathD || "M 0 200 L 600 200"} 
            fill="none" 
            stroke={isDarkMode ? "#22d3ee" : "#0ea5e9"} 
            strokeWidth="3" 
            style={{ filter: `drop-shadow(0px 0px 8px rgba(${isDarkMode ? '34, 211, 238, 0.6' : '14, 165, 233, 0.6'}))` }} 
            
            // CRITICAL FIX: FORCING A STRING FALLBACK HERE KILLS THE ASYNC UNDEFINED INJECTION
            animate={{ d: pathD || "M 0 200 L 600 200" }} 
            
            transition={{ type: "spring", stiffness: 40, damping: 15 }} 
          />
        </svg>
        <div className={`absolute bottom-4 right-4 backdrop-blur-md px-4 py-2 rounded-lg border font-mono ${isDarkMode ? "bg-slate-900/80 border-slate-700 text-cyan-400" : "bg-white/80 border-slate-300 text-sky-600"}`}>
          s = {s.toFixed(1)}
        </div>
      </div>
    );
  }
}