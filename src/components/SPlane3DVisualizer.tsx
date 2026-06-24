"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface Pole {
  re: number;
  im: number;
  label: string;
}

// 1. POLE EXTRACTION ENGINE WITH FALLBACK SAFEGUARDS
const extractPoles = (input: string): Pole[] => {
  if (!input || typeof input !== "string" || input === "undefined") {
    return [
      { re: 0, im: 3, label: "+3j" },
      { re: 0, im: -3, label: "-3j" },
      { re: 0, im: 1, label: "+1j" },
      { re: 0, im: -1, label: "-1j" }
    ];
  }

  let clean = input.toLowerCase().replace(/\s+/g, '').replace(/cost/g, 'cos(t)').replace(/sint/g, 'sin(t)');
  let rawTerms = clean.match(/[+-]?[^+-]+/g);
  if (!rawTerms) {
    return [{ re: 0, im: 1, label: "+1j" }, { re: 0, im: -1, label: "-1j" }];
  }

  let poles: Pole[] = [];

  for (let term of rawTerms) {
    let sinMatch = term.match(/sin\(([+-]?[\d\.]*)t\)/);
    if (sinMatch) {
      let w = parseFloat(sinMatch[1] || "1");
      if (!isNaN(w)) {
        poles.push({ re: 0, im: w, label: `+${w}j` }, { re: 0, im: -w, label: `-${w}j` });
      }
      continue;
    }

    let cosMatch = term.match(/cos\(([+-]?[\d\.]*)t\)/);
    if (cosMatch) {
      let w = parseFloat(cosMatch[1] || "1");
      if (!isNaN(w)) {
        poles.push({ re: 0, im: w, label: `+${w}j` }, { re: 0, im: -w, label: `-${w}j` });
      }
      continue;
    }

    let eMatch = term.match(/e\^([+-]?[\w\.]*)t/);
    if (eMatch) {
      let pStr = eMatch[1] || "1";
      if (pStr.includes('j')) {
        let w = parseFloat(pStr.replace('j', '') || "1");
        if (!isNaN(w)) poles.push({ re: 0, im: w, label: `${w}j` });
      } else {
        let a = parseFloat(pStr === '+' || pStr === '-' ? pStr + "1" : pStr);
        if (!isNaN(a)) poles.push({ re: a, im: 0, label: `${a}` });
      }
    }
  }

  if (poles.length === 0) {
    return [{ re: 0, im: 1, label: "+1j" }, { re: 0, im: -1, label: "-1j" }];
  }

  return poles.filter((v, i, a) => a.findIndex(t => (t.re === v.re && t.im === v.im)) === i);
};

// 2. THE 3D MATH SURFACE
function ComplexSurface({ poles }: { poles: Pole[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 16, 150, 150); 
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    return geo;
  }, []);

  useEffect(() => {
    if (!geometry) return;
    const pos = geometry.attributes.position;
    const colors = geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); 
      const y = pos.getY(i); 

      let fRe = 0; 
      let fIm = 0;
      
      if (poles && poles.length > 0) {
        poles.forEach(p => {
          const dx = x - p.re;
          const dy = y - p.im;
          const distSq = dx * dx + dy * dy + 0.05; 
          fRe += dx / distSq;
          fIm -= dy / distSq;
        });
      }

      const magnitude = Math.sqrt(fRe * fRe + fIm * fIm);
      const cappedZ = Math.min(magnitude * 1.5, 6); 
      
      const phase = Math.atan2(fIm, fRe);
      const hue = (phase + Math.PI) / (2 * Math.PI); 

      pos.setZ(i, cappedZ);

      const color = new THREE.Color().setHSL(hue, 1.0, cappedZ < 0.2 ? 0.1 : 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }, [poles, geometry]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh ref={wireRef} geometry={geometry} position={[0, 0, 0.01]}>
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// 3. MAIN RENDERER
export default function SPlane3DVisualizer({ globalFunc, isDarkMode }: { globalFunc: string, isDarkMode: boolean }) {
  if (!globalFunc || globalFunc === "undefined") {
    return (
      <div className="w-[600px] h-[600px] flex items-center justify-center border border-slate-700/50 rounded-xl bg-slate-900/50">
        <span className="text-slate-400 font-mono animate-pulse">Loading S-Plane Topology...</span>
      </div>
    );
  }

  // Safe runtime execution guard
  const activePoles = extractPoles(globalFunc) || [];

  return (
    <div className="w-[600px] h-[600px] flex flex-col gap-4">
      <div className={`p-5 rounded-2xl border ${isDarkMode ? "border-slate-700 bg-slate-900/80 shadow-xl" : "border-slate-300 bg-white shadow-xl"} backdrop-blur-md flex flex-col h-full`}>
        
        <div className="mb-3 flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              3. The 3D <span className="font-mono text-cyan-500">s-Plane</span> Landscape
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Visualizing the poles of <code className={`px-2 py-0.5 rounded border shadow-sm font-mono ${isDarkMode ? 'bg-black/30 text-cyan-400 border-cyan-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>f(t) = {globalFunc}</code>
            </p>
          </div>
        </div>

        <div className={`relative flex-1 rounded-xl border overflow-hidden shadow-inner cursor-move ${isDarkMode ? 'bg-black border-slate-700/50' : 'bg-slate-900 border-slate-800'}`}>
          <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 15, 10]} intensity={1.5} />
            
            <OrbitControls enableZoom={true} autoRotate={true} autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2.1} />

            <ComplexSurface poles={activePoles} />

            <axesHelper args={[10]} />
            <Text position={[9, 0, 0]} color="white" fontSize={0.5} anchorX="left">Re(σ)</Text>
            <Text position={[0, 0, -9]} color="white" fontSize={0.5} anchorX="right">Im(jω)</Text>

            {/* SAFE CONDITIONAL INTERPOLATION WRAPPER */}
            {activePoles && activePoles.map((p: Pole, idx: number) => (
              <group key={idx} position={[p.re, 0, -p.im]}>
                <mesh position={[0, 0.05, 0]}>
                  <circleGeometry args={[0.2, 32]} />
                  <meshBasicMaterial color="#ff0055" />
                </mesh>
                
                <Html position={[0, 6.5, 0]} center style={{ pointerEvents: "none" }}>
                  <div className="bg-slate-800/90 border border-slate-600 text-slate-100 font-mono px-3 py-1 rounded-full shadow-lg backdrop-blur-sm whitespace-nowrap text-sm">
                    Pole at s = {p.label || "0"}
                  </div>
                </Html>
                
                <mesh position={[0, 3, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 6]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                </mesh>
              </group>
            ))}
            
            <gridHelper args={[16, 16, "#444444", "#222222"]} />
          </Canvas>

          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="bg-slate-800/80 text-slate-300 text-xs px-4 py-1.5 rounded-full border border-slate-600 backdrop-blur-md font-sans shadow-lg">
              🖱️ Drag to rotate • 🔍 Scroll to zoom
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}