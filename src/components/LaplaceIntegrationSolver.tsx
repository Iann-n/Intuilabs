"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MathTerm {
  sign: string;
  coeffNum: string;
  coeffDen: string;
  expK: string;
}

export default function LaplaceIntegrationSolver({ 
  globalFunc = "sin(3t) + cos(t)", 
  isDarkMode,
  stage = 1
}: { 
  globalFunc?: string; 
  isDarkMode: boolean;
  stage?: number;
}) {
  const safeFunc = globalFunc || "";
  const[fractions, setFractions] = useState<{sign: string, num: string, den: string}[]>([]);
  const[mathTerms, setMathTerms] = useState<MathTerm[]>([]);
  const[hasError, setHasError] = useState(false);

  const mathFont = { fontFamily: "'Times New Roman', Times, serif", fontWeight: 400, fontStyle: "normal" };

  useEffect(() => {
    if (safeFunc.trim() === '') { setHasError(true); return; }

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

    let terms = extractTerms(safeFunc);
    if (!terms) { setHasError(true); return; }

    let parsedFractions =[];
    let parsedTerms: MathTerm[] =[];
    let err = false;

    for (let t of terms) {
      let sign = t.startsWith('-') ? '-' : '+';
      let body = t.replace(/^[+-]/, '');

      let sinM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sin\(([+-]?[\d\.]*)t\)$/);
      if (sinM) {
        let A = sinM[1] || "1"; let wStr = sinM[2]; if (wStr === '' || wStr === '+' || wStr === '-') wStr += '1'; let w = parseFloat(wStr);
        let wAbs = Math.abs(w); let jW = wAbs === 1 ? 'j' : `j${wAbs}`;
        let expPos = w > 0 ? jW : `-${jW}`; let expNeg = w > 0 ? `-${jW}` : jW;
        
        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2j', expK: expPos });
        parsedTerms.push({ sign: sign === '+' ? '-' : '+', coeffNum: A, coeffDen: '2j', expK: expNeg });
        parsedFractions.push({ sign, num: `${parseFloat(A) * w}`, den: `s² + ${w * w}` }); continue;
      }
      
      let cosM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cos\(([+-]?[\d\.]*)t\)$/);
      if (cosM) {
        let A = cosM[1] || "1"; let wStr = cosM[2]; if (wStr === '' || wStr === '+' || wStr === '-') wStr += '1'; let w = parseFloat(wStr);
        let wAbs = Math.abs(w); let jW = wAbs === 1 ? 'j' : `j${wAbs}`;
        let expPos = w > 0 ? jW : `-${jW}`; let expNeg = w > 0 ? `-${jW}` : jW;

        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2', expK: expPos });
        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2', expK: expNeg });
        parsedFractions.push({ sign, num: `${A === '1' ? 's' : A + 's'}`, den: `s² + ${w * w}` }); continue;
      }
      
      let sinhM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sinh\(([+-]?[\d\.]*)t\)$/);
      if (sinhM) {
        let A = sinhM[1] || "1"; let wStr = sinhM[2]; if (wStr === '' || wStr === '+' || wStr === '-') wStr += '1'; let w = parseFloat(wStr);
        let wAbs = Math.abs(w); let wFmt = wAbs === 1 ? '1' : `${wAbs}`;
        let expPos = w > 0 ? wFmt : `-${wFmt}`; let expNeg = w > 0 ? `-${wFmt}` : wFmt;

        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2', expK: expPos });
        parsedTerms.push({ sign: sign === '+' ? '-' : '+', coeffNum: A, coeffDen: '2', expK: expNeg });
        parsedFractions.push({ sign, num: `${parseFloat(A) * w}`, den: `s² - ${w * w}` }); continue;
      }
      
      let coshM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cosh\(([+-]?[\d\.]*)t\)$/);
      if (coshM) {
        let A = coshM[1] || "1"; let wStr = coshM[2]; if (wStr === '' || wStr === '+' || wStr === '-') wStr += '1'; let w = parseFloat(wStr);
        let wAbs = Math.abs(w); let wFmt = wAbs === 1 ? '1' : `${wAbs}`;
        let expPos = w > 0 ? wFmt : `-${wFmt}`; let expNeg = w > 0 ? `-${wFmt}` : wFmt;

        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2', expK: expPos });
        parsedTerms.push({ sign, coeffNum: A, coeffDen: '2', expK: expNeg });
        parsedFractions.push({ sign, num: `${A === '1' ? 's' : A + 's'}`, den: `s² - ${w * w}` }); continue;
      }
      
      let expM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?e\^([+-]?[\w\.]*)t$/);
      if (expM) {
        let A = expM[1] || "1"; let aStr = expM[2]; if (aStr === '+') aStr = '';
        if (aStr === '') aStr = '1'; if (aStr === '-') aStr = '-1';
        
        parsedTerms.push({ sign, coeffNum: A, coeffDen: '1', expK: aStr });

        let den = '';
        if (aStr === '1') den = 's - 1'; else if (aStr === '-1') den = 's + 1'; else if (aStr.startsWith('-')) den = `s + ${aStr.substring(1)}`; else den = `s - ${aStr}`;
        parsedFractions.push({ sign, num: `${A}`, den }); continue;
      }
      
      let cM = body.match(/^(\d+(?:\.\d+)?)$/);
      if (cM) {
        parsedTerms.push({ sign, coeffNum: cM[1], coeffDen: '1', expK: '0' });
        parsedFractions.push({ sign, num: `${cM[1]}`, den: `s` }); continue;
      }
      
      err = true; break;
    }

    setHasError(err);
    if (!err) {
      if (parsedFractions.length > 0 && parsedFractions[0].sign === '+') parsedFractions[0].sign = '';
      setFractions(parsedFractions);
      setMathTerms(parsedTerms);
    }
  }, [safeFunc]);

  const formatSMinusK = (k: string) => {
    if (k === '0') return 's';
    if (k === '1') return 's - 1';
    if (k === '-1') return 's + 1';
    if (k.startsWith('-')) return `s + ${k.substring(1)}`;
    return `s - ${k}`;
  };

  const textColor = isDarkMode ? "text-slate-200" : "text-slate-800";
  const mutedColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-300";

  return (
    // SCROLL FIX: Removed `items-center` from the parent and added `py-12` padding.
    <div className="absolute inset-0 overflow-y-auto flex justify-center py-12 px-4 custom-scrollbar">
      
      {/* SCROLL FIX: Added `my-auto` to dynamically center it without breaking the scroll bounds */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-[850px] my-auto p-8 rounded-2xl border ${borderColor} ${isDarkMode ? 'bg-slate-900/80 shadow-[0_0_40px_rgba(34,211,238,0.05)]' : 'bg-white shadow-xl'} flex flex-col gap-6`}>
        
        <div className="text-center mb-2 mt-4">
          <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>Solving the Integral</h3>
          <p className={mutedColor}>Transforming <code className={`px-2 py-1 rounded font-mono border ${isDarkMode ? 'bg-black/20 text-cyan-500 border-slate-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>f(t) = {safeFunc}</code></p>
        </div>

        {hasError ? (
          <div className="p-8 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-center font-mono">
            ⚠️ Unable to integrate. Please ensure the function is valid.
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Stage 1: Multiplying with e^-st */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`p-6 rounded-xl border ${isDarkMode ? 'bg-black/40 border-slate-700' : 'bg-slate-50 border-slate-300'} overflow-x-auto custom-scrollbar`}>
              <span className={`text-xs tracking-widest uppercase font-bold mb-4 block ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>1. Multiplying with e<sup className="text-[10px]">-st</sup></span>
              
              <div className={`flex flex-col gap-5 items-center justify-center font-mono text-lg md:text-xl min-w-max px-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                
                {/* 1A: Setup */}
                <div className="flex items-center">
                  <span className={`mr-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>ℒ{'{'}f(t){'}'} =</span>
                  <div className={`flex flex-col items-center justify-center mr-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className={`text-xl leading-none mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} style={mathFont}>∞</span>
                    <span className={`text-5xl leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} style={mathFont}>∫</span>
                    <span className={`text-sm leading-none mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`} style={mathFont}>0</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>[</span>
                    <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{safeFunc}</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>]</span>
                    <span className={`ml-2 font-bold ${isDarkMode ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-blue-500'}`}>e<sup className="text-sm">-st</sup></span>
                    <span className={`ml-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>dt</span>
                  </div>
                </div>

                <div className={`text-sm italic font-sans ${mutedColor}`}>which expands to its exponential ingredients:</div>

                {/* 1B: Expanded */}
                <div className="flex items-center">
                  <span className="mr-4 text-transparent">ℒ{'{'}f(t){'}'} =</span>
                  <div className={`flex flex-col items-center justify-center mr-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className={`text-xl leading-none mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} style={mathFont}>∞</span>
                    <span className={`text-5xl leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} style={mathFont}>∫</span>
                    <span className={`text-sm leading-none mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`} style={mathFont}>0</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>[</span>
                    <span className="flex items-center gap-1">
                      {mathTerms.map((term, idx) => {
                        const showSign = idx > 0 || term.sign === '-';
                        const k = term.expK === '1' ? 't' : term.expK === '-1' ? '-t' : term.expK === '0' ? '' : `${term.expK}t`;
                        return (
                          <span key={idx} className={`flex items-center ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {showSign && <span className={`mx-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{term.sign}</span>}
                            <span className="flex flex-col items-center justify-center text-[0.8em]">
                              {term.coeffDen !== '1' ? (
                                <>
                                  <span className="border-b border-current leading-none pb-0.5 mb-0.5">{term.coeffNum}</span>
                                  <span className="leading-none">{term.coeffDen}</span>
                                </>
                              ) : term.coeffNum !== '1' ? (
                                <span className="leading-none">{term.coeffNum}</span>
                              ) : null}
                            </span>
                            {k !== '' && <span className="ml-0.5">e<sup className="text-[0.8em]">{k}</sup></span>}
                          </span>
                        );
                      })}
                    </span>
                    <span className={`ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>]</span>
                    <span className={`ml-2 font-bold ${isDarkMode ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-blue-500'}`}>e<sup className="text-sm">-st</sup></span>
                    <span className={`ml-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>dt</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stage 2: Solving (Reveals on Scroll) */}
            <AnimatePresence>
              {stage >= 2 && (
                <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} className={`p-6 rounded-xl border mt-4 overflow-hidden overflow-x-auto custom-scrollbar ${isDarkMode ? 'bg-slate-800/80 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.05)]' : 'bg-pink-50/50 border-pink-200 shadow-sm'}`}>
                  
                  <span className={`text-xs tracking-widest uppercase font-bold mb-6 block ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>2. Evaluating to Infinity</span>
                  
                  <div className={`flex flex-col gap-6 items-start font-mono text-lg md:text-xl min-w-max mx-auto px-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    
                    {/* 2A: The Anti-Derivative Bounds */}
                    <div className="flex items-center">
                      <span className={`mr-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>=</span>
                      <div className={`flex flex-col items-center justify-center mr-4 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                        <span className="text-lg leading-none" style={mathFont}>lim</span>
                        <span className="text-xs leading-none mt-1 tracking-wider" style={mathFont}>a → ∞</span>
                      </div>
                      
                      <span className={`text-5xl font-light mx-2 mr-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>[</span>
                      <div className="flex items-center gap-1">
                        {mathTerms.map((term, idx) => {
                          const integratedSign = term.sign === '+' ? '-' : '+';
                          const showSign = idx > 0 || integratedSign === '-';
                          const sMinusK = formatSMinusK(term.expK);
                          let den = term.coeffDen === '1' ? `(${sMinusK})` : `${term.coeffDen}(${sMinusK})`;
                          return (
                            <span key={idx} className={`flex items-center ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>
                              {showSign && <span className={`mx-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{integratedSign}</span>}
                              <span className="flex flex-col items-center justify-center text-[0.85em]">
                                <span className="border-b border-current leading-none pb-0.5 mb-0.5 px-1">{term.coeffNum}</span>
                                <span className="leading-none">{den}</span>
                              </span>
                              <span className={`ml-1 ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>e<sup className={`text-[0.7em] ${isDarkMode ? 'text-cyan-200' : 'text-blue-400'}`}>-{sMinusK === 's' ? 'st' : `(${sMinusK})t`}</sup></span>
                            </span>
                          )
                        })}
                      </div>
                      <span className={`text-5xl font-light mx-2 ml-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>]</span>
                      
                      <div className="flex flex-col justify-between h-12 ml-1" style={mathFont}>
                        <span className={`text-sm ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>a</span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>0</span>
                      </div>
                    </div>

                    {/* 2B: Plugging in Limits (0 - ...) */}
                    <div className="flex items-center">
                      <span className={`mr-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>=</span>
                      <span className={`text-3xl mx-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(</span>
                      <span className={`px-2 text-2xl ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} style={mathFont}>0</span>
                      <span className={`text-3xl mx-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>)</span>
                      
                      <span className={`text-3xl mx-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>-</span>
                      
                      <span className={`text-4xl font-light mx-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(</span>
                      <div className="flex items-center gap-1">
                        {mathTerms.map((term, idx) => {
                          const integratedSign = term.sign === '+' ? '-' : '+';
                          const showSign = idx > 0 || integratedSign === '-';
                          const sMinusK = formatSMinusK(term.expK);
                          let den = term.coeffDen === '1' ? `(${sMinusK})` : `${term.coeffDen}(${sMinusK})`;
                          return (
                            <span key={idx} className={`flex items-center ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>
                              {showSign && <span className={`mx-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{integratedSign}</span>}
                              <span className="flex flex-col items-center justify-center text-[0.85em]">
                                <span className="border-b border-current leading-none pb-0.5 mb-0.5 px-1">{term.coeffNum}</span>
                                <span className="leading-none">{den}</span>
                              </span>
                            </span>
                          )
                        })}
                      </div>
                      <span className={`text-4xl font-light mx-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>)</span>
                    </div>

                    <div className={`w-full h-px my-2 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-300'}`}></div>

                    {/* 2C: Final Result */}
                    <div className="flex items-center w-full">
                      <span className={`mr-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>=</span>
                      <div className={`flex flex-wrap items-center gap-4 font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {fractions.map((f, i) => (
                          <div key={i} className="flex items-center gap-4">
                            { (i > 0 || f.sign === '-') && <span className={`font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{f.sign}</span> }
                            <div className="flex flex-col items-center">
                              <span className={`border-b-2 pb-1 mb-1 px-3 ${isDarkMode ? 'border-emerald-500/50' : 'border-emerald-400'}`}>{f.num}</span>
                              <span>{f.den}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </motion.div>
    </div>
  );
}