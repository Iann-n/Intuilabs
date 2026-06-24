// lib/ai/openrouter.ts
import { createOpenAI } from "@ai-sdk/openai";

export const openrouterInstance =
  createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });