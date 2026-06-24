"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

export default function ComplexExponentialSandbox({ 
  isDarkMode, 
  globalFunc = "sin(3t) + cos(t)", 
  setGlobalFunc = () => {},
  viewMode = 'anatomy' 
}: { 
  isDarkMode: boolean; 
  globalFunc?: string; 
  setGlobalFunc?: (val: string) => void;
  viewMode?: 'anatomy' | 'decomposer';
}) {
  const [sigma, setSigma] = useState(0.2); 
  const [omega, setOmega] = useState(5);
  const [decomposedResult, setDecomposedResult] = useState<{ terms: string[], error: boolean }>({ terms:[], error: false });

  const safeFunc = globalFunc || "";

  // --- 1. STRING PRE-PROCESSOR ---
  const extractTerms = (input: string) => {
    let clean = input.toLowerCase().replace(/\s+/g, '')
      .replace(/cosht/g, 'cosh(t)').replace(/sinht/g, 'sinh(t)')
      .replace(/cost/g, 'cos(t)').replace(/sint/g, 'sin(t)')
      .replace(/\^\-/g, '^~').replace(/\(\-/g, '(~')  
      .replace(/\^\+/g, '^@').replace(/\(\+/g, '(@'); 

    let rawTerms = clean.match(/[+-]?[^+-]+/g);
    if (!rawTerms) return null;
    return rawTerms.map(t => t.replace(/\~/g, '-').replace(/\@/g, '+'));
  };

  // --- 2. DECOMPOSER PARSER ---
  useEffect(() => {
    if (viewMode !== 'decomposer') return;
    if (safeFunc.trim() === '') { setDecomposedResult({ terms:[], error: false }); return; }
    
    const parseDecomposition = (input: string) => {
      let terms = extractTerms(input);
      if (!terms) return { terms: [], error: true };
      let results = [];
      for (let term of terms) {
        let sign = term.startsWith('-') ? '-' : '+';
        let body = term.replace(/^[+-]/, '');

        let sinhMatch = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sinh\(([+-]?[\d\.]*)t\)$/);
        if (sinhMatch) {
          let A = sinhMatch[1] || "1"; let wStr = sinhMatch[2] || "";
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2)e^{${wStr}t}`);
          results.push(`${sign === '-' ? '+' : '-'}${A === "1" ? "" : A}(1/2)e^{-${wStr}t}`);
          continue;
        }
        let coshMatch = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cosh\(([+-]?[\d\.]*)t\)$/);
        if (coshMatch) {
          let A = coshMatch[1] || "1"; let wStr = coshMatch[2] || "";
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2)e^{${wStr}t}`);
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2)e^{-${wStr}t}`);
          continue;
        }
        let sinMatch = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sin\(([+-]?[\d\.]*)t\)$/);
        if (sinMatch) {
          let A = sinMatch[1] || "1"; let wStr = sinMatch[2] || "";
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2j)e^{j${wStr}t}`);
          results.push(`${sign === '-' ? '+' : '-'}${A === "1" ? "" : A}(1/2j)e^{-j${wStr}t}`);
          continue;
        }
        let cosMatch = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cos\(([+-]?[\d\.]*)t\)$/);
        if (cosMatch) {
          let A = cosMatch[1] || "1"; let wStr = cosMatch[2] || "";
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2)e^{j${wStr}t}`);
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}(1/2)e^{-j${wStr}t}`);
          continue;
        }
        let eMatch = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?e\^([+-]?[\w\.]*)t$/);
        if (eMatch) {
          let A = eMatch[1] || "1"; let p = eMatch[2] || ""; if (p === '+') p = ''; 
          results.push(`${sign === '-' ? '-' : '+'}${A === "1" ? "" : A}e^{${p}t}`);
          continue;
        }
        let constMatch = body.match(/^(\d+(?:\.\d+)?)$/);
        if (constMatch) { results.push(`${sign === '-' ? '-' : '+'}${constMatch[1]}`); continue; }
        return { terms: ["Invalid function syntax"], error: true };
      }
      if (results.length > 0 && results[0].startsWith('+')) results[0] = results[0].substring(1);
      return { terms: results, error: false };
    };
    setDecomposedResult(parseDecomposition(safeFunc));
  }, [safeFunc, viewMode]);

  // --- 3. DYNAMIC DATA GENERATION ---
  const generateSData = () => {
    const timeData = []; const envelope = []; const complexData = [];
    let maxAbs = 2; 
    
    // Generates cleanly only when actively shown
    for (let t = 0; t <= 5; t += 0.05) {
      const envelopeVal = Math.exp(sigma * t); 
      const re = envelopeVal * Math.cos(omega * t); 
      const im = envelopeVal * Math.sin(omega * t);
      maxAbs = Math.max(maxAbs, Math.abs(re), Math.abs(im), envelopeVal);
      timeData.push({ t, value: re }); 
      envelope.push({ t, value: envelopeVal }); 
      complexData.push({ re: re, im: im });
    }
    return { timeData, envelope, complexData, viewBound: maxAbs * 1.1 };
  };

  const { timeData, envelope, complexData, viewBound } = generateSData();
  const hasError = decomposedResult.error;

  const vTimeW = 300, vTimeH = 130; const vCompW = 130, vCompH = 130;
  const xTime = d3.scaleLinear().domain([0, 5]).range([0, vTimeW]);
  const yTime = d3.scaleLinear().domain([-viewBound, viewBound]).range([vTimeH, 0]);
  const timeLineGen = d3.line<{ t: number, value: number }>().x(d => xTime(d.t)).y(d => yTime(d.value)).curve(d3.curveMonotoneX);
  const scaleComplex = d3.scaleLinear().domain([-viewBound, viewBound]).range([0, vCompW]);
  const complexLineGen = d3.line<{ re: number, im: number }>().x(d => scaleComplex(d.re)).y(d => scaleComplex(d.im)).curve(d3.curveCatmullRom);

  const pathTime = timeLineGen(timeData) || "M 0 0";
  const pathEnv1 = timeLineGen(envelope) || "M 0 0";
  const pathEnv2 = timeLineGen(envelope.map(d => ({ t: d.t, value: -d.value }))) || "M 0 0";
  const pathComplex = complexLineGen(complexData) || "M 0 0";

  const textColor = isDarkMode ? "text-slate-200" : "text-slate-800";
  const mutedColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-300";
  const gridColor = isDarkMode ? "#334155" : "#cbd5e1";

  return (
    <div className="absolute inset-0 overflow-y-auto flex justify-center py-12 px-4 custom-scrollbar">
      <div className={`w-full font-sans flex flex-col ${viewMode === 'decomposer' ? 'max-w-[700px]' : 'max-w-[600px]'} my-auto gap-4 pb-12`}>
        
        {/* --- MODE A: SLIDERS & PEDAGOGY --- */}
        {viewMode === 'anatomy' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            
            <div className={`p-5 rounded-2xl border ${borderColor} ${isDarkMode ? "bg-slate-900/50" : "bg-white"} shadow-xl transition-all duration-300`}>
              <div className="mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                  1. The Anatomy of <span className={`font-mono px-2 rounded border shadow-sm ${isDarkMode ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>s = σ + jω</span>
                </h3>
              </div>
              
              <div className="flex gap-3 mb-2">
                <div className={`relative flex-1 rounded-lg border shadow-inner flex items-center p-2 ${isDarkMode ? 'bg-black/20 border-slate-500/20' : 'bg-slate-100 border-slate-300'}`}>
                  <svg viewBox={`0 0 ${vTimeW} ${vTimeH}`} className="w-full h-auto overflow-visible">
                    <line x1={0} y1={vTimeH/2} x2={vTimeW} y2={vTimeH/2} stroke={gridColor} strokeDasharray="4 4" />
                    <line x1={0} y1={0} x2={0} y2={vTimeH} stroke={gridColor} />
                    <text x={vTimeW - 10} y={vTimeH/2 - 5} fontSize="10" fill={isDarkMode?"#94a3b8":"#475569"} className="font-mono italic">t</text>
                    <text x={5} y={10} fontSize="10" fill={isDarkMode?"#94a3b8":"#475569"} className="font-mono font-bold">Re[f(t)]</text>
                    
                    {/* ONLY RENDER THE MOVING PATHS IF WE ARE EXPLICITLY IN THE ANATOMY TAB */}
                    {viewMode === 'anatomy' && (
                      <>
                        <motion.path 
                          key="env1-path"
                          d={pathEnv1} 
                          fill="none" 
                          stroke={isDarkMode ? "#ec4899" : "#f43f5e"} 
                          strokeWidth="1" 
                          strokeDasharray="3 3" 
                          animate={{ d: pathEnv1 }} 
                        />
                        <motion.path 
                          key="env2-path"
                          d={pathEnv2} 
                          fill="none" 
                          stroke={isDarkMode ? "#ec4899" : "#f43f5e"} 
                          strokeWidth="1" 
                          strokeDasharray="3 3" 
                          animate={{ d: pathEnv2 }} 
                        />
                        <motion.path 
                          key="time-wave-path"
                          d={pathTime} 
                          fill="none" 
                          stroke={isDarkMode ? "#22d3ee" : "#0ea5e9"} 
                          strokeWidth="2" 
                          animate={{ d: pathTime }} 
                          transition={{ type: "spring", bounce: 0 }} 
                        />
                      </>
                    )}
                  </svg>
                </div>
                <div className={`relative w-[30%] rounded-lg border shadow-inner flex items-center justify-center p-2 ${isDarkMode ? 'bg-black/20 border-slate-500/20' : 'bg-slate-100 border-slate-300'}`}>
                  <svg viewBox={`0 0 ${vCompW} ${vCompH}`} className="w-full h-auto overflow-visible">
                    <line x1={0} y1={vCompH/2} x2={vCompW} y2={vCompH/2} stroke={gridColor} strokeDasharray="2 2" />
                    <line x1={vCompW/2} y1={0} x2={vCompW/2} y2={vCompH} stroke={gridColor} strokeDasharray="2 2" />
                    <text x={vCompW - 15} y={vCompH/2 - 4} fontSize="8" fill={isDarkMode?"#94a3b8":"#475569"} className="font-mono">Re</text>
                    <text x={vCompW/2 + 4} y={10} fontSize="8" fill={isDarkMode?"#94a3b8":"#475569"} className="font-mono">Im</text>
                    
                    {viewMode === 'anatomy' && (
                      <motion.path 
                        key="complex-spiral-path"
                        d={pathComplex} 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="2" 
                        animate={{ d: pathComplex }} 
                        transition={{ type: "spring", bounce: 0 }} 
                        style={{ filter: "drop-shadow(0px 0px 4px rgba(168, 85, 247, 0.6))" }}
                      />
                    )}
                    {viewMode === 'anatomy' && complexData.length > 0 && (
                      <motion.circle r="3" fill="#c084fc" initial={{ cx: scaleComplex(complexData[complexData.length-1].re), cy: scaleComplex(complexData[complexData.length-1].im) }} animate={{ cx: scaleComplex(complexData[complexData.length-1].re), cy: scaleComplex(complexData[complexData.length-1].im) }} transition={{ type: "spring", bounce: 0 }} />
                    )}
                  </svg>
                </div>
              </div>
            </div>

            <div className={`flex gap-4 p-5 rounded-2xl border ${borderColor} ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'} shadow-md`}>
              <div className="flex-1">
                <label className={`text-sm flex justify-between font-mono mb-2 ${mutedColor}`}><span className="text-pink-500">σ (Energy)</span> <span>{sigma.toFixed(2)}</span></label>
                <input type="range" min="-0.8" max="0.8" step="0.05" value={sigma} onChange={(e) => setSigma(parseFloat(e.target.value))} className="w-full h-2 accent-pink-500 cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className={`text-sm flex justify-between font-mono mb-2 ${mutedColor}`}><span className="text-cyan-500">jω (Bounce)</span> <span>{omega.toFixed(1)}</span></label>
                <input type="range" min="0" max="20" step="0.5" value={omega} onChange={(e) => setOmega(parseFloat(e.target.value))} className="w-full h-2 accent-cyan-500 cursor-pointer" />
              </div>
            </div>

          </motion.div>
        )}

        {/* --- MODE B: PURE DECOMPOSER --- */}
        {viewMode === 'decomposer' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl border ${borderColor} ${isDarkMode ? 'bg-slate-900/80 shadow-[0_0_30px_rgba(14,165,233,0.1)]' : 'bg-white shadow-xl'} flex flex-col items-center justify-center`}>
            
            <div className="mb-8 text-center">
              <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>
                The Function Decomposer
              </h3>
              <p className={`text-sm ${mutedColor}`}>
                Break any complex signal down into its exponential building blocks. <br/> Try <code className={`px-1.5 py-0.5 rounded border shadow-sm font-mono ${isDarkMode ? 'bg-black/30 text-sky-400 border-slate-700' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>sinh(2t)</code> or <code className={`px-1.5 py-0.5 rounded border shadow-sm font-mono ${isDarkMode ? 'bg-black/30 text-sky-400 border-slate-700' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>sin(3t) + cos(t)</code>.
              </p>
            </div>

            <div className={`w-full flex items-center gap-4 mb-8 p-4 rounded-xl border shadow-inner ${isDarkMode ? "bg-black/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-2xl font-mono ${mutedColor}`}>f(t) =</span>
              <input 
                type="text" 
                value={safeFunc} 
                onChange={(e) => setGlobalFunc(e.target.value)} 
                placeholder="e.g., sinh(3t) + cos(t)" 
                className={`flex-1 bg-transparent border-b-2 transition-colors duration-300 ${hasError ? "border-red-500 text-red-400 focus:border-red-400" : isDarkMode ? "border-sky-500 text-sky-400 focus:border-sky-300" : "border-blue-400 text-blue-600 focus:border-blue-500"} focus:outline-none text-2xl font-mono pb-2`}
              />
            </div>
            
            <div className={`w-full min-h-[160px] rounded-xl flex items-center justify-center p-6 transition-colors duration-300 shadow-inner ${hasError ? "bg-red-950/20 border border-red-500/30" : isDarkMode ? "bg-black/60 border border-slate-800" : "bg-slate-50 border border-slate-200"}`}>
              <AnimatePresence mode="wait">
                <motion.div key={safeFunc + (hasError ? "-err" : "-ok")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full text-center">
                  {hasError ? (
                    <div className="font-sans text-lg text-red-400 flex items-center justify-center gap-2">⚠️ {decomposedResult.error ? decomposedResult.terms[0] : "Invalid Function Syntax"}</div>
                  ) : decomposedResult.terms.length === 0 ? (
                    <span className="text-slate-500 text-lg font-sans italic">Type a function to decompose it...</span>
                  ) : (
                    <div className="text-xl md:text-3xl font-mono flex flex-col gap-5">
                      {decomposedResult.terms.map((term, i) => (
                        <span key={i} className={isDarkMode ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]" : "text-emerald-600 font-bold"}>
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}