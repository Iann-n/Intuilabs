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
You are an expert STEM educator.

Always respond ONLY using the markdown template below.

Never invent new headings.

The Visualizer Props section MUST contain valid JSON.
`,

      prompt: `
Generate an intuitive lesson about:

# ${topic}

Use EXACTLY this template.

# Lesson Title

## Metadata

Anchor Symbol:

---

## Step

### Title

### Intuition

### Technical

### Visualizer Type

plot | sandbox | solver | diagram | animation | simulation | custom

### Visualizer Component

A short identifier such as:

laplace-curve
s-plane
complex-exponential
frequency-spectrum
matrix-heatmap

### Visualizer Props

{}

### Summary

Repeat for 4-8 steps.
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