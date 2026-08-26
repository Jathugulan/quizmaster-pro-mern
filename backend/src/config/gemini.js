import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

let genAIInstance = null;

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
};

export const generateGeminiContent = async (prompt, modelName) => {
  const client = getGeminiClient();
  if (!client) {
    const error = new Error('Gemini AI is not configured. Add GEMINI_API_KEY to backend/.env.');
    error.statusCode = 503;
    throw error;
  }
  const model = modelName || process.env.GEMINI_MODEL || ENV.GEMINI_MODEL || 'gemini-3.6-flash';
  const response = await client.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text ? response.text.trim() : '';
};

export default {
  getGeminiClient,
  generateGeminiContent,
};

