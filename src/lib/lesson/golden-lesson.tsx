"use client";

import { LessonPayload, VisualizerState } from "@/lib/schema/lesson";
import { ReactNode } from "react";
import LessonText from "@/components/LessonText";

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
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            {step.title}
          </h2>

          <LessonText content={step.intuition} variant="body" />

          {step.technicalExplanation.trim().length > 0 && (
            <LessonText
              content={step.technicalExplanation}
              variant="technical"
            />
          )}
        </>
      ),

      ui_state: step.visualizer,

      callouts: step.callouts
    }))
  };
}
