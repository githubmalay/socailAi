
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, ChatMessage } from "../types";

// Helper to create a new client instance. 
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostContent = async (base64Image: string, mimeType: string): Promise<GeneratedContent> => {
  const model = "gemini-2.5-flash"; 
  const ai = getAiClient();

  // Updated prompt for high-quality, viral-ready content in layman terms
  const prompt = `
    You are a viral social media expert. Analyze this product image and write a "Social Media Master Kit" using SIMPLE, EVERYDAY ENGLISH.
    
    The goal is to sell this product and make people love it.

    1. **Product Name**: A creative title that CLEARLY describes what the product is (e.g., "Handmade Clay Water Pot", not just "Earthen Delight").
    2. **Tagline**: A short, punchy slogan that sticks in the mind.
    3. **Social Caption**: Write a caption for Instagram/Facebook. 
       - START WITH A HOOK (a question or exciting statement).
       - Focus on the *feeling* of owning the product.
       - Use friendly emojis.
       - Keep it easy to read.
    4. **Professional Story**: A heartwarming story for LinkedIn/WhatsApp.
       - Focus on the "Behind the scenes", hard work, or the quality of materials.
       - Make the reader feel respect for the creator.
    5. **Hashtags**: 10-15 powerful hashtags mixed with niche tags.
    6. **Target Audience**: Be specific (e.g., "Busy moms who love decor", "Students looking for cool gifts").
    7. **Alternatives**: 2 creative ideas for how to use or gift this product.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "You are a warm, creative social media copywriter. You write in simple English but your ideas are brilliant and emotional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            alternatives: { type: Type.STRING },
            shortCaption: { type: Type.STRING, description: "Engaging Instagram caption with a hook" },
            promotionalCaption: { type: Type.STRING, description: "Heartwarming story" },
            hashtags: { type: Type.STRING },
            audience: { type: Type.STRING },
            tagline: { type: Type.STRING },
          },
          required: ["productName", "alternatives", "shortCaption", "promotionalCaption", "hashtags", "audience", "tagline"],
        },
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    // Sanitize Markdown if present
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const data = JSON.parse(jsonText) as GeneratedContent;
    data.timestamp = Date.now();
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};

export const generateEnhancedImage = async (base64Image: string, mimeType: string): Promise<{ data: string; mimeType: string }> => {
  const model = "gemini-2.5-flash-image"; 
  const ai = getAiClient();

  // Stronger prompt to trigger image generation
  const prompt = "Generate a professional product photography version of this image. Improve lighting, clarity, and composition to make it look high-end.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let textResponse = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // If we get an image, return it immediately
        if (part.inlineData) {
           return {
             data: part.inlineData.data,
             mimeType: part.inlineData.mimeType || 'image/png'
           };
        }
        // Collect text in case of failure/refusal
        if (part.text) {
          textResponse += part.text;
        }
      }
    }
    
    // If we reach here, no image was generated.
    console.warn("Gemini Image Gen - No image found. Model output:", textResponse);
    throw new Error(textResponse || "AI could not generate an image from this input.");

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(error.message || "Failed to generate enhanced image.");
  }
};

export const generateChatResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
    return "Please use the Live Assistant button.";
};

export const generateVeoVideo = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  // Placeholder since we are simplifying the app
  return "";
};
