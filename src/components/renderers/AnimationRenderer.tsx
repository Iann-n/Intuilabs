"use client";

import ComplexExponentialSandbox from "../ComplexExponentialSandbox";
import UnsupportedVisualizer from "./UnsupportedVisualizer";
import { readProp, RendererSpec } from "./types";

export default function AnimationRenderer({
  spec,
  isDarkMode,
  globalFunc
}: {
  spec: RendererSpec;
  isDarkMode: boolean;
  globalFunc: string;
}) {

  switch (spec.component) {

    case "complex-exponential":
      return (
        <ComplexExponentialSandbox
          isDarkMode={isDarkMode}
          globalFunc={globalFunc}
          viewMode={readProp(spec.props, "viewMode", "anatomy")}
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
