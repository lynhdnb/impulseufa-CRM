

import { GoogleGenAI } from "@google/genai";

// Fix: Adhere to Gemini API guidelines for API key handling.
// The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
// Assume this variable is pre-configured, valid, and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScript = async (scenario: string, context: string): Promise<string> => {
    // Fix: Updated prompt to request HTML output for cleaner rendering, leveraging Gemini's capabilities.
    const prompt = `
        Вы - эксперт по продажам и работе с клиентами в элитной школе диджеинга.
        Ваша задача - сгенерировать профессиональный, дружелюбный и эффективный скрипт общения для конкретного сценария.
        Скрипт должен быть ясным, кратким и адаптированным под контекст школы диджеинга.
        Отформатируйте вывод в виде простого HTML. Используйте следующие теги:
        - <strong> для говорящих (например, "<strong>Менеджер:</strong>").
        - <p> для параграфов.
        - <ul> и <li> для списков.

        **Сценарий:** ${scenario}

        **Дополнительный контекст:** ${context}

        Пожалуйста, сгенерируйте скрипт.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating script from Gemini API:", error);
        return "Произошла ошибка при генерации скрипта. Пожалуйста, проверьте консоль для получения дополнительной информации.";
    }
};