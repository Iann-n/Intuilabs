"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import DualDomainVisualizer from "./DualDomainVisualizer";
import { Sun, Moon, ArrowLeft } from "lucide-react"; 
import { getGoldenLesson } from "@/lib/golden-lesson"; // Importing your masterpiece!

export default function LessonLayout({ 
  lessonData, 
  onReset 
}: { 
  lessonData: { 
    topic: string; 
    function?: string; // <--- 1. ADD THIS LINE
    textContent?: { [key: string]: string }; 
  } | null; 
  onReset: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Use the topic passed from the Dropzone Landing Page
   const [globalFunc, setGlobalFunc] = useState(lessonData?.function || "sin(3t) + cos(t)");

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // DYNAMIC MATH PARSER
  const parsedData = useMemo(() => {
    let clean = globalFunc.toLowerCase().replace(/\s+/g, '').replace(/cost/g, 'cos(t)').replace(/sint/g, 'sin(t)');
    let rawTerms = clean.match(/[+-]?[^+-]+/g) || [];
    let fractions = [];
    let poles =[];
    
    for (let term of rawTerms) {
      let sign = term.startsWith('-') ? '-' : '+';
      let body = term.replace(/^[+-]/, '');

      let sinM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sin\(([+-]?[\d\.]*)t\)$/);
      if(sinM) {
         let A = parseFloat(sinM[1] || "1"); let w = parseFloat(sinM[2]||"1");
         fractions.push({ sign, num: `${A*w}`, den: `s² + ${w*w}`, rawDen: `s² + ${w*w}` });
         poles.push(`±${w}j`); continue;
      }
      let cosM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cos\(([+-]?[\d\.]*)t\)$/);
      if(cosM) {
         let A = parseFloat(cosM[1] || "1"); let w = parseFloat(cosM[2]||"1");
         fractions.push({ sign, num: `${A===1?'s':A+'s'}`, den: `s² + ${w*w}`, rawDen: `s² + ${w*w}` });
         poles.push(`±${w}j`); continue;
      }
      let sinhM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sinh\(([+-]?[\d\.]*)t\)$/);
      if(sinhM) {
         let A = parseFloat(sinhM[1] || "1"); let w = parseFloat(sinhM[2]||"1");
         fractions.push({ sign, num: `${A*w}`, den: `s² - ${w*w}`, rawDen: `s² - ${w*w}` });
         poles.push(`±${w}`); continue;
      }
      let coshM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cosh\(([+-]?[\d\.]*)t\)$/);
      if(coshM) {
         let A = parseFloat(coshM[1] || "1"); let w = parseFloat(coshM[2]||"1");
         fractions.push({ sign, num: `${A===1?'s':A+'s'}`, den: `s² - ${w*w}`, rawDen: `s² - ${w*w}` });
         poles.push(`±${w}`); continue;
      }
      let expM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?e\^([+-]?[\w\.]*)t$/);
      if (expM) {
         let A = expM[1] || "1"; let aStr = expM[2] || "1"; if (aStr==='+') aStr='1'; if (aStr==='-') aStr='-1';
         let den = aStr.startsWith('-') ? `s + ${aStr.substring(1)}` : `s - ${aStr}`;
         fractions.push({ sign, num: A, den, rawDen: den });
         poles.push(aStr); continue;
      }
      let cM = body.match(/^(\d+(?:\.\d+)?)$/);
      if (cM) {
         fractions.push({ sign, num: cM[1], den: `s`, rawDen: 's' });
         poles.push("0"); continue;
      }
    }
    if(fractions.length > 0 && fractions[0].sign === '+') fractions[0].sign = '';
    return { fractions, poles: Array.from(new Set(poles)) }; 
  }, [globalFunc]);

const currentLesson = useMemo(() => {
    return getGoldenLesson(
      lessonData?.topic || "Laplace Transform", // 3. CHANGE THIS to pass the English topic
      parsedData,              // Calculated Math Data
      isDarkMode,              // Theme State
      globalFunc,              // The pure math string
      lessonData?.textContent  // The Text Payload from Supabase!
    );
  }, [globalFunc, parsedData, isDarkMode, lessonData]);

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${isDarkMode ? "dark bg-[#0F111A] text-slate-200" : "bg-white text-slate-800"}`}>
      
      {/* LEFT COLUMN: The Scrollytelling Narrative */}
      <div className={`w-[35%] h-full overflow-y-auto p-12 border-r ${isDarkMode ? "border-slate-800" : "border-slate-200"} scrollbar-hide`}>
        <div className="flex justify-between items-start mb-24">
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight pr-4">
            {currentLesson.title}
          </h1>
          
          {/* Top Right Controls */}
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={onReset}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              title="Back to Upload">
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? "bg-slate-800 border border-slate-700 text-yellow-400 hover:bg-slate-700 hover:border-yellow-400/50" : "bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:border-blue-400"}`}
              aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        
        <div className="space-y-[60vh] pb-[50vh]">
          {/* Explicitly type step to 'any' and index to 'number' to satisfy TypeScript */}
          {currentLesson.steps.map((step: any, index: number) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0.3 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-50% 0px -50% 0px" }}
              onViewportEnter={() => setActiveStep(step.id)}
              className="text-lg leading-relaxed transition-colors duration-500"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-6 border font-bold ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-600"}`}>
                {index + 1}
              </div>
              {step.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: The Visualizer Engine */}
      <div className={`w-[65%] h-full relative flex items-center justify-center ${isDarkMode ? "bg-[#090a0f]" : "bg-slate-100"}`}>
        <DualDomainVisualizer 
          currentState={currentLesson.steps[activeStep].ui_state} 
          isDarkMode={isDarkMode} 
          globalFunc={globalFunc}
          setGlobalFunc={setGlobalFunc}
        />
      </div>

    </div>
  );
}