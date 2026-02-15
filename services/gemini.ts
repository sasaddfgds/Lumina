
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FileAttachment, Suggestion, AIActionType, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateInitialDraft = async (
  prompt: string,
  attachments: FileAttachment[],
  language: Language
): Promise<string> => {
  const parts = attachments.map(att => ({
    inlineData: {
      mimeType: att.type,
      data: att.data
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        ...parts,
        { text: `You are a world-class professional writer and thought partner. 
          Task: Based on the following prompt and attached files, write a comprehensive draft.
          Draft Style: Distraction-free, high quality, and engaging.
          LANGUAGE: Please write the draft in ${language === 'en' ? 'English' : 'Russian'}.
          
          Prompt: ${prompt}` }
      ]
    },
    config: {
      temperature: 0.7,
      topP: 0.95,
    }
  });

  return response.text || "";
};

export const performInlineAction = async (
  action: AIActionType,
  selectedText: string,
  context: string,
  customInstructions?: string
): Promise<string> => {
  const promptMap = {
    [AIActionType.REWRITE]: "Rewrite the following text to be more compelling and clear while keeping the original meaning.",
    [AIActionType.SHORTEN]: "Make the following text more concise and punchy without losing key information.",
    [AIActionType.EXPAND]: "Expand upon the following text, adding more depth, vivid details, or explanation.",
    [AIActionType.TONE_CHANGE]: `Change the tone of the following text to be ${customInstructions || 'more professional'}.`,
    [AIActionType.FIX_GRAMMAR]: "Fix any grammar, spelling, or punctuation errors in the following text.",
    [AIActionType.CUSTOM]: customInstructions || "Improve the following text.",
    [AIActionType.TRANSLATE_EN]: "Translate the following text into natural, high-quality English. Maintain the original tone and intent.",
    [AIActionType.TRANSLATE_RU]: "Translate the following text into natural, high-quality Russian. Maintain the original tone and intent."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      As a writing partner, help me with a specific section of my document.
      
      CONTEXT OF ENTIRE DOCUMENT:
      """
      ${context}
      """
      
      SPECIFIC TEXT TO MODIFY:
      "${selectedText}"
      
      INSTRUCTION: ${promptMap[action]}
      
      Return ONLY the improved version of the specific text provided. Do not include any meta-talk or explanations.
    `
  });

  return response.text?.trim() || selectedText;
};

export const getProactiveSuggestions = async (
  content: string,
  language: Language
): Promise<Suggestion[]> => {
  if (content.length < 50) return [];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are a proactive writing editor. Analyze the following text and find 1-2 specific improvements that could be made.
      These could be clarity fixes, stronger word choices, or stylistic enhancements.
      Language of response should match the text's language.
      
      TEXT:
      "${content}"
      
      Respond in JSON format with an array of suggestions.
      Each suggestion must have:
      - "originalText": The exact text to replace.
      - "suggestedText": The replacement text.
      - "reason": A short (1 sentence) explanation of why this is better (in ${language === 'en' ? 'English' : 'Russian'}).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            suggestedText: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["originalText", "suggestedText", "reason"]
        }
      }
    }
  });

  try {
    const rawSuggestions = JSON.parse(response.text || "[]");
    return rawSuggestions.map((s: any, index: number) => ({
      ...s,
      id: Math.random().toString(36).substr(2, 9),
      startIndex: content.indexOf(s.originalText),
      endIndex: content.indexOf(s.originalText) + s.originalText.length
    })).filter((s: any) => s.startIndex !== -1);
  } catch (e) {
    return [];
  }
};
