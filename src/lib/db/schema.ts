// src/db/schema.ts
import { pgTable, uuid, text, jsonb, vector, real, boolean, timestamp } from "drizzle-orm/pg-core";

// TABLE 1: The RAG Knowledge Base (Textbooks)
export const textbookChunks = pgTable("textbook_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookTitle: text("book_title").notNull(),
  content: text("content").notNull(), // The actual paragraph of textbook text
  embedding: vector("embedding", { dimensions: 3072 }), 
});

// TABLE 2: The AI Flywheel Cache (Lessons)
export const cachedLessons = pgTable("cached_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicQuery: text("topic_query").notNull(), // e.g., "Laplace Transform of sin(3t)"
  queryEmbedding: vector("query_embedding", { dimensions: 3072 }), // To find similar questions
  uiEngine: text("ui_engine").default("DualDomainVisualizer"),
  lessonPayload: jsonb("lesson_payload").notNull(), // The 7-step UI JSON script
  qualityScore: real("quality_score").default(0.0), // Telemetry score
  createdAt: timestamp("created_at").defaultNow(),
});