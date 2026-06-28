"use client";

import ComplexExponentialSandbox from "../ComplexExponentialSandbox";
import UnsupportedVisualizer from "./UnsupportedVisualizer";
import { readProp, RendererSpec } from "./types";

export default function GraphRenderer({
  spec,
  isDarkMode,
  globalFunc
}: {
  spec: RendererSpec;
  isDarkMode: boolean;
  globalFunc: string;
}) {

  switch (spec.component) {

    case "laplace-curve":
      return (
        <ComplexExponentialSandbox
          isDarkMode={isDarkMode}
          globalFunc={globalFunc}
          viewMode={readProp(spec.props, "viewMode", "anatomy")}
        />
      );

    case "frequency-spectrum":
    case "fourier-series":
      return (
        <UnsupportedVisualizer
          component={spec.component}
          type={spec.type}
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
