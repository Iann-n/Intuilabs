// lib/lesson-orchestrator.ts

import { createEmbedding } from "@/lib/ai/embedding";
import { verifyConceptMatch } from "@/lib/ai/verifier";
import { generateLessonMarkdown } from "./lesson-generator";
import { parseLessonMarkdown } from "./lesson-parser";

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
  //----------------------------------
// Generate Lesson
//----------------------------------
console.log("\n🧠 Cache Miss");
console.log("Generating lesson...");

const markdown =
  await generateLessonMarkdown(
    cleanTopic
  );

console.log("\n==============================");
console.log("🤖 RAW AI OUTPUT");
console.log("==============================");
console.log(markdown);

console.log("\n🧩 Parsing Markdown...");

const lesson =
  parseLessonMarkdown(
    markdown
  );

console.log("✅ Markdown Parsed");

console.log("\n📋 Validating Lesson Schema...");

const payload =
  LessonPayloadSchema.parse(
    lesson
  );

console.log("✅ Schema Validation Passed");

console.log("\n💾 Saving Lesson...");

await saveLesson({

  topic: cleanTopic,

  payload,

  embedding: `[${embedding.join(",")}]`

});

console.log("✅ Lesson Saved");

return {

  source: "generated",

  topic: cleanTopic,

  function:
    payload.targetAnchorSymbol,

  textContent:
    payload

};
}