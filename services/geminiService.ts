import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to extract base64 from data URL
const extractBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || dataUrl;
};

// Helper to get MIME type from data URL
const extractMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/jpeg'; // Default to jpeg if not found
};

// Generate clothing image from text prompt
export const generateClothingFromText = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  
  // Using gemini-2.5-flash-image for generation (Nano Banana)
  const model = 'gemini-2.5-flash-image'; 
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: `Design a standalone clothing item: ${prompt}. White background, flat lay or mannequin style.` }
      ]
    }
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated from the prompt.");
};

// Generate Try-On result (Person + Cloth -> New Image)
export const generateTryOn = async (personDataUrl: string, clothDataUrl: string): Promise<string> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-image'; // Nano Banana

  const personBase64 = extractBase64(personDataUrl);
  const personMime = extractMimeType(personDataUrl);
  
  const clothBase64 = extractBase64(clothDataUrl);
  const clothMime = extractMimeType(clothDataUrl);

  const prompt = "Generate a photorealistic full-body image of the person shown in the first image wearing the clothing shown in the second image. Maintain the person's identity, pose, and body shape. Ensure the lighting is natural and consistent.";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: personMime,
            data: personBase64
          }
        },
        {
          inlineData: {
            mimeType: clothMime,
            data: clothBase64
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate try-on image.");
};
