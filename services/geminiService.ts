import { GoogleGenAI } from "@google/genai";
import type { Chat, GenerateContentResponse } from "@google/genai";
import { AppConfig } from "../types";

// Vite exposes environment variables via import.meta.env
const getApiKey = () => {
  // Try import.meta.env first (Vite way)
  if (import.meta.env.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }
  // Fallback to process.env (for compatibility)
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_KEY) {
    return process.env.VITE_API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
if (!apiKey) {
  console.warn("⚠️ Gemini API key missing! Check your environment variables in Coolify for VITE_API_KEY.");
}

const ai = new GoogleGenAI({ apiKey });

export const createChatSession = (config: AppConfig) => {
  const modelName = config.model;
  
  // Construct tools configuration
  const tools: any[] = [];
  if (config.useGrounding) {
    tools.push({ googleSearch: {} });
  }

  // Construct configuration object
  const generationConfig: any = {
    // Override standard instruction with one specific to the Beat Store context if generic is passed
    systemInstruction: config.systemInstruction || "You are the 'Weedhead Beats Concierge'. You are a street-smart, expert music producer assistant. Speak the language of urban producers (18-35 demographic). Use terms like 'cook up', 'DAW', '808s', 'sauce', 'placement ready'. Help users write lyrics for beats, suggest rhyme schemes, explain music theory (keys/BPM), and recommend styles. Keep responses punchy, creative, and vibe-focused.",
    tools: tools.length > 0 ? tools : undefined,
  };

  if (config.thinkingBudget > 0) {
    generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
  }

  return ai.chats.create({
    model: modelName,
    config: generationConfig,
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  text: string, 
  images: { mimeType: string; data: string }[]
): Promise<AsyncIterable<GenerateContentResponse>> => {
  
  let messageContent: any = text;

  if (images.length > 0) {
    const parts: any[] = [];
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        }
      });
    });
    if (text) {
      parts.push({ text });
    }
    messageContent = { parts };
  }

  try {
    const result = await chat.sendMessageStream({
      message: messageContent
    });
    return result;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const generateBlogImage = async (prompt: string): Promise<string | null> => {
    try {
        // Use free-tier model instead of premium
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [{ text: `Generate a high quality, cinematic, 4k digital art image for a hip-hop music producer blog post about: ${prompt}. Dark aesthetic, neon green accents, studio equipment, urban vibe. No text on image.` }]
            }
        });

        // Extract base64 image data
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error: any) {
        console.error("Error generating image:", error);
        if (error?.status === 429) {
            console.warn("⚠️ Rate limit exceeded. Please wait a moment and try again.");
        }
        return null; 
    }
};

export const generateSEOContent = async (topic: string): Promise<string> => {
    try {
        // Using free-tier model (gemini-1.5-flash) instead of premium gemini-3-pro
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `You are the content engine for 'Weedhead Beats', a brand for urban home producers (ages 18-35).
            
            Task:
            1. Search for the trending news today related to: "${topic}" (Focus on Hip Hop, Trap, FL Studio, Music Business, or Rap Culture).
            2. Choose the most high-impact story for an independent producer trying to make it.
            3. RECREATE this story as a blog post.
            
            Tone & Style Guide (CRITICAL):
            - **Target Audience**: 18-35 year old bedroom producers, beatmakers, and songwriters.
            - **Voice**: Authentic, street-smart, knowledgeable, "big brother" vibes.
            - **Slang**: Use terms naturally (e.g., "secure the bag", "placement ready", "cook up", "sauce", "the mix", "industry standard").
            - **Formatting**: Short paragraphs, punchy sentences. High readability.
            
            SEO Requirements:
            - Focus Keyword: "${topic}" + "Beats" or "Producer".
            - Include keywords: "Buy Beats Online", "Trap Beats 2024", "Music Production Tips".
            
            Structure:
            1. **Hype Title (H1)**: Click-worthy, uses keywords.
            2. **The Drop (Intro)**: Hook the reader immediately.
            3. **The Cook Up (Body)**: The core news/tips using H2 headers.
            4. **Key Gems (Bullet Points)**: Actionable takeaways.
            5. **Outro**: Call to action to check out the store's latest beats.
            
            Output strictly as Markdown.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        let text = response.text || "";
        
        // Append source links if available
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const links = response.candidates[0].groundingMetadata.groundingChunks
                .filter((c: any) => c.web?.uri)
                .map((c: any) => `[${c.web.title}](${c.web.uri})`)
                .join(', ');
            if (links) {
                text += `\n\n*Street Sources: ${links}*`;
            }
        }

        return text;
    } catch (error: any) {
        console.error("Error generating SEO content:", error);
        if (error?.status === 429) {
            return "## Rate Limit Exceeded\n\nYou've hit the API rate limit. Please wait a moment and try again. The free tier has usage limits.\n\n[Learn more about Gemini API quotas](https://ai.google.dev/gemini-api/docs/rate-limits)";
        }
        return "## System Offline.\n\nThe studio AI is taking a break. Try again in a minute.";
    }
}