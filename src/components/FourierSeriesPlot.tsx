"use client";

import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

type PlotMode = "phasors" | "harmonics" | "waveform";
type Waveform = "square" | "saw" | "triangle";

function harmonicAmplitude(
  n: number,
  waveform: Waveform
): number {

  if (n === 0) {
    return 0;
  }

  switch (waveform) {

    case "square":
      return n % 2 === 0 ? 0 : 4 / (n * Math.PI);

    case "saw":
      return (2 / (n * Math.PI)) * (n % 2 === 0 ? 1 : -1);

    case "triangle":
      return n % 2 === 0
        ? 0
        : (8 / (Math.PI * Math.PI)) *
          (1 / (n * n)) *
          (n % 4 === 1 ? 1 : -1);

    default:
      return 0;
  }
}

function squareAmplitude(n: number): number {
  return n % 2 === 0 ? 0 : 4 / (n * Math.PI);
}

function buildHarmonics(
  count: number,
  waveform: Waveform
) {

  const harmonics: { n: number; amplitude: number }[] = [];

  for (let n = 1; n <= count * 2; n += 1) {

    const amplitude =
      waveform === "square"
        ? squareAmplitude(n)
        : harmonicAmplitude(n, waveform);

    if (Math.abs(amplitude) > 1e-6) {
      harmonics.push({ n, amplitude });
    }

    if (harmonics.length >= count) {
      break;
    }
  }

  return harmonics;
}

function sampleWaveform(
  harmonics: { n: number; amplitude: number }[],
  t: number,
  omega = 1
): number {

  return harmonics.reduce((sum, harmonic) => {
    return (
      sum +
      harmonic.amplitude *
        Math.sin(harmonic.n * omega * t)
    );
  }, 0);
}

function PhasorView({
  harmonics,
  isDarkMode,
  angle
}: {
  harmonics: { n: number; amplitude: number }[];
  isDarkMode: boolean;
  angle: number;
}) {

  const size = 420;
  const center = size / 2;
  const scale = 55;

  let x = center;
  let y = center;
  const nodes: { x1: number; y1: number; x2: number; y2: number; n: number }[] = [];

  for (const harmonic of harmonics) {

    const theta = harmonic.n * angle - Math.PI / 2;
    const x2 = x + harmonic.amplitude * scale * Math.cos(theta);
    const y2 = y + harmonic.amplitude * scale * Math.sin(theta);

    nodes.push({
      x1: x,
      y1: y,
      x2,
      y2,
      n: harmonic.n
    });

    x = x2;
    y = y2;
  }

  const waveformPoints: { t: number; y: number }[] = [];

  for (let i = 0; i <= 120; i += 1) {
    const t = (i / 120) * Math.PI * 2;
    waveformPoints.push({
      t,
      y: sampleWaveform(harmonics, t)
    });
  }

  const waveScale = d3.scaleLinear()
    .domain([-1.4, 1.4])
    .range([size - 30, 30]);

  const wavePath = d3.line<{ t: number; y: number }>()
    .x((d) => center + (d.t / (Math.PI * 2)) * (size * 0.35))
    .y((d) => waveScale(d.y))
    .curve(d3.curveMonotoneX)(waveformPoints) ?? "";

  const gridColor = isDarkMode ? "#334155" : "#cbd5e1";
  const accent = isDarkMode ? "#22d3ee" : "#0ea5e9";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[420px] h-auto">
      <line
        x1={center}
        y1={20}
        x2={center}
        y2={size - 20}
        stroke={gridColor}
        strokeDasharray="4 4"
      />
      <line
        x1={20}
        y1={center}
        x2={size - 20}
        y2={center}
        stroke={gridColor}
        strokeDasharray="4 4"
      />

      {nodes.map((node, index) => (
        <g key={node.n}>
          <motion.line
            x1={node.x1}
            y1={node.y1}
            x2={node.x2}
            y2={node.y2}
            stroke={index === nodes.length - 1 ? accent : "#ec4899"}
            strokeWidth={index === nodes.length - 1 ? 2.5 : 1.5}
            animate={{ x2: node.x2, y2: node.y2 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
          <circle
            cx={node.x2}
            cy={node.y2}
            r={index === nodes.length - 1 ? 5 : 3}
            fill={index === nodes.length - 1 ? accent : "#ec4899"}
          />
        </g>
      ))}

      <path
        d={wavePath}
        fill="none"
        stroke={accent}
        strokeWidth={2}
        opacity={0.85}
        transform={`translate(${size * 0.35}, 0)`}
      />
    </svg>
  );
}

function HarmonicsView({
  harmonics,
  isDarkMode
}: {
  harmonics: { n: number; amplitude: number }[];
  isDarkMode: boolean;
}) {

  const width = 420;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  const x = d3.scaleBand()
    .domain(harmonics.map((h) => String(h.n)))
    .range([margin.left, width - margin.right])
    .padding(0.25);

  const y = d3.scaleLinear()
    .domain([0, d3.max(harmonics, (h) => h.amplitude) ?? 1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const accent = isDarkMode ? "#22d3ee" : "#0ea5e9";
  const gridColor = isDarkMode ? "#334155" : "#cbd5e1";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[420px] h-auto">
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke={gridColor}
      />
      {harmonics.map((harmonic) => (
        <rect
          key={harmonic.n}
          x={x(String(harmonic.n))}
          y={y(harmonic.amplitude)}
          width={x.bandwidth()}
          height={height - margin.bottom - y(harmonic.amplitude)}
          fill={accent}
          opacity={0.85}
          rx={3}
        />
      ))}
      {harmonics.map((harmonic) => (
        <text
          key={`label-${harmonic.n}`}
          x={(x(String(harmonic.n)) ?? 0) + x.bandwidth() / 2}
          y={height - 12}
          textAnchor="middle"
          fill={isDarkMode ? "#94a3b8" : "#64748b"}
          fontSize={11}
          fontFamily="monospace"
        >
          {harmonic.n}ω
        </text>
      ))}
    </svg>
  );
}

function WaveformView({
  harmonics,
  isDarkMode,
  angle
}: {
  harmonics: { n: number; amplitude: number }[];
  isDarkMode: boolean;
  angle: number;
}) {

  const width = 420;
  const height = 220;
  const points: { x: number; y: number }[] = [];
  const target: { x: number; y: number }[] = [];

  for (let i = 0; i <= 200; i += 1) {
    const t = (i / 200) * Math.PI * 2;
    const xPos = (i / 200) * width;
    points.push({
      x: xPos,
      y: height / 2 - sampleWaveform(harmonics, t) * 70
    });
    target.push({
      x: xPos,
      y: height / 2 - Math.sign(Math.sin(t)) * 70
    });
  }

  const path = d3.line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveMonotoneX)(points) ?? "";

  const targetPath = d3.line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveStepAfter)(target) ?? "";

  const accent = isDarkMode ? "#22d3ee" : "#0ea5e9";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[420px] h-auto">
      <path
        d={targetPath}
        fill="none"
        stroke={isDarkMode ? "#475569" : "#94a3b8"}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <motion.path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        animate={{ d: path }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      />
      <circle
        cx={(angle / (Math.PI * 2)) * width}
        cy={height / 2 - sampleWaveform(harmonics, angle) * 70}
        r={5}
        fill="#ec4899"
      />
    </svg>
  );
}

export default function FourierSeriesPlot({
  isDarkMode,
  mode = "phasors",
  terms = 5,
  waveform = "square"
}: {
  isDarkMode: boolean;
  mode?: PlotMode;
  terms?: number;
  waveform?: Waveform;
}) {

  const [angle, setAngle] = useState(0);

  const harmonics = useMemo(
    () => buildHarmonics(terms, waveform),
    [terms, waveform]
  );

  useEffect(() => {

    let frame = 0;
    let raf = 0;

    const tick = () => {
      frame += 0.018;
      setAngle(frame);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-300";
  const textColor = isDarkMode ? "text-slate-200" : "text-slate-800";
  const mutedColor = isDarkMode ? "text-slate-400" : "text-slate-500";

  const titles: Record<PlotMode, string> = {
    phasors: "Rotating Phasors",
    harmonics: "Discrete Frequency Spectrum",
    waveform: "Harmonic Reconstruction"
  };

  const subtitles: Record<PlotMode, string> = {
    phasors: "Each phasor rotates at nω. The tip traces f(t).",
    harmonics: "Periodicity forces energy into discrete harmonics only.",
    waveform: "Sum of sinusoids approaching the target periodic signal."
  };

  return (
    <div className={`w-full max-w-[480px] p-5 rounded-2xl border ${borderColor} ${isDarkMode ? "bg-slate-900/80" : "bg-white"} backdrop-blur-md shadow-xl flex flex-col gap-4`}>
      <div>
        <h3 className={`text-lg font-bold ${textColor}`}>
          {titles[mode]}
        </h3>
        <p className={`text-sm mt-1 ${mutedColor}`}>
          {subtitles[mode]}
        </p>
      </div>

      <div className={`rounded-xl border p-4 flex items-center justify-center ${isDarkMode ? "bg-black/30 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
        {mode === "phasors" && (
          <PhasorView
            harmonics={harmonics}
            isDarkMode={isDarkMode}
            angle={angle}
          />
        )}
        {mode === "harmonics" && (
          <HarmonicsView
            harmonics={harmonics}
            isDarkMode={isDarkMode}
          />
        )}
        {mode === "waveform" && (
          <WaveformView
            harmonics={harmonics}
            isDarkMode={isDarkMode}
            angle={angle}
          />
        )}
      </div>

      <div className={`text-xs font-mono ${mutedColor} flex justify-between`}>
        <span>{terms} terms</span>
        <span>{waveform} wave</span>
      </div>
    </div>
  );
}
