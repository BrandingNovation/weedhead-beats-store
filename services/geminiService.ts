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
        // Using premium models available with paid account
        // Try image generation models first, then fallback to text models
        // Model names need -latest or -001 suffix for v1beta API
        const imageModels = ['gemini-2.5-flash-image', 'gemini-2.0-flash-exp'];
        const textModels = ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-001', 'gemini-1.5-flash-001'];
        
        // Try image generation models first
        for (const modelName of imageModels) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
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
            } catch (error: any) {
                console.warn(`Image model ${modelName} not available, trying next...`, error.message);
                continue;
            }
        }
        
        // If image models don't work, return null (text models can't generate images)
        console.warn("Image generation models not available. Image generation requires specific image-capable models.");
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
        // Using premium models available with paid account
        // Try newer 2.5 models first, then fallback to 1.5 models with -latest suffix
        const modelsToTry = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-001', 'gemini-1.5-flash-001', 'gemini-2.0-flash-exp'];
        let response: any = null;
        let lastError: any = null;
        
        // First, try with tools (googleSearch) for better results
        for (const modelName of modelsToTry) {
            try {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents: `You are the content engine for 'Weedhead Beats', a brand for urban home producers (ages 18-35).
                    
                    Task:
                    1. Search for the trending news today related to: "${topic}" (Focus on Hip Hop, Trap, FL Studio, Music Business, or Rap Culture).
                    2. Choose the most high-impact story for an independent producer trying to make it.
                    3. Write a professional blog post following standard blog formatting protocol.
                    
                    Tone & Style Guide (CRITICAL):
                    - **Target Audience**: 18-35 year old bedroom producers, beatmakers, and songwriters.
                    - **Voice**: Authentic, street-smart, knowledgeable, "big brother" vibes.
                    - **Slang**: Use terms naturally (e.g., "secure the bag", "placement ready", "cook up", "sauce", "the mix", "industry standard").
                    - **Formatting**: Short paragraphs (2-4 sentences max), punchy sentences. High readability.
                    
                    SEO Requirements:
                    - Focus Keyword: "${topic}" + "Beats" or "Producer".
                    - Include keywords: "Buy Beats Online", "Trap Beats 2024", "Music Production Tips".
                    
                    Standard Blog Format Protocol:
                    1. **Title (H1)**: One clear, SEO-optimized headline. Click-worthy, uses keywords naturally.
                    2. **Introduction Paragraph**: 2-3 sentences that hook the reader and introduce the topic. End with what they'll learn.
                    3. **Body Sections (H2 headers)**: Each section should be 2-4 paragraphs. Use descriptive H2 headers.
                    4. **Subsections (H3 headers)**: Break down complex topics with H3 headers when needed.
                    5. **Bullet Points or Numbered Lists**: Use for actionable takeaways, tips, or key points.
                    6. **Conclusion Paragraph**: 2-3 sentences summarizing key points and call to action.
                    
                    Formatting Rules:
                    - Use proper Markdown: # for H1, ## for H2, ### for H3
                    - Bold important terms: **term**
                    - Use bullet points (-) or numbered lists (1.) for lists
                    - Keep paragraphs short (2-4 sentences)
                    - Use line breaks between sections
                    - Include a call-to-action at the end
                    
                    Output strictly as Markdown following this structure.`,
                    config: {
                        tools: [{ googleSearch: {} }]
                    }
                });
                // Success! Break out of loop
                break;
            } catch (error: any) {
                lastError = error;
                console.warn(`Model ${modelName} with tools failed, trying next...`, error.message);
                continue;
            }
        }
        
        // If all models with tools failed, try without tools
        if (!response) {
            for (const modelName of modelsToTry) {
                try {
                    response = await ai.models.generateContent({
                        model: modelName,
                        contents: `You are the content engine for 'Weedhead Beats', a brand for urban home producers (ages 18-35).
                        
                        Task:
                        Write a professional blog post about: "${topic}" (Focus on Hip Hop, Trap, FL Studio, Music Business, or Rap Culture).
                        
                        Tone & Style Guide (CRITICAL):
                        - **Target Audience**: 18-35 year old bedroom producers, beatmakers, and songwriters.
                        - **Voice**: Authentic, street-smart, knowledgeable, "big brother" vibes.
                        - **Slang**: Use terms naturally (e.g., "secure the bag", "placement ready", "cook up", "sauce", "the mix", "industry standard").
                        - **Formatting**: Short paragraphs (2-4 sentences max), punchy sentences. High readability.
                        
                        SEO Requirements:
                        - Focus Keyword: "${topic}" + "Beats" or "Producer".
                        - Include keywords: "Buy Beats Online", "Trap Beats 2024", "Music Production Tips".
                        
                        Standard Blog Format Protocol:
                        1. **Title (H1)**: One clear, SEO-optimized headline. Click-worthy, uses keywords naturally.
                        2. **Introduction Paragraph**: 2-3 sentences that hook the reader and introduce the topic. End with what they'll learn.
                        3. **Body Sections (H2 headers)**: Each section should be 2-4 paragraphs. Use descriptive H2 headers.
                        4. **Subsections (H3 headers)**: Break down complex topics with H3 headers when needed.
                        5. **Bullet Points or Numbered Lists**: Use for actionable takeaways, tips, or key points.
                        6. **Conclusion Paragraph**: 2-3 sentences summarizing key points and call to action.
                        
                        Formatting Rules:
                        - Use proper Markdown: # for H1, ## for H2, ### for H3
                        - Bold important terms: **term**
                        - Use bullet points (-) or numbered lists (1.) for lists
                        - Keep paragraphs short (2-4 sentences)
                        - Use line breaks between sections
                        - Include a call-to-action at the end
                        
                        Output strictly as Markdown following this structure.`
                    });
                    // Success! Break out of loop
                    break;
                } catch (error: any) {
                    lastError = error;
                    console.warn(`Model ${modelName} without tools failed, trying next...`, error.message);
                    continue;
                }
            }
        }
        
        if (!response) {
            throw lastError || new Error("All models failed");
        }
        
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