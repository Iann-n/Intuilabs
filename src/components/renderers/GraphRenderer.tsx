"use client";

import ComplexExponentialSandbox from "../ComplexExponentialSandbox";
import FourierSeriesPlot from "../FourierSeriesPlot";
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

    case "fourier-series":
      return (
        <FourierSeriesPlot
          isDarkMode={isDarkMode}
          mode={readProp(spec.props, "mode", "phasors")}
          terms={readProp(spec.props, "terms", 5)}
          waveform={readProp(spec.props, "waveform", "square")}
        />
      );

    case "frequency-spectrum":
      return (
        <FourierSeriesPlot
          isDarkMode={isDarkMode}
          mode={readProp(spec.props, "mode", "harmonics")}
          terms={readProp(spec.props, "terms", 7)}
          waveform={readProp(spec.props, "waveform", "square")}
        />
      );

    case "laplace-curve":
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
