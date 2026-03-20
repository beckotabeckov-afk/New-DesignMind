import { UserSelections, DesignResult, ChoiceSummary } from "./types";
import { GoogleGenAI, Type } from "@google/genai";

export const generateTextResult = async (
  selections: UserSelections,
  choicesSummary: ChoiceSummary[],
  userFeedback?: string
): Promise<any> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");
  const ai = new GoogleGenAI({ apiKey });

  const objectName = (selections['objectName'] as string) || "Новый объект";
  const projectTypeChoice = (selections['projectType'] as string) || "Интерьер";
  const choicesContext = choicesSummary.map(c => c.label).join(', ');
  const answersContext = choicesSummary.map(c => `${c.stepTitle}: ${c.label}`).join('\n');

  const textPrompt = `
    Действуй как ведущий архитектор-дизайнер премиального сегмента. 
    Твоя задача — составить экспертное концептуальное описание и ТЗ для проекта "${objectName}".
    Тип: ${projectTypeChoice}.
    Выбор клиента:
    ${answersContext}
    ${userFeedback ? `ДОПОЛНИТЕЛЬНЫЕ ПРАВКИ КЛИЕНТА: ${userFeedback}` : ''}

    ТРЕБОВАНИЯ К ОТВЕТУ (JSON):
    1. technicalAssignment: Markdown ТЗ.
    2. moodboardDescription: Название концепции.
    3. mainMoodboardPrompt: Промпт для коллажа материалов.
    4. interiorVisualPrompt: Промпт для интерьера.
    5. bathroomVisualPrompt: Промпт для санузла.
    6. bathroomMoodboardPrompt: Промпт для материалов санузла.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: textPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technicalAssignment: { type: Type.STRING },
          moodboardDescription: { type: Type.STRING },
          mainMoodboardPrompt: { type: Type.STRING },
          interiorVisualPrompt: { type: Type.STRING },
          bathroomVisualPrompt: { type: Type.STRING },
          bathroomMoodboardPrompt: { type: Type.STRING },
        },
        required: ["technicalAssignment", "moodboardDescription", "mainMoodboardPrompt", "interiorVisualPrompt", "bathroomVisualPrompt", "bathroomMoodboardPrompt"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateImage = async (prompt: string, isMoodboard: boolean, context: string): Promise<string | undefined> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return undefined;
  const ai = new GoogleGenAI({ apiKey });

  const finalPrompt = isMoodboard 
    ? `Professional material moodboard collage, flat-lay. ${prompt}. ${context}.`
    : `Photorealistic interior design. ${prompt}. ${context}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: finalPrompt,
    });

    if (response.candidates?.[0]?.content?.parts) {
      const imgPart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (imgPart?.inlineData) return `data:image/png;base64,${imgPart.inlineData.data}`;
    }
  } catch (e) {
    console.error("Image generation error", e);
  }
  return undefined;
};

export const editInteriorImage = async (base64Image: string, prompt: string): Promise<string | undefined> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return undefined;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a professional interior designer. Modify this image according to the following request: ${prompt}. Maintain the perspective, lighting, and architectural structure of the original room. High-quality photorealistic result.`,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      const imgPart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (imgPart?.inlineData) return `data:image/png;base64,${imgPart.inlineData.data}`;
    }
  } catch (e) {
    console.error("Image editing error", e);
  }
  return undefined;
};
