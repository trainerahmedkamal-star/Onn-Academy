import { GoogleGenAI, Content } from "@google/genai";
import { Message } from '../types';

/**
 * Maps the application's Message array to Gemini's Content array format.
 * It skips the initial bot message to not confuse the model.
 * @param messages - The chat history.
 * @returns An array of Content objects for the Gemini API.
 */
const buildHistory = (messages: Message[]): Content[] => {
    return messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));
};

export const getGeminiResponse = async (history: Message[]): Promise<string> => {
    // FIX: Use process.env.API_KEY as per the guidelines to fix TypeScript error and align with requirements.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set");
        return "I'm sorry, the API key is not configured. Please contact the administrator.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We send the whole conversation history each time.
    const conversationHistory = buildHistory(history);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationHistory,
            config: {
                systemInstruction: "You are a friendly and encouraging English tutor. Your goal is to help the user practice their English conversation skills. Keep your responses helpful, concise, and engaging for a language learner. Ask questions to keep the conversation going.",
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching response from Gemini API:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
};