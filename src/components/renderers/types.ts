import { VisualizerState } from "@/lib/schema/lesson";

export type RendererSpec = VisualizerState;

export function readProp<T>(
  props: Record<string, unknown>,
  key: string,
  fallback: T
): T {
  const value = props[key];
  return (value !== undefined ? value : fallback) as T;
}
