import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Most codebases use const cuz usually variable doesn't change
export const googleInstance =
  createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });