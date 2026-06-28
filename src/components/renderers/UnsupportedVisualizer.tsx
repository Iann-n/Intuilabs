"use client";

export default function UnsupportedVisualizer({
  component,
  type
}: {
  component: string;
  type: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
      <span className="text-slate-400 text-sm font-mono uppercase tracking-widest">
        Unsupported visualizer
      </span>
      <span className="text-slate-500 text-xs font-mono">
        {type} / {component}
      </span>
    </div>
  );
}
