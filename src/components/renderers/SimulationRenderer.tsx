"use client";

import SPlane3DVisualizer from "../SPlane3DVisualizer";
import UnsupportedVisualizer from "./UnsupportedVisualizer";
import { RendererSpec } from "./types";

export default function SimulationRenderer({
  spec,
  isDarkMode,
  globalFunc
}: {
  spec: RendererSpec;
  isDarkMode: boolean;
  globalFunc: string;
}) {

  switch (spec.component) {

    case "s-plane":
      return (
        <SPlane3DVisualizer
          isDarkMode={isDarkMode}
          globalFunc={globalFunc}
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
