import { z } from "zod";

// Zod is the runtime blueprint that verifies AI-generated JSON actually matches the structure your application expects, 
// while z.infer<> automatically derives the corresponding TypeScript type so you only define that structure once.
export const LessonStepSchema = z.object({
  id: z.number(),

  title: z.string(),

  intuition: z.string(),

  technicalExplanation: z.string(),

  uiVisualizerInstruction: z.string(),

  callouts: z.array(
    z.object({
      label: z.string(),
      description: z.string()
    })
  )
});

export const LessonPayloadSchema = z.object({
  title: z.string(),

  targetAnchorSymbol: z.string(),

  steps: z.array(
    LessonStepSchema
  ).min(4).max(8)
});

export type LessonPayload =
  z.infer<typeof LessonPayloadSchema>;