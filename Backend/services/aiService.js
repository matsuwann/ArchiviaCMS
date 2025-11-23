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
    5. The Journal, Conference Name, or Publisher (e.g., "IEEE Transactions", "Nature", "ArXiv"). If unknown, use "Unknown Source".
    
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
              ai_journal: { type: "string" }
            },
            required: ["ai_title", "ai_authors", "keywords", "ai_date_created", "ai_journal"],
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
    };
  } catch (err) {
    console.error("[AI Service] Error:", err.message);
    throw err; 
  }
};

// === NEW: AI TREND ANALYSIS ===
exports.generateSearchInsights = async (rawSearchTerms) => {
  if (!rawSearchTerms || rawSearchTerms.length === 0) return [];

  const termsString = rawSearchTerms.map(t => `${t.term} (${t.count})`).join(', ');

  const prompt = `
    You are a data analyst for a research repository. 
    Here is a list of recent user search terms and their frequency:
    [${termsString}]

    Task:
    1. Analyze the semantic meaning of these searches.
    2. Group similar searches together (e.g., "AI", "Machine Learning", "ML" -> "Artificial Intelligence").
    3. Identify the top 5 most popular *broader themes* or *topics*.
    4. Return a JSON object with a single key "trends" containing an array of strings.
    
    Example Output: { "trends": ["Climate Change", "Neural Networks", "Bioinformatics"] }
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              trends: { type: "array", items: { type: "string" } }
            }
          }
        }
    });

    const result = JSON.parse(response.text);
    return result.trends.map(topic => ({ term: topic }));

  } catch (err) {
    console.error("[AI Analytics] Error generating insights:", err.message);
    return rawSearchTerms.slice(0, 5).map(t => ({ term: t.term }));
  }
};