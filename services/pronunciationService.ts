import { GoogleGenAI, Type } from "@google/genai";

export interface PronunciationAssessment {
  score: number; // A score from 0 to 1
  message: string;
}

/**
 * Converts a Blob to a base64 encoded string.
 * @param blob The blob to convert.
 * @returns A promise that resolves to the base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            // remove "data:audio/webm;base64," prefix
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


/**
 * Calls the Gemini API to assess pronunciation.
 * @param audioBlob The recorded audio of the user speaking.
 * @param targetText The text the user was supposed to say.
 * @returns A promise that resolves to a pronunciation assessment.
 */
export const assessPronunciation = async (audioBlob: Blob, targetText: string): Promise<PronunciationAssessment> => {
  // FIX: Use real Gemini API for pronunciation assessment instead of a mock service.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable not set");
    return { score: 0, message: "API key is not configured." };
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const audioData = await blobToBase64(audioBlob);
    
    const audioPart = {
        inlineData: {
            mimeType: audioBlob.type,
            data: audioData
        }
    };

    const prompt = `Please act as an English pronunciation coach. The user, an Arabic speaker, was trying to say the following text: "${targetText}". Listen to the user's recording and assess their pronunciation. Provide a score between 0.0 and 1.0, where 1.0 is a perfect native-like pronunciation. Also, provide a short, encouraging, and constructive feedback message in Arabic. Your response must be a JSON object with two keys: "score" (a number) and "message" (a string).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [audioPart, { text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER, description: "Pronunciation score from 0.0 to 1.0" },
                    message: { type: Type.STRING, description: "Feedback message in Arabic" }
                },
                required: ['score', 'message']
            }
        }
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (typeof result.score === 'number' && typeof result.message === 'string') {
        // Add the score to the message for clarity
        result.message = `${result.message} (التقييم: ${Math.round(result.score * 100)}%)`;
        return result;
    } else {
        throw new Error("Invalid JSON response from API");
    }

  } catch (error) {
    console.error("Error assessing pronunciation with Gemini API:", error);
    return {
      score: 0,
      message: "حدث خطأ أثناء تقييم النطق. الرجاء المحاولة مرة أخرى."
    };
  }
};
