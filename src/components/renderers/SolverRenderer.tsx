"use client";

import LaplaceIntegrationSolver from "../LaplaceIntegrationSolver";
import UnsupportedVisualizer from "./UnsupportedVisualizer";
import { readProp, RendererSpec } from "./types";

export default function SolverRenderer({
  spec,
  isDarkMode,
  globalFunc
}: {
  spec: RendererSpec;
  isDarkMode: boolean;
  globalFunc: string;
}) {

  switch (spec.component) {

    case "laplace-integration":
      return (
        <LaplaceIntegrationSolver
          isDarkMode={isDarkMode}
          globalFunc={globalFunc}
          stage={readProp(spec.props, "stage", 1)}
        />
      );

    default:
      return (
        <UnsupportedVisualizer
          component={spec.component}
          type={spec.type}
        />
      );
  }
}
