import { z } from "zod";

// ==========================================
// Visualization Schema
// ==========================================

export const VisualizerStateSchema = z.object({
  type: z.enum([
    "plot",
    "sandbox",
    "solver",
    "diagram",
    "animation",
    "simulation",
    "custom"
  ]),

  component: z.string(),

  props: z.record(z.string(), z.any()).default({})
});

// ==========================================
// Lesson Step Schema
// ==========================================

export const LessonStepSchema = z.object({
  id: z.number(),

  title: z.string(),

  intuition: z.string(),

  technicalExplanation: z.string(),

  visualizer: VisualizerStateSchema,

  callouts: z.array(
    z.object({
      label: z.string(),
      description: z.string()
    })
  )
});

// ==========================================
// Lesson Payload Schema
// ==========================================

export const LessonPayloadSchema = z.object({
  title: z.string(),

  targetAnchorSymbol: z.string(),

  steps: z.array(
    LessonStepSchema
  ).min(4).max(8)
});

// ==========================================
// Types
// ==========================================

export type VisualizerState =
  z.infer<typeof VisualizerStateSchema>;

export type LessonPayload =
  z.infer<typeof LessonPayloadSchema>;