// Let the browser know that this component run in the browser

"use client";

// useState stores changing data
// useEffect runs code after rendering
// useMemo caches expensive calculations
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import DualDomainVisualizer from "./DualDomainVisualizer";
import { Sun, Moon, ArrowLeft } from "lucide-react"; 
import { getGoldenLesson } from "@/lib/lesson/golden-lesson"; // Importing your masterpiece!
import { LessonPayload } from "@/lib/schema/lesson";

// lessonData and onReset are react props: read-only configuration objects used to pass data from a parent component down to a child component

// parameters are equivalent to typing:
// function LessonLayout(props) {
//     const lessonData = props.lessonData;
//     const onReset = props.onReset;
// }

export default function LessonLayout({ 
  lessonData, // lesson that another component already has
  onReset // when something is triggered, called whatever function the parent gives
}: { 
  lessonData: { 
    topic: string; 
    function?: string; 
    textContent?: LessonPayload; 
  } | null; 
  onReset: () => void;
}) {

  // Lesson hierachy:
  // LessonPayload
  //       │
  //       ▼
  // LessonLayout
  //       │
  //       ├── Keeps track of state
  //       ├── Chooses the current lesson step
  //       ├── Renders the narrative
  //       └── Sends the current visualization to DualDomainVisualizer

  // useState is a special persistent variable
  // [variable, function (automatically created by react)] = useState(initialising variable)
  const [activeStep, setActiveStep] = useState(0); // the first time this component render's initialize to 0.
  const [isDarkMode, setIsDarkMode] = useState(true); // means initially darkmode is true
  
  // Use the topic passed from the Dropzone Landing Page
   const [globalFunc, setGlobalFunc] = useState(lessonData?.function || "sin(3t) + cos(t)");

   // additional function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // second argument to useEffect is dependency array - react asks if value inside the array changes or not before executing the function
  // first argument is the function that react executes
  // second argument tells react when to execute it, empty dependency array means this effect depends on nothing
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Extract current lesson, lessonData is dependency array so it will change accordingly
const currentLesson = useMemo(() => {
  if (!lessonData?.textContent) return null;

  return getGoldenLesson(
    lessonData.textContent as LessonPayload
  );
}, [lessonData]);

if (!currentLesson) {
  return (
    <div className="flex h-screen items-center justify-center">
      Loading lesson...
    </div>
  );
}

const currentStep =
  currentLesson.steps[activeStep] ??
  currentLesson.steps[0];

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${isDarkMode ? "dark bg-[#0F111A] text-slate-200" : "bg-white text-slate-800"}`}>
      
      {/* LEFT COLUMN: The Scrollytelling Narrative */}
      <div className={`w-[35%] h-full overflow-y-auto p-12 border-r ${isDarkMode ? "border-slate-800" : "border-slate-200"} scrollbar-hide`}>
        <div className="flex justify-between items-start mb-24">
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight pr-4">
            {currentLesson?.title}
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
          {currentLesson.steps.map((step) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0.3 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: "-50% 0px -50% 0px" }}
              onViewportEnter={() => setActiveStep(step.id)}
              className="text-base leading-relaxed transition-colors duration-500"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-6 border font-bold ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-600"}`}>
                {step.id + 1}
              </div>
              {step.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: The Visualizer Engine */}
      <div className={`w-[65%] h-full relative flex items-center justify-center ${isDarkMode ? "bg-[#090a0f]" : "bg-slate-100"}`}>
        <DualDomainVisualizer 
          currentState={currentStep.ui_state} 
          isDarkMode={isDarkMode} 
          globalFunc={globalFunc}
          setGlobalFunc={setGlobalFunc}
          callouts={currentStep.callouts}
        />
      </div>

    </div>
  );
}