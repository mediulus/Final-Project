import { saveDoc } from "./save.ts";
import { GoogleGenAI } from "npm:@google/genai";
import fs from "node:fs";

import "jsr:@std/dotenv/load";

// Default spacer to begin completion, could make configurable
const BEGIN_RESPONSE = "\n# response:\n\n";

export async function promptLLM(doc: string, file: string) {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL");
  if (GEMINI_API_KEY === undefined) throw new Error("Missing GEMINI_API_KEY");
  if (GEMINI_MODEL === undefined) throw new Error("Missing GEMINI_MODEL");
  let config = {};
  const configPath = Deno.env.get("GEMINI_CONFIG");
  if (configPath) {
    config = JSON.parse(Deno.readTextFileSync(configPath));
  }
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  let completion = BEGIN_RESPONSE;
  fs.appendFileSync(file, completion);

  const result = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: doc,
    config,
  });

  let thoughts = "";
  let last;
  for await (const chunk of result) {
    last = chunk;
    const candidates = chunk.candidates?.[0]?.content?.parts;
    if (candidates === undefined) continue;
    for (const part of candidates) {
      const chunkText = part.text;
      if (!chunkText) {
        continue;
      } else if (part.thought) {
        if (!thoughts) {
          console.log("Thoughts summary:\n");
        }
        console.log(part.text);
        thoughts = thoughts + part.text;
      } else {
        // Deno.writeTextFileSync(filePath, chunkText, { append: true });
        completion += chunkText;
        fs.appendFileSync(file, chunkText);
      }
    }
  }
  let meta = {};
  if (last !== undefined) {
    const data = last.usageMetadata;
    const promptTokens = data?.promptTokenCount || "";
    const outputTokens = data?.candidatesTokenCount || "";
    const totalTokens = data?.totalTokenCount || "";
    const thoughtTokens = data?.thoughtsTokenCount || "";
    meta = {
      promptTokens,
      outputTokens,
      totalTokens,
      thoughtTokens,
    };
  }
  const properties = {
    "llm_model": GEMINI_MODEL,
  };
  await saveDoc(doc + completion, file, { ...properties, ...meta });
}
