// lib/ai/verifier.ts

import { generateText, Output } from "ai";
import { VerificationSchema } from "./schema";
import { googleInstance } from "./google";

// This module acts as an AI-based semantic gatekeeper that compares the user's topic with a cached topic and returns a 
// structured verdict (sameConcept + confidence) to decide whether the cache can be safely reused.
// Pipeline:

// Prompt
//    ↓
// generateText()
//    ↓
// output.object(VerificationSchema)
//    ↓
// Zod Validation
//    ↓
// {
//   sameConcept: true,
//   confidence: 0.92
// }

export async function verifyConceptMatch(
  userTopic: string,
  retrievedTopic: string
) {

  // generateText() produces a result container, and when you specify output: Output.object(...), 
  // the validated structured object is placed inside result.output.
  const result = await generateText({

    model: googleInstance("gemini-2.5-flash"),

    // With Output.object
    // You are telling the SDK:
    // Don't give me raw text.
    // Force Gemini to generate JSON matching this schema.

    output: Output.object({
      schema: VerificationSchema
    }),

    prompt: `
Determine if these are the SAME educational concept.

User Query:
${userTopic}

Retrieved Topic:
${retrievedTopic}
`
  });
  
  return result.output;
}