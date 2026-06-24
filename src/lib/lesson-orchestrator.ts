// lib/lesson-orchestrator.ts

import { createEmbedding } from "@/lib/ai/embedding";
import { verifyConceptMatch } from "@/lib/ai/verifier";
import { generateLesson } from "./lesson-generator";

import { findSimilarLesson } from "@/lib/ai/vector-search";
import { saveLesson } from "@/lib/db/cache";
import { LessonPayloadSchema } from "@/lib/schema/lesson";

export async function getLesson(
  topic: string
) {

  const cleanTopic = topic.trim().toLowerCase();

  //----------------------------------
  // Embedding
  //----------------------------------
  const embedding =await createEmbedding(cleanTopic);

  //----------------------------------
  // Vector Search
  //----------------------------------
  const match = await findSimilarLesson(embedding);
  console.log("MATCH:",match);

  //----------------------------------
  // AI Verification
  //----------------------------------
  if (match) {
    const verdict = await verifyConceptMatch(cleanTopic,match.topic_query);

    if (verdict.sameConcept &&  verdict.confidence > 0.9) {
      console.log("🔥 Semantic Cache Hit");

      const payload =LessonPayloadSchema.parse(match.lesson_payload);
      return {
        source: "cache",
        topic: match.topic_query,
        function:
          payload
            .targetAnchorSymbol,
        textContent:
          match.lesson_payload
      };
    }
  }

  //----------------------------------
  // Generate Lesson
  //----------------------------------
  console.log("🧠 Generating Lesson");

  const lesson = await generateLesson(cleanTopic);

  //----------------------------------
  // Save
  //----------------------------------
  await saveLesson({
    topic: cleanTopic,
    payload: lesson,

    // temporary until embeddings wired
    embedding: `[${embedding.join(",")}]`
  });

  //----------------------------------
  // Return
  //----------------------------------

  return {
    source: "generated",
    topic: cleanTopic,
    function:
      lesson.targetAnchorSymbol,
    textContent: lesson
  };
}