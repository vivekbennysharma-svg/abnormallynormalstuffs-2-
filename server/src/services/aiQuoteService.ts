import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedQuote {
  quote: string;
  context: string;
}

export async function generateQuoteSuggestions(topic: string): Promise<GeneratedQuote[]> {
  if (!ai) {
    throw new Error('AI service is not configured (missing GEMINI_API_KEY)');
  }

  const prompt = `Generate 3 short, thought-provoking quote suggestions suitable for a blog post about: "${topic}".
Respond ONLY with a valid JSON array containing objects with the keys "quote" and "context" (a 1-sentence note on how to use it). Do not include markdown code fences or backticks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
  });

  const rawText = response.text?.trim() || '[]';
  
  // Clean potential code block backticks if present
  const cleanedText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();

  try {
    const parsed = JSON.parse(cleanedText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse AI quote response:', rawText);
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}