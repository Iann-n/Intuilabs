"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

type Segment =
  | { kind: "text"; value: string }
  | { kind: "inline"; value: string }
  | { kind: "display"; value: string };

function normalizeMathDelimiters(text: string): string {

  const trimmed = text.trim();

  if (
    !trimmed.includes("$") &&
    /^\\[a-zA-Z[\](){}]/.test(trimmed)
  ) {
    return `$$${trimmed}$$`;
  }

  return text;
}

function splitMathSegments(input: string): Segment[] {

  const segments: Segment[] = [];
  let cursor = 0;

  const displayPattern = /\$\$([\s\S]+?)\$\$/g;
  let match: RegExpExecArray | null;

  while ((match = displayPattern.exec(input)) !== null) {

    if (match.index > cursor) {
      segments.push({
        kind: "text",
        value: input.slice(cursor, match.index)
      });
    }

    segments.push({
      kind: "display",
      value: match[1].trim()
    });

    cursor = match.index + match[0].length;
  }

  const remainder = input.slice(cursor);

  const inlinePattern = /\$([^$\n]+?)\$/g;
  let inlineCursor = 0;
  let inlineMatch: RegExpExecArray | null;

  while ((inlineMatch = inlinePattern.exec(remainder)) !== null) {

    if (inlineMatch.index > inlineCursor) {
      segments.push({
        kind: "text",
        value: remainder.slice(inlineCursor, inlineMatch.index)
      });
    }

    segments.push({
      kind: "inline",
      value: inlineMatch[1].trim()
    });

    inlineCursor = inlineMatch.index + inlineMatch[0].length;
  }

  if (inlineCursor < remainder.length) {
    segments.push({
      kind: "text",
      value: remainder.slice(inlineCursor)
    });
  }

  return segments.filter(
    (segment) => segment.value.length > 0
  );
}

function renderKatex(
  expression: string,
  displayMode: boolean
) {

  try {
    return katex.renderToString(expression, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  } catch {
    return expression;
  }
}

function renderParagraph(
  paragraph: string,
  className: string
) {

  const segments = splitMathSegments(paragraph);

  return (
    <p className={className}>
      {segments.map((segment, index) => {

        if (segment.kind === "display") {
          return (
            <span
              key={index}
              className="block my-3 overflow-x-auto font-mono text-cyan-300"
              dangerouslySetInnerHTML={{
                __html: renderKatex(segment.value, true)
              }}
            />
          );
        }

        if (segment.kind === "inline") {
          return (
            <span
              key={index}
              className="font-mono text-cyan-300"
              dangerouslySetInnerHTML={{
                __html: renderKatex(segment.value, false)
              }}
            />
          );
        }

        return (
          <span key={index}>
            {segment.value}
          </span>
        );
      })}
    </p>
  );
}

export default function LessonText({
  content,
  variant = "body"
}: {
  content: string;
  variant?: "body" | "technical";
}) {

  const paragraphs =
    content
      .split(/\n{2,}|\n/)
      .map((line) => normalizeMathDelimiters(line.trim()))
      .filter(Boolean);

  const bodyClass =
    variant === "technical"
      ? "text-sm text-slate-400 font-mono leading-relaxed border-l-2 border-cyan-500/40 pl-4"
      : "text-base text-slate-300 leading-relaxed";

  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => (
        <div key={index}>
          {renderParagraph(paragraph, bodyClass)}
        </div>
      ))}
    </div>
  );
}
