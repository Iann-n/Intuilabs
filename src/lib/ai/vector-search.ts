// lib/database/vector-search.ts

import { getSupabase } from "../db/supabase";

export async function findSimilarLesson(
  // embedding parameter as a number array
  embedding: number[]
) {

  const supabase = getSupabase();

  // RPC stands for: Remote Procedure Call, Meaning: "Execute a function that lives in the database."
  // it executes the match_catched_lessons that takes in the following parameters
  const { data, error } = await supabase.rpc(
    "match_cached_lessons",
    {
      query_embedding: `[${embedding.join(",")}]`,
      match_threshold: 0.8,
      match_count: 1
    }
  );

  console.log("RPC DATA:", data);
  console.log("RPC ERROR:", error);
// Normally: data.length assumes data exists.
// data?.length means: "If data exists, get .length. Otherwise return undefined."
// if !data, we return null
  if (!data?.length) {
    return null;
  }

  return data[0];
}