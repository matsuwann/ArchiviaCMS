const fs = require('fs').promises;
const pdfModule = require('pdf-parse'); 
const pdfParse = pdfModule.default || pdfModule; 
const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config(); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.0-flash'; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateMetadata(text) {
  const prompt = `Analyze the research paper text. Extract:
    1. Exact Title.
    2. Primary authors (list of strings).
    3. 5-8 relevant keywords (list of strings).
    4. Publication Date (YYYY-MM-DD or YYYY).
    5. The Journal/Conference Name (e.g., "IEEE Transactions"). Use "Unknown Source" if not found.
    6. A concise Abstract or Summary (approx. 100-150 words).
    
    Return JSON. Text: ${text.substring(0, 15000)}...`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
              ai_abstract: { type: "string" }
            },
            required: ["ai_title", "ai_authors", "keywords", "ai_date_created", "ai_journal", "ai_abstract"],
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
    const data = await pdfParse(fileBuffer); 
    const pdfText = data.text;
    const metadata = await generateMetadata(pdfText);
    
    return {
        title: metadata.ai_title,
        ai_keywords: JSON.stringify(metadata.keywords),
        ai_authors: JSON.stringify(metadata.ai_authors),
        ai_date_created: metadata.ai_date_created,
        ai_journal: metadata.ai_journal,
        ai_abstract: metadata.ai_abstract,
    };
  } catch (err) {
    console.error("[AI Service] Error:", err.message);
    throw err; 
  }
};

exports.generateSearchInsights = async (rawSearchTerms) => {
  if (!rawSearchTerms || rawSearchTerms.length === 0) return [];

  const termsString = rawSearchTerms.map(t => `${t.term} (${t.count})`).join(', ');

  const prompt = `
    You are a data analyst. Group these search terms into top 5 broader topics:
    [${termsString}]
    Return JSON object { "trends": ["Topic A", "Topic B"] }
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text);
    return result.trends ? result.trends.map(topic => ({ term: topic })) : [];

  } catch (err) {
    return rawSearchTerms.slice(0, 5).map(t => ({ term: t.term }));
  }
};

// === NEW: FORMAT CITATION ===
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