// lib/ai/lesson-generator.ts
import { getSupabase } from "../db/supabase";

import {  LessonPayload } from "../schema/lesson";

// This module should be a database persistence service whose sole job is to take a generated lesson and save it into the cache table.
export async function saveLesson( 
// parameter in typescript

// Object destructering 
// The function expect one object with the following fields
{
  topic,
  payload,
  embedding
}: {
  // The fields passed in must have the following structure with the following types
  topic: string;
  payload: LessonPayload;
  embedding: string;
}) 

{
  // connect to database
  const supabase = getSupabase();

  // building query from supabase api. Store in error variable

  // Take this input and convert into database row.  
  const { error } = await supabase
    .from("cached_lessons")
    .upsert({
      topic_query: topic,
      lesson_payload: payload,
      query_embedding: embedding,
      ui_engine: "DualDomainVisualizer"
    });

  // means:
  // Insert row
  // OR
  // Update existing row

  if (error) {
    throw error;
  }
}

//  Without destructuring you'd write:
// export async function saveLesson(
//   data: {
//     topic: string;
//     payload: LessonPayload;
//     embedding: string;
//   }
// ) {

//   await supabase
//     .from("cached_lessons")
//     .upsert({
//       topic_query: data.topic,
//       lesson_payload: data.payload,
//       query_embedding: data.embedding
//     });

// }
// which gets repetitive.

// Destructuring lets you write:
// topic
// payload
// embedding

// directly.