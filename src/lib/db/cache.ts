// lib/db/cache.ts

import { getSupabase } from "./supabase";
import {  LessonPayload } from "../schema/lesson";

// "Take a generated lesson, package it together with the topic that created it and its semantic fingerprint (embedding), 
// then store/update it in a persistent cache so future similar queries can reuse the lesson instead of regenerating it."
export async function saveLesson({
  topic,
  payload,
  embedding
}: {
  topic: string;
  payload: LessonPayload;
  embedding: string | null;
}) {

  const supabase = getSupabase();

  const { error } = await supabase
    .from("cached_lessons")
    .upsert({
      topic_query: topic,
      lesson_payload: payload,
      query_embedding: embedding,
      ui_engine: "DualDomainVisualizer"
    });

  if (error) {
    throw error;
  }
}