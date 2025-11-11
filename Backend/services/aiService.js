const fs = (require('fs')).promises;
const pdfModule = require('pdf-parse'); 
const pdfParse = pdfModule.default || pdfModule; 
const { GoogleGenAI } = require('@google/genai'); 
require('dotenv').config(); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

async function generateMetadata(text) {
  const prompt = `Analyze the following research paper text. Extract:
    1. The exact Title of the paper.
    2. A list of all primary authors (full names if possible, last name and initials otherwise).
    3. A list of 5-8 highly relevant keywords/tags.
    4. The most precise publication date found (e.g., 'YYYY-MM-DD', 'YYYY-MM', or 'YYYY').
    Return the result as a single JSON object. Text: ${text.substring(0, 8000)}...`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          ai_title: { type: "string", description: "The exact title of the research paper." },
          ai_authors: { type: "array", description: "A canonical list of all primary authors.", items: { type: "string" } },
          keywords: { type: "array", description: "A list of 5 to 8 keywords/tags.", items: { type: "string" } },
          ai_date_created: { type: "string", description: "The most precise publication or creation date found (e.g., 'YYYY-MM-DD', 'YYYY-MM', or 'YYYY')." },
        },
        required: ["ai_title", "ai_authors", "keywords", "ai_date_created"],
      },
    },
  });
  
  return JSON.parse(response.text);
}

exports.analyzeDocument = async (filepath) => {
    try {
        const dataBuffer = await fs.readFile(filepath);
        const data = await pdfParse(dataBuffer); 
        const pdfText = data.text;
        
        const metadata = await generateMetadata(pdfText);
        
        return {
            title: metadata.ai_title,
            ai_keywords: JSON.stringify(metadata.keywords),
            ai_authors: JSON.stringify(metadata.ai_authors),
            ai_date_created: metadata.ai_date_created,
        };
    } catch (err) {

        await fs.unlink(filepath).catch(e => console.error("Failed to delete temp file:", e)); 
        throw err; 
    }
};

exports.deleteFile = async (filepath) => {
    try {
        await fs.unlink(filepath);
    } catch (err) {
        console.error("Error deleting file from filesystem:", err.message);

    }
};