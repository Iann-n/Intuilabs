import { z } from "zod";

// This Zod schema defines the exact shape of the AI verifier's response, 
// ensuring the model returns only a sameConcept decision and a confidence score that the application can safely trust and use.
export const VerificationSchema = z.object({
  sameConcept: z.boolean(),
  confidence: z.number()
});