import { LessonPayload, VisualizerState } from "@/lib/schema/lesson";
import { ReactNode } from "react";

export interface DisplayStep {
  id: number;
  text: ReactNode;
  ui_state: VisualizerState;
  callouts: { label: string; description: string }[];
}

export function getGoldenLesson(
  lesson: LessonPayload
): { title: string; steps: DisplayStep[] } {
  return {
    title: lesson.title,

    steps: lesson.steps.map((step) => ({
      id: step.id,

      text: (
        <>
          <h2>{step.title}</h2>

          <p>{step.intuition}</p>

          <div>{step.technicalExplanation}</div>
        </>
      ),

      ui_state: step.visualizer,

      callouts: step.callouts
    }))
  };
}
