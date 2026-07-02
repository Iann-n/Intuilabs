import { LessonPayload } from "@/lib/schema/lesson";

// parser job to convert to json

// current hierachy: 
// parseLessonMarkdown()
// │
// ├── Parse lesson title
// ├── Parse metadata
// ├── Split into steps
// │
// └── For each step
//      │
//      ├── extractField("Title")
//      ├── extractField("Intuition")
//      ├── extractField("Technical")
//      ├── extractCallouts()
//      └── extractVisualizer()

function extractField(
  section: string,
  heading: string
): string {

  // heading = title
  // \s* - skip any white space
  // ([\\s\\S]*?) - put a bucket here and collect every single character (including newlines), but stop as soon as the next part of the regex can match.
  // () - save whatever is collected
  // [\s\S] - \s is whitespace and \S is non whitespace, so its esentally every character.
  // * - collect as many characters as needed
  // ? - stopping at the earliest point possible
  // (?=###|$) - positive lookahead - Stop before you reach another heading or the end of the string.


  const regex = new RegExp(
    `### ${heading}\\s*([\\s\\S]*?)(?=###|$)`,
    "i"
  );

  return section.match(regex)?.[1].trim() ?? "";

}


function cleanTitle(title: string) {

  // // means regex i think
  // ^ means beginning of string
  // \d+ one or more digits
  // \. is literal period
  // optional spaces.
  
  // cleanTitle("1. Complex Exponentials"); -> Complex Exponentials
  return title.replace(
    /^\d+\.\s*/,
    ""
  ).trim();

}

function extractVisualizer(section: string) {

  // extract Visualizer Type
  const rawType = extractField(
    section,
    "Visualizer Type"
  );

  const allowedTypes = [
    "plot",
    "sandbox",
    "solver",
    "diagram",
    "animation",
    "simulation",
    "custom"
  ] as const;

  // ensure they are in the allowed Types

  // allowedTypes.includes(rawType) - > Internally, JavaScript does something like:
  // if ("plot" === "plot") return true;
  // if ("sandbox" === "plot") ...

  const type = allowedTypes.includes(
    rawType as typeof allowedTypes[number]
  )
    // value if true
    ? (rawType as typeof allowedTypes[number])
  
    // value if false
    : "custom";

  const component =
    extractField(
      section,
      "Visualizer Component"
    ) || "unknown";

  const rawProps =
    extractField(
      section,
      "Visualizer Props"
    );

  // Record<K,V> - Typescript utility type
  // Record<KeyType, ValueType>
  // props is an object whose keys are strings, and whose values can be anything.

  let props: Record<string, unknown> = {};

  try {

    if (rawProps) {

  const cleanedProps = rawProps
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/m, "")
    .replace(/```$/m, "")
    .trim();

  props = JSON.parse(cleanedProps);

}

  } catch {

    console.warn(
      "Failed to parse visualizer props."
    );

  }

  // is shorthand for : 
  // return {
  //   type: type,
  //   component: component,
  //   props: props
  // };

  return {

    type,

    component,

    props

  };
}

function extractCallouts(
  section: string
  // function returns to type after the : 
  // returns an array of objects that consists of string label and descriptions
): { label: string; description: string }[] {

  const raw = extractField(section, "Callouts");

  if (!raw) {
    return [];
  }

  try {

    const parsed = JSON.parse(raw);

    // did JSON.parse create an array
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({

        // use label or description as the item's label or description, or else return an empty string.
        label: String(item.label ?? ""),
        description: String(item.description ?? "")
      }));
    }

  } catch {

    // fall through to bullet-list parsing
  }

  // manual bullet list parsing in case json fails
  const callouts: { label: string; description: string }[] = [];

  // split raw data using newline 
  for (const line of raw.split("\n")) {

    // manually parse using regex and then push to array
    const match = line.match(/^-\s*(.+?):\s*(.+)$/);

    if (match) {
      callouts.push({
        label: match[1].trim(),
        description: match[2].trim()
      });
    }

  }

  return callouts;

}


export function parseLessonMarkdown(
  markdown: string
): LessonPayload {

  // Lesson title
  const lessonTitle =
    markdown.match(/^#\s+(.+)$/m)?.[1].trim() ??
    "Untitled Lesson";

  // Anchor Symbol
  const anchorSymbol =
    markdown.match(
      /Anchor Symbol:\s*([\s\S]*?)(?=\n---|\n##|$)/i
    )?.[1].trim() ?? "";

  // Split lesson into individual steps
  const sections =
    markdown
      .split(/^## Step$/m)
      .map(s => s.trim())
      .filter(Boolean);

  // mapping for steps
  const steps = sections.map((section, index) => {

    const title = cleanTitle(
      extractField(section, "Title")
    );

    const intuition = extractField(
      section,
      "Intuition"
    );

    const technicalExplanation = extractField(
      section,
      "Technical"
    );

    const visualizer =
      extractVisualizer(section);

    const callouts =
      extractCallouts(section);

    return {

      id: index + 1,

      title,

      intuition,

      technicalExplanation,

      visualizer,

      callouts

    };

  });

  return {

    title: lessonTitle,

    targetAnchorSymbol:
      anchorSymbol,

    steps

  };

}