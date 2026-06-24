<!-- BEGIN:nextjs-agent-rules -->
# IntuiLabs - AI Coding Agent Guidelines

## 🏗️ Architecture & Stack
- **Framework:** Next.js (App Router strictly, NO Pages router).
- **Language:** TypeScript (Strict typing required).
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`.
- **Animations:** Framer Motion (use physics-based springs, NO standard CSS transitions).
- **Data Viz (2D):** D3.js for math/coordinates, rendered via React SVGs.
- **Data Viz (3D):** React Three Fiber (R3F) + Drei.

## 🧠 Core Engineering Rules
1. **Server vs. Client:** By default, all components are Server Components. Only add `"use client"` when using hooks (`useState`, `useEffect`), Framer Motion, D3, or R3F.
2. **The "Anti-Desmos" Rule:** Never use standard charting libraries (Chart.js, Recharts). Every visualization must be built from the ground up using SVG/Canvas to allow for pixel-perfect glowing neon aesthetics.
3. **Glassmorphism First:** UI overlays must use Tailwind's `backdrop-blur` and semi-transparent backgrounds (e.g., `bg-slate-900/80`). 
4. **State Management:** Visualization states are driven by a single JSON parameter object. Decouple the math/logic from the UI render.

## 🎨 Design System (Dark Mode Only)
- Backgrounds: `#0F111A` (Deep Slate/Charcoal).
- Accents: Neon Cyan (`#22d3ee`), Electric Blue (`#3b82f6`), Hot Pink (`#ec4899`) for secondary math curves.
- Fonts: Sans-serif for UI, Monospace for Math/Variables.
<!-- END:nextjs-agent-rules -->
