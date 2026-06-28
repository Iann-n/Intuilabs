"use client";

import ComplexExponentialSandbox from "../ComplexExponentialSandbox";
import UnsupportedVisualizer from "./UnsupportedVisualizer";
import { readProp, RendererSpec } from "./types";

export default function SandboxRenderer({
  spec,
  isDarkMode,
  globalFunc,
  setGlobalFunc
}: {
  spec: RendererSpec;
  isDarkMode: boolean;
  globalFunc: string;
  setGlobalFunc: (value: string) => void;
}) {

  switch (spec.component) {

    case "complex-exponential":
      return (
        <ComplexExponentialSandbox
          isDarkMode={isDarkMode}
          globalFunc={globalFunc}
          setGlobalFunc={setGlobalFunc}
          viewMode={readProp(spec.props, "viewMode", "decomposer")}
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
