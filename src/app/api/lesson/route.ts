// src/app/api/lesson/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getLesson } from "@/lib/lesson/lesson-orchestrator";

export async function POST(
  request: NextRequest
) {
  try {

    const { topic } =
      await request.json();

    if (!topic) {
      return NextResponse.json(
        {
          error:
            "Topic is required"
        },
        {
          status: 400
        }
      );
    }

    const lesson = await getLesson(topic);

    return NextResponse.json( lesson );

  } catch (error) {

    console.error(
      "Lesson API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate lesson"
      },
      {
        status: 500
      }
    );
  }
}