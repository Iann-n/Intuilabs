// lib/golden-lesson.ts

import { LessonPayload } from "@/lib/schema/lesson";

export function getGoldenLesson(
  lesson: LessonPayload
) {
  return {
    title: lesson.title,

    steps: lesson.steps.map(
      (step, index) => ({
        id: index,

        text: (
          <>
            <h2>{step.title}</h2>

            <p>
              {step.intuition}
            </p>

            <div>
              {step.technicalExplanation}
            </div>
          </>
        ),

        ui_state: {
          instruction:
            step.uiVisualizerInstruction,

          callouts:
            step.callouts
        }
      })
    )
  };
}