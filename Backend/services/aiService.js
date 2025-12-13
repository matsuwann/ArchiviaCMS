const fs = require('fs').promises;
const pdfModule = require('pdf-parse'); 
const pdfParse = pdfModule.default || pdfModule; 
const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config(); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.0-flash'; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateMetadata(fileBuffer) {
  // Updated prompt to explicitly ask for image/visual safety checks
  const prompt = `Analyze this PDF research paper (including text and visual diagrams/images). 
    
    1. Extract Metadata:
       - Exact Title.
       - Primary authors (list of strings).
       - 5-8 relevant keywords (list of strings).
       - Publication Date (YYYY-MM-DD or YYYY).
       - The Journal/Conference Name. Use "Unknown Source" if not found.
       - A concise Abstract (approx. 100-150 words).
    
    2. Content Safety Check:
       - Review the document for hate speech, harassment, and dangerous content.
       - Review ALL IMAGES and FIGURES for explicit sexual content, gore, or inappropriate symbols.
       - Set 'is_safe' to false if ANY text or image violates these policies.
       - If unsafe, provide a specific 'safety_reason'.
    
    Return JSON.`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                // Send the Buffer directly so Gemini can see images
                inlineData: {
                  mimeType: "application/pdf",
                  data: fileBuffer.toString("base64")
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              ai_title: { type: "string" },
              ai_authors: { type: "array", items: { type: "string" } },
              keywords: { type: "array", items: { type: "string" } },
              ai_date_created: { type: "string" },
              ai_journal: { type: "string" },
              ai_abstract: { type: "string" },
              is_safe: { type: "boolean" },
              safety_reason: { type: "string" }
            },
            required: ["ai_title", "ai_authors", "keywords", "ai_date_created", "ai_journal", "ai_abstract", "is_safe", "safety_reason"],
          },
        },
      });
      
      return JSON.parse(response.text);

    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes("overloaded") || err.status === 503)) {
        await delay(2000 * attempt);
        continue;
      }
      break; 
    }
  }
  throw lastError;
}

exports.analyzeDocument = async (fileBuffer) => {
  try {
    // 1. Keep pdf-parse as requested (e.g., for logging, sanity check, or future full-text search)
    const data = await pdfParse(fileBuffer); 
    const rawText = data.text; 
    console.log(`[AI Service] Text parsed via pdf-parse (${rawText.length} chars). Proceeding to Gemini analysis...`);

    // 2. Send the BUFFER to Gemini so it can check images + text
    const metadata = await generateMetadata(fileBuffer);
    
    return {
        title: metadata.ai_title,
        ai_keywords: JSON.stringify(metadata.keywords),
        ai_authors: JSON.stringify(metadata.ai_authors),
        ai_date_created: metadata.ai_date_created,
        ai_journal: metadata.ai_journal,
        ai_abstract: metadata.ai_abstract,
        is_safe: metadata.is_safe,           
        safety_reason: metadata.safety_reason 
    };
  } catch (err) {
    console.error("[AI Service] Error:", err.message);
    throw err; 
  }
};

exports.formatCitation = async (docData, style) => {
  const prompt = `
    You are a bibliographer. Format the following research paper metadata into a perfect ${style} citation. 
    Return ONLY the citation string. No explanations.
    
    Metadata:
    Title: ${docData.title}
    Authors: ${docData.authors}
    Date: ${docData.date}
    Journal: ${docData.journal}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    return { citation: response.text ? response.text.trim() : "" };
  } catch (err) {
    console.error("Citation Error:", err);
    throw new Error("Failed to generate citation");
  }
};