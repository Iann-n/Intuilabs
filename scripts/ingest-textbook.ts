import { createClient } from '@supabase/supabase-js';
import { embed } from 'ai';
import { googleInstance } from '../src/lib/ai/google';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error("❌ Error: Missing configuration variables inside environment file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ProcessingChunk {
  book_title: string;
  chapter: string;
  content: string;
}

/**
 * Splits a raw string block into overlapping, semantic segments.
 */
function sliceSemanticChunks(text: string, title: string, chapter: string, maxChunkSize = 1000, overlapSize = 150): ProcessingChunk[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: ProcessingChunk[] = [];
  
  let currentChunkText = "";

  for (const paragraph of paragraphs) {
    const cleanParagraph = paragraph.trim();
    if (!cleanParagraph) continue;

    // If adding the new paragraph breaks the max size, save what we have
    if ((currentChunkText + cleanParagraph).length > maxChunkSize) {
      if (currentChunkText.trim().length > 0) {
        chunks.push({
          book_title: title,
          chapter: chapter,
          content: currentChunkText.trim()
        });
      }
      // Re-seed the next chunk with the tail end overlap window + the new paragraph
      currentChunkText = currentChunkText.slice(-overlapSize) + "\n\n" + cleanParagraph;
    } else {
      currentChunkText += (currentChunkText ? "\n\n" : "") + cleanParagraph;
    }
  }

  // Push final remaining text window
  if (currentChunkText.trim().length > 0) {
    chunks.push({
      book_title: title,
      chapter: chapter,
      content: currentChunkText.trim()
    });
  }

  return chunks;
}

/**
 * Main Execution Sequence
 */
async function processLibraryIngestion(rawBookText: string, title: string, chapter: string) {
  try {
    console.log("📚 Parsing textbook content...");
    const semanticChunks = sliceSemanticChunks(rawBookText, title, chapter);
    console.log("✂️ Creating semantic chunks...");

    
    // Process items sequentially to respect rate-limiting limits safely
    for (let i = 0; i < semanticChunks.length; i++) {
      const chunk = semanticChunks[i];
      console.log(`   [${i + 1}/${semanticChunks.length}] Embedding chunk payload...`);

      console.log("USING MODEL: gemini-embedding-001");
      console.log("🧠 Generating embeddings...");
      // Generate the vector map using the configured googleInstance
      const { embedding } = await embed({
        model: googleInstance.embeddingModel('gemini-embedding-001'),
        value: chunk.content,
      });

      // Insert directly into your textbook_chunks schema table
      
      console.log("💾 Saving chunks to Supabase...");
            const payload = {
        book_title: chunk.book_title,
        chapter: chunk.chapter,
        content: chunk.content,
        embedding: embedding
      };

      const { data, error: insertError } =
        await supabase
          .from('textbook_chunks')
          .upsert(payload)
          .select();
        
      if (insertError) {
        console.error(insertError);
      } else {
        console.log(
          `✅ Stored chunk ${i + 1}/${semanticChunks.length}`
        );
      }
    }

    
    console.log("\n🚀 Ingestion pipeline execution completed successfully!");
  } catch (error) {
    console.error("💥 Critical Failure during processing loop:", error);
  }
}

// =========================================================================
// EXAMPLE INGESTION TARGET CALL
// =========================================================================
const sampleTextbookInput = `
The Laplace transform of a continuous-time signal x(t) produces an algebraic representation tracking complex frequency variables. 
The fundamental mathematical definition is governed by the following unilateral integration window:
X(s) = \\int_{0}^{\\infty} x(t) e^{-st} dt

Where the complex variable s is explicitly defined as s = \\sigma + j\\omega. 
Here, \\sigma governs exponential attenuation scales or dampening envelopes, while \\omega denotes angular velocity metrics tracking time oscillations. 
Shifting calculations into this complex frequency s-plane stabilizes functions that exhibit divergent behaviors within standard Fourier domains, mapping integration models directly into stable ratios of polynomial elements.
`;

processLibraryIngestion(
  sampleTextbookInput,
  "Signals and Systems: Foundations of Electrical Engineering",
  "Chapter 9: The Unilateral Laplace Transform"
);