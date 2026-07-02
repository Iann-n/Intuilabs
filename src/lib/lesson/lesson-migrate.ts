import {
  LessonPayload,
  LessonPayloadSchema,
  VisualizerState
} from "@/lib/schema/lesson";

// ==========================================
// Legacy format support
// ==========================================
//
// Older cached lessons stored steps as:
//   { id, text, ui_state: { view, s_value?, stage? } }
//
// New schema expects:
//   { id, title, intuition, technicalExplanation, visualizer, callouts }
//
// This module upgrades legacy rows before Zod validation.

type LegacyUiState = {
  view?: string;
  s_value?: number;
  stage?: number;
  [key: string]: unknown;
};

type LegacyStep = {
  id?: number;
  text?: string;
  title?: string;
  intuition?: string;
  technical?: string;
  technicalExplanation?: string;
  summary?: string;
  ui_state?: LegacyUiState;
  visualizer?: Partial<VisualizerState>;
  callouts?: { label: string; description: string }[];
  [key: string]: unknown;
};

type LegacyPayload = {
  title?: string;
  targetAnchorSymbol?: string;
  steps?: LegacyStep[];
  [key: string]: unknown;
};

// Fallback visualizer arc when a cached step has no visualizer or ui_state.
// Mirrors the original Laplace lesson progression.
const STEP_VISUALIZER_DEFAULTS: VisualizerState[] = [
  { type: "plot", component: "laplace-curve", props: { sValue: 0 } },
  { type: "plot", component: "laplace-curve", props: { sValue: 2 } },
  { type: "animation", component: "complex-exponential", props: { viewMode: "anatomy" } },
  { type: "sandbox", component: "complex-exponential", props: { viewMode: "decomposer" } },
  { type: "solver", component: "laplace-integration", props: { stage: 1 } },
  { type: "solver", component: "laplace-integration", props: { stage: 2 } },
  { type: "diagram", component: "s-plane", props: {} },
  { type: "custom", component: "unknown", props: {} }
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitleFromHtml(text: string, fallback: string): string {
  const match = text.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (match?.[1]) {
    return stripHtml(match[1]);
  }
  return fallback;
}

function migrateUiStateToVisualizer(
  uiState: LegacyUiState
): VisualizerState {

  const view = String(uiState.view ?? "");

  switch (view) {

    case "2D":
      return {
        type: "plot",
        component: "laplace-curve",
        props: {
          sValue: uiState.s_value ?? 0
        }
      };

    case "Anatomy":
      return {
        type: "animation",
        component: "complex-exponential",
        props: {
          viewMode: "anatomy"
        }
      };

    case "Decomposer":
      return {
        type: "sandbox",
        component: "complex-exponential",
        props: {
          viewMode: "decomposer"
        }
      };

    case "Integration":
      return {
        type: "solver",
        component: "laplace-integration",
        props: {
          stage: uiState.stage ?? 1
        }
      };

    case "SPlane":
      return {
        type: "diagram",
        component: "s-plane",
        props: {}
      };

    default:
      return {
        type: "custom",
        component: "unknown",
        props: uiState
      };
  }
}

function resolveVisualizer(
  step: LegacyStep,
  index: number
): VisualizerState {

  // Already on the new schema
  if (
    step.visualizer &&
    typeof step.visualizer.type === "string" &&
    typeof step.visualizer.component === "string"
  ) {
    return {
      type: step.visualizer.type as VisualizerState["type"],
      component: step.visualizer.component,
      props: step.visualizer.props ?? {}
    };
  }

  // Legacy ui_state → visualizer mapping
  if (step.ui_state && typeof step.ui_state === "object") {
    return migrateUiStateToVisualizer(step.ui_state);
  }

  // Last resort: index-based defaults
  return (
    STEP_VISUALIZER_DEFAULTS[index] ??
    STEP_VISUALIZER_DEFAULTS[STEP_VISUALIZER_DEFAULTS.length - 1]
  );
}

function normalizeStep(
  step: LegacyStep,
  index: number
) {

  const legacyText =
    typeof step.text === "string"
      ? step.text
      : "";

  const title =
    step.title ??
    (legacyText
      ? extractTitleFromHtml(
          legacyText,
          `Step ${index + 1}`
        )
      : `Step ${index + 1}`);

  const intuition =
    step.intuition ??
    (legacyText
      ? stripHtml(legacyText)
      : "");

  const technicalExplanation =
    step.technicalExplanation ??
    step.technical ??
    step.summary ??
    "";

  return {
    id: typeof step.id === "number" ? step.id : index,
    title,
    intuition,
    technicalExplanation,
    visualizer: resolveVisualizer(step, index),
    callouts: Array.isArray(step.callouts) ? step.callouts : []
  };
}

export function normalizeLessonPayload(
  raw: unknown
): LessonPayload {

  const payload = raw as LegacyPayload;

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid lesson payload: expected object");
  }

  if (!Array.isArray(payload.steps)) {
    throw new Error("Invalid lesson payload: steps must be an array");
  }

  const normalized = {
    title: payload.title ?? "Untitled Lesson",
    targetAnchorSymbol: payload.targetAnchorSymbol ?? "",
    steps: payload.steps.map(normalizeStep)
  };

  return LessonPayloadSchema.parse(normalized);
}

export function parseLessonPayload(
  raw: unknown
): LessonPayload {
  return normalizeLessonPayload(raw);
}
