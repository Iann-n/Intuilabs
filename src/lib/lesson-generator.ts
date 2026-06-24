// lib/lesson-generator.ts

import { generateText } from "ai";
import { openrouterInstance } from "@/lib/ai/openrouter";

export async function generateLesson(
  topic: string
) {
  try {

    console.log(
      "Generating lesson for:",
      topic
    );

    const start = Date.now();

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => {
        console.log(
          "Generation timed out after 60 seconds"
        );

        controller.abort();
      },
      60_000
    );

    const result = await generateText({
      model: openrouterInstance(
        "nvidia/nemotron-3-ultra-550b-a55b:free"
      ),

      abortSignal:
        controller.signal,

      prompt: `
Hello
`
    });

    clearTimeout(timeout);

    console.log(
      "Generation took:",
      Date.now() - start,
      "ms"
    );

    console.log(
      "Response length:",
      result.text.length
    );

    console.log(
      "Response preview:"
    );

    console.log(
      result.text.slice(0, 1000)
    );

    return {
      title: topic,
      rawLesson: result.text
    };

  } catch (error) {

    console.error(
      "Lesson generation failed:"
    );

    console.error(error);

    throw error;

  }
}