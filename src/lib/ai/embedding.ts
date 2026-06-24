// lib/ai/embeddings.ts

import { embed } from 'ai';
import { googleInstance } from './google';

export async function createEmbedding(text: string) {

// 1) embed()
//     ↓
// calls provider
//     ↓
// gets vector
//     ↓
// returns embedding

// Very similar to:
// const response = await fetch(...)
// except instead of returning JSON, it returns a vector.


// 2) await means "wait for network request".
// Send request to Google
//        ↓
// Google computes embedding
//        ↓
// Google sends vector back
//        ↓
// Continue executing code

// Embedding is the variable that stores the returned array of vectors from the embed function from the ai libary

// Why do we get a Promise instead of the vectors if we don't use await? :
// Because the API call takes time. Can take 50ms - 1s, JavaScript doesn't want to freeze your entire program while waiting.
// So instead of returning: number[] immediately, it returns a Promise: which means: "I don't have the answer yet, but I promise I'll give it to you later."

  const { embedding } = await embed({
    model: googleInstance.embeddingModel(
      'gemini-embedding-2'
    ),
    value: text,
  });

  return embedding;
}