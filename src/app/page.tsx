"use client";

import { useState } from "react";
import { UploadCloud, Sparkles, FileScan } from "lucide-react";
import LessonLayout from "@/components/LessonLayout";

export default function Home() {
  const [appState, setAppState] = useState<"idle" | "generating" | "lesson">("idle");
  const [lessonData, setLessonData] = useState<any>(null);
  const [inputText, setInputText] = useState("");

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setAppState("generating");
    
    // page.tsx calls the API route, and the API route calls generateLesson()
    // User
    //   ↓
    // page.tsx
    //   ↓
    // POST /api/generate-lesson
    
    try {
      const response = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: inputText })
      });

      if (!response.ok) {

      const text =
        await response.text();

      console.error(
        "API Error:",
        response.status,
        text
      );

      throw new Error(
        `API returned ${response.status}`
      );
    }

    const data =
      await response.json();
      setLessonData(data);
      setAppState("lesson");

    } catch (error) {
      console.error("Error generating lesson:", error);
      setAppState("idle");
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setLessonData(null);
    setInputText("");
  };

  // --- OUTPUT ENGINE: Render the Lesson ---
  if (appState === "lesson" && lessonData) {
    return <LessonLayout lessonData={lessonData} onReset={handleReset} />;
  }

  // --- INPUT ENGINE: Render the Dropzone / Landing Page ---
  return (
    <div className="min-h-screen bg-[#0F111A] text-slate-200 flex flex-col items-center justify-center p-8 font-sans selection:bg-cyan-500/30">
      
      {/* Brand Header */}
      <div className="absolute top-10 left-12 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-2xl font-bold tracking-wide">Intui<span className="text-cyan-400">Labs</span></span>
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-bold text-center mb-6 leading-tight">
          Learn anything under the sun.<br/>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">In under 30 minutes.</span>
        </h1>
        <p className="text-slate-400 text-center mb-12 text-lg">
          Drop a screenshot of a textbook, an equation, or type a concept. Our AI agents will instantly generate an interactive, Brilliant-tier lesson.
        </p>

        {appState === "idle" ? (
          <form onSubmit={handleGenerate} className="w-full flex flex-col items-center gap-6">
            
            {/* The Dropzone */}
            <div className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all duration-300">
                <UploadCloud size={32} className="text-slate-400 group-hover:text-cyan-400" />
              </div>
              <span className="text-lg font-medium text-slate-300">Drag & drop a screenshot here</span>
              <span className="text-sm text-slate-500 mt-2">or paste an image from your clipboard</span>
            </div>

            <div className="flex items-center w-full gap-4 opacity-50">
              <div className="h-px flex-1 bg-slate-700"></div>
              <span className="text-sm font-mono tracking-widest uppercase">OR</span>
              <div className="h-px flex-1 bg-slate-700"></div>
            </div>

            {/* The Concept Input */}
            <div className="w-full relative flex items-center p-2 rounded-2xl border bg-slate-900/80 border-slate-700 shadow-xl focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., Explain the Laplace Transform of sinh(2t)"
                className="flex-1 bg-transparent px-4 py-3 outline-none font-sans text-lg text-slate-200 placeholder-slate-500"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="px-8 py-3 rounded-xl font-bold tracking-wide transition-all bg-cyan-500 hover:bg-cyan-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </div>
          </form>
        ) : (
          /* The Loading / Agent Workflow State */
          <div className="w-full p-8 rounded-3xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileScan size={24} className="text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-200">Processing Input...</h3>
              <div className="text-sm text-cyan-400 font-mono flex items-center gap-2">
                <span className="animate-pulse">▶</span>
                <span className="typing-animation">Routing to Signal Processing Engine...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}