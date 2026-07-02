import { generateText } from "ai";
import { googleInstance } from "@/lib/ai/google";

// as function is marked as async, it would always return a promise

// function fundamentally sends out the promise to generate an ai output of a lesson stored in result and return the result.text
export async function generateLessonMarkdown(
  topic: string
): Promise<string> {

  console.log("\n==============================");
  console.log("🧠 AI Lesson Generation");
  console.log("==============================");
  console.log("📚 Topic:", topic);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    console.log("⏰ Generation exceeded 60 seconds.");
    controller.abort();
  }, 60_000);

  const start = Date.now();

  // try block here then finally at the bottom to link it together
  try {

    console.log("📤 Sending request to Gemini...");

    const result = await generateText({
      model: googleInstance("gemini-2.5-flash"),

      abortSignal: controller.signal,

      system: `
You are a physics-first STEM educator for IntuiLabs.

Always respond ONLY using the markdown template provided.

Never invent new headings.

The Visualizer Props section MUST contain valid JSON.

WRITING RULES (strict):
- NO analogies. No orchestra, recipes, journeys, or storytelling metaphors.
- Explain the physical model directly, like a clear lecture note.
- Intuition: 2-4 short sentences (max 60 words). State physical facts only.
- Technical: compact equations and variable definitions (max 40 words). Use $...$ for inline math and $$...$$ for display math.
- Each step MUST pick a visualizer that directly illustrates what Intuition describes.
- Use ONLY component IDs from the catalog below.
- Progress from physical observation → mathematical structure → application.
- Do NOT repeat the same idea across steps.

GOOD Intuition example:
A periodic signal repeats every $T$ seconds.
Because of this repetition, only discrete frequencies exist.
Each frequency is one rotating phasor.
The waveform is the vector sum of all phasors.

BAD Intuition example:
Imagine an orchestra where each musician plays a note...

VISUALIZER CATALOG (type / component / when to use / example props):

plot / fourier-series
  Rotating phasors summing to a periodic waveform.
  Use when explaining periodicity, harmonics, phasor addition, or Fourier series reconstruction.
  Props: { "mode": "phasors", "terms": 5, "waveform": "square" }

plot / frequency-spectrum
  Bar chart of discrete harmonic amplitudes.
  Use when explaining which frequencies exist and their magnitudes.
  Props: { "mode": "harmonics", "terms": 7, "waveform": "square" }

plot / laplace-curve
  Time-domain wave with complex exponential anatomy ($\\sigma$, $\\omega$).
  Use when explaining damped oscillation or $s = \\sigma + j\\omega$.
  Props: { "viewMode": "anatomy" }

sandbox / complex-exponential
  Interactive function decomposer into exponentials.
  Use when the user should type or explore $f(t)$ decomposition.
  Props: { "viewMode": "decomposer" }

solver / laplace-integration
  Step-by-step Laplace integral evaluation.
  Use when showing the integral transform procedure.
  Props: { "stage": 1 }

diagram / s-plane
  3D pole landscape in the s-plane.
  Use when explaining poles, ROC, or transfer functions.
  Props: {}

animation / complex-exponential
  Animated phasor spiral for $e^{st}$.
  Use when showing how $\\sigma$ and $\\omega$ shape a complex exponential.
  Props: { "viewMode": "anatomy" }
`,

      prompt: `
Generate a concise, physics-first lesson about:

# ${topic}

Use EXACTLY this template for 5-7 steps.
Each step must use a DIFFERENT visualizer component matched to its physics.

# Lesson Title

## Metadata

Anchor Symbol:

---

## Step

### Title

One short phrase (max 8 words).

### Intuition

2-4 direct sentences about the physical model. No analogies.

### Technical

Key equation(s) and variable definitions only. Use $...$ and $$...$$.

### Visualizer Type

plot | sandbox | solver | diagram | animation | simulation | custom

### Visualizer Component

Must be one catalog ID: fourier-series | frequency-spectrum | laplace-curve | complex-exponential | laplace-integration | s-plane

### Visualizer Props

Valid JSON object from the catalog examples, tuned to this step.

### Callouts

Optional. JSON array: [{"label": "...", "description": "..."}] or bullet list "- label: description"
`
    });

    const elapsed = Date.now() - start;

    console.log("✅ Gemini responded.");
    console.log("⏱ Generation Time:", elapsed, "ms");

    return result.text;

    // try finally block guarantees the finally section always runs, even after returning value.
  } finally {

    clearTimeout(timeout);

  }

}
