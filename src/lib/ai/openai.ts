// lib/ai/openai.ts

import { createOpenAI } from "@ai-sdk/openai";

export const openaiInstance =
  createOpenAI({
    apiKey:
      process.env.OPENAI_API_KEY
  });