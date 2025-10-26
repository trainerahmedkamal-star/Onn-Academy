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

export const getGeminiResponse = async (history: Message[], learnedWords: string[]): Promise<string> => {
    // FIX: Use process.env.API_KEY as per the guidelines to fix TypeScript error and align with requirements.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set");
        return "I'm sorry, the API key is not configured. Please contact the administrator.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const conversationHistory = buildHistory(history);

    const systemInstruction = `You are a friendly and encouraging English tutor for an Arabic-speaking beginner. Your goal is to help the user practice their English conversation skills.
- Keep your sentences very simple and short, using basic grammar.
- Primarily use words from this list: [${learnedWords.join(', ')}]. You can use other very basic connecting words (like 'is', 'are', 'a', 'the', 'I', 'you'), but stick to the provided list as much as possible.
- Ask simple questions using the words from the list to keep the conversation going.
- Always be positive, patient, and motivating. If the user makes a mistake, gently correct them in a simple way. For example, if they say "I is happy", you can say "That's close! We say 'I am happy'. Good try! Are you happy today?".
- Your persona is a helpful teacher who wants the student to succeed.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationHistory,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching response from Gemini API:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
};