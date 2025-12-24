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
        // Note: Only use models that actually exist in the Gemini API
        // Removed non-existent models: nano-banana, imagen-3, imagen-3.0, imagen-3.0-generate-001
        // Prioritize gemini-2.5-flash-image as primary model
        const imageModels = [
          'gemini-2.5-flash-image',
          'gemini-2.0-flash-exp-image-generation',
          'gemini-2.0-flash-exp'
        ];
        const textModels = ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-001', 'gemini-1.5-flash-001'];
        
        // Enhanced image generation prompt with detailed specifications - PHOTOREALISTIC ONLY
        const imagePrompt = `Generate a PHOTOREALISTIC, HIGH-RESOLUTION image for a modern hip-hop beat store blog post. This MUST be a REALISTIC PHOTOGRAPHIC IMAGE, NOT a cartoon, illustration, animated, or digital art.

CRITICAL: Generate ONLY photorealistic photography. NO animations, NO cartoons, NO illustrations, NO digital art, NO 3D renders.

Subject:
${prompt}

CRITICAL STYLE REQUIREMENTS:
- PHOTOREALISTIC PHOTOGRAPHY ONLY - must look like a real photograph taken with a professional camera
- NO cartoons, NO illustrations, NO digital art, NO 3D renders, NO anime style
- Realistic, professional photography look - like a magazine photo or documentary still
- Modern hip-hop culture aesthetic
- Gritty but clean
- Cinematic lighting with natural shadows
- Urban environments (studio spaces, city streets at night, neon accents, creative workspaces)

Branding & Color Palette:
- Primary colors: black, dark green, white, and gray
- Subtle green accents (neon lights, smoke tint, LED glow, reflections)
- No logos or readable text in the image
- No watermarks

People & Objects (if applicable):
- Real people only (diverse, authentic hip-hop aesthetic)
- Natural poses, candid moments
- No exaggerated fashion or costumes
- Modern streetwear, studio gear, microphones, MPCs, laptops, vinyl, headphones, city textures

Composition:
- Centered focal subject
- Clean depth of field
- Strong contrast
- High detail and sharpness
- Suitable for website hero images and blog thumbnails

Technical Requirements:
- PHOTOREALISTIC PHOTOGRAPHY - must look like a real camera photograph
- 16:9 aspect ratio
- 4K quality
- ABSOLUTELY NO illustration, NO anime, NO 3D render, NO cartoon style, NO digital art
- Natural skin tones and realistic textures
- Realistic shadows and lighting (like real photography)
- Depth of field and bokeh effects (photographic qualities)

Overall Feel:
- Premium
- Underground but polished
- Forward-thinking hip-hop culture
- Matches the brand identity of weedheadbeats.com

HARD RULES (DO NOT BREAK THESE - CRITICAL):
❌ NO text overlays
❌ NO cartoon style - MUST be photorealistic photography
❌ NO illustration style - MUST be photorealistic photography
❌ NO digital art style - MUST be photorealistic photography
❌ NO 3D render style - MUST be photorealistic photography
❌ NO anime style - MUST be photorealistic photography
❌ NO animated images - MUST be static photorealistic photography
❌ NO animations - MUST be static photorealistic photography
❌ NO AI-looking faces - use realistic human faces
❌ NO fantasy elements
❌ NO logos (including WeedHead Beats logo)
✅ MUST be STATIC PHOTOREALISTIC PHOTOGRAPHY that looks like a real camera photograph
✅ MUST be a still image, NOT animated or moving`;
        
        // Try image generation models first
        for (const modelName of imageModels) {
            try {
                console.log(`🖼️ Trying image model: ${modelName}`);
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: {
                        parts: [{ text: imagePrompt }]
                    }
                });

                // Extract base64 image data
                for (const part of response.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        console.log(`✅ Image generated successfully with model: ${modelName}`);
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                
                // Check if response has image data in different format
                if (response.candidates?.[0]?.content?.parts) {
                    console.log(`⚠️ Model ${modelName} responded but no inlineData found. Response structure:`, Object.keys(response.candidates[0].content.parts[0] || {}));
                }
            } catch (error: any) {
                console.warn(`❌ Image model ${modelName} failed:`, error.message);
                if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
                    console.warn(`   Model ${modelName} doesn't exist, trying next...`);
                }
                continue;
            }
        }
        
        // If image models don't work, log detailed error
        console.error("❌ All image generation models failed. Image generation requires specific image-capable models.");
        console.error("💡 Note: Google's image generation might require a different API endpoint or model name.");
        console.error("💡 Check Google AI Studio for available image generation models.");
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
                    1. Search for trending news, tips, tutorials, or insights related to: "${topic}" (Cover ALL aspects of beat making: production techniques, mixing, mastering, sound design, music theory, DAWs, hardware, software, plugins, sampling, drum programming, melody creation, chord progressions, arrangement, music business, marketing, selling beats, collaborations, industry news, artist features, producer spotlights, and more).
                    2. Choose the most valuable and high-impact content for an independent producer trying to make it.
                    3. Write a comprehensive, SEO-optimized blog post with substantial content (minimum 800-1200 words).
                    
                    IMPORTANT: Do NOT focus only on FL Studio. Cover diverse beat making topics including:
                    - All DAWs (Ableton, Logic Pro, Pro Tools, Reaper, Studio One, etc.)
                    - Production techniques and workflows
                    - Mixing and mastering
                    - Sound design and synthesis
                    - Music theory for producers
                    - Sampling and sample packs
                    - Drum programming and rhythm
                    - Melody and harmony
                    - Arrangement and structure
                    - Music business and monetization
                    - Marketing and promotion
                    - Collaborations and networking
                    - Hardware and gear
                    - Software and plugins
                    - Industry trends and news
                    - Artist and producer features
                    
                    Tone & Style Guide (CRITICAL):
                    - **Target Audience**: 18-35 year old bedroom producers, beatmakers, and songwriters.
                    - **Voice**: Authentic, street-smart, knowledgeable, "big brother" vibes.
                    - **Slang**: Use terms naturally (e.g., "secure the bag", "placement ready", "cook up", "sauce", "the mix", "industry standard").
                    - **Content Length**: Write extensively. Each paragraph should be 4-6 sentences. Each section should have 3-5 paragraphs minimum.
                    - **Depth**: Provide detailed explanations, examples, and actionable insights. Don't be brief.
                    
                    SEO Optimization Requirements (CRITICAL):
                    - **Focus Keyword**: "${topic}" + "Beats" or "Producer" - use naturally throughout (aim for 1-2% keyword density)
                    - **Primary Keywords**: Include naturally: "Buy Beats Online", "Trap Beats 2024", "Music Production Tips", "Hip Hop Beats", "Producer Beats", "Beat Store"
                    - **Long-tail Keywords**: Include variations like "${topic} beats for sale", "best ${topic} beats", "professional ${topic} production"
                        - **Title**: Must include focus keyword, be 50-60 characters, compelling and click-worthy
                        - **Header Structure**: Use H2 (##) and H3 (###) headers that include keywords naturally. When writing H3 headers, use EXACTLY "### Header Text" format - NEVER include "H3:" prefix text. When writing H2 headers, use EXACTLY "## Header Text" format - NEVER include "H2:" prefix text.
                    - **Internal Linking**: Reference "Weedhead Beats store", "our beat catalog", "check out our beats"
                    - **External Context**: Mention relevant artists, producers, or industry trends naturally
                    
                        Standard Blog Format Protocol:
                        1. **Title (H1)**: SEO-optimized headline (50-60 chars) with focus keyword, compelling and click-worthy
                        2. **Introduction Paragraph**: 5-7 sentences that hook the reader, introduce the topic, provide context, and preview what they'll learn. End with a clear value proposition.
                        3. **Body Sections (H2 and H3 headers)**: Each section should be 3-5 paragraphs (4-6 sentences each). Use descriptive H2 headers for main sections and H3 headers for subsections. Minimum 4-5 H2 sections. When writing H3 headers, use "### Header Text" format - DO NOT include "H3:" prefix text.
                        4. **Bullet Points or Numbered Lists**: Use for actionable takeaways, tips, or key points. Make lists substantial (5-8 items).
                        5. **Examples and Case Studies**: Include real-world examples, scenarios, or brief case studies to add depth.
                        6. **Conclusion Paragraph**: 5-7 sentences summarizing key points, reinforcing main message, and strong call to action to visit Weedhead Beats store.
                        
                        CRITICAL FORMATTING RULES - DO NOT VIOLATE:
                        - NEVER include "Meta Description:" or "meta description" anywhere in the visible content
                        - NEVER write "H3:" before headers - only use "### " for H3 headers
                        - NEVER write "H2:" before headers - only use "## " for H2 headers
                        - NEVER write headers like "H3: Header Text" or "H2: Header Text" - only write "### Header Text" or "## Header Text"
                        - Use H2 (##) for main sections and H3 (###) for subsections
                        - Meta descriptions are for SEO metadata ONLY, not for visible content - DO NOT include them in the output
                        - If you write H3 headers, use EXACTLY this format: "### Header Text" (no "H3:" prefix)
                        - If you write H2 headers, use EXACTLY this format: "## Header Text" (no "H2:" prefix)
                    
                    Content Requirements:
                    - **Minimum Word Count**: 800-1200 words (aim for comprehensive, detailed content)
                    - **Paragraph Length**: 4-6 sentences per paragraph (not 2-4)
                    - **Section Depth**: Each H2 section must have 3-5 paragraphs minimum
                    - **Value**: Provide actionable insights, tips, strategies, or information readers can use immediately
                    - **Engagement**: Use rhetorical questions, relatable scenarios, and engaging language
                    - **Authority**: Demonstrate expertise through detailed explanations and industry knowledge
                    
                        Formatting Rules:
                        - Use proper Markdown: # for H1, ## for H2, ### for H3
                        - When writing H3 headers, use EXACTLY "### Header Text" - NEVER include "H3:" prefix
                        - When writing H2 headers, use EXACTLY "## Header Text" - NEVER include "H2:" prefix
                        - NEVER write "H3: Header Text" or "H2: Header Text" - only write "### Header Text" or "## Header Text"
                        - NEVER include "Meta Description:" or "meta description" anywhere in visible content
                        - Bold important terms and keywords: **term**
                        - Use bullet points (-) or numbered lists (1.) for lists (make them substantial)
                        - Keep paragraphs substantial (4-6 sentences)
                        - Use line breaks between sections
                        - Include internal links naturally (e.g., "check out our beat store", "browse our catalog")
                        - Include a strong call-to-action at the end encouraging readers to visit Weedhead Beats
                        - Meta descriptions are for SEO metadata ONLY, not for visible content - DO NOT output them
                    
                    Output strictly as Markdown following this structure. Write extensively - this should be a comprehensive, valuable piece of content.`,
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
                        Write a comprehensive, SEO-optimized blog post about: "${topic}" (Focus on Hip Hop, Trap, FL Studio, Music Business, or Rap Culture). Minimum 800-1200 words.
                        
                        Tone & Style Guide (CRITICAL):
                        - **Target Audience**: 18-35 year old bedroom producers, beatmakers, and songwriters.
                        - **Voice**: Authentic, street-smart, knowledgeable, "big brother" vibes.
                        - **Slang**: Use terms naturally (e.g., "secure the bag", "placement ready", "cook up", "sauce", "the mix", "industry standard").
                        - **Content Length**: Write extensively. Each paragraph should be 4-6 sentences. Each section should have 3-5 paragraphs minimum.
                        - **Depth**: Provide detailed explanations, examples, and actionable insights. Don't be brief.
                        
                        SEO Optimization Requirements (CRITICAL):
                        - **Focus Keyword**: "${topic}" + "Beats" or "Producer" - use naturally throughout (aim for 1-2% keyword density)
                        - **Primary Keywords**: Include naturally: "Buy Beats Online", "Trap Beats 2024", "Music Production Tips", "Hip Hop Beats", "Producer Beats", "Beat Store"
                        - **Long-tail Keywords**: Include variations like "${topic} beats for sale", "best ${topic} beats", "professional ${topic} production"
                        - **Title**: Must include focus keyword, be 50-60 characters, compelling and click-worthy
                        - **Header Structure**: Use H2 and H3 headers that include keywords naturally
                        - **Internal Linking**: Reference "Weedhead Beats store", "our beat catalog", "check out our beats"
                        
                        Standard Blog Format Protocol:
                        1. **Title (H1)**: SEO-optimized headline (50-60 chars) with focus keyword
                        2. **Introduction Paragraph**: 5-7 sentences that hook, introduce topic, provide context, preview value
                        3. **Body Sections (H2 and H3 headers)**: 3-5 paragraphs each (4-6 sentences per paragraph). Minimum 4-5 H2 sections. Use H3 for subsections. When writing H3 headers, use "### Header Text" - DO NOT include "H3:" prefix text.
                        4. **Bullet Points or Numbered Lists**: Substantial lists (5-8 items) for takeaways
                        5. **Examples**: Include real-world examples and scenarios
                        6. **Conclusion Paragraph**: 5-7 sentences summarizing and strong CTA to visit Weedhead Beats
                        
                        CRITICAL FORMATTING RULES - DO NOT VIOLATE:
                        - NEVER include "Meta Description:" or "meta description" anywhere in the visible content
                        - NEVER write "H3:" before headers - only use "### " for H3 headers
                        - NEVER write "H2:" before headers - only use "## " for H2 headers
                        - NEVER write headers like "H3: Header Text" or "H2: Header Text" - only write "### Header Text" or "## Header Text"
                        - Use H2 (##) for main sections and H3 (###) for subsections
                        - Meta descriptions are for SEO metadata ONLY, not for visible content - DO NOT output them
                        
                        Content Requirements:
                        - **Minimum Word Count**: 800-1200 words
                        - **Paragraph Length**: 4-6 sentences per paragraph
                        - **Section Depth**: Each H2 section must have 3-5 paragraphs minimum
                        - **Value**: Provide actionable insights and detailed information
                        
                        Formatting Rules:
                        - Use proper Markdown: # for H1, ## for H2, ### for H3
                        - When writing H3 headers, use EXACTLY "### Header Text" - NEVER include "H3:" prefix
                        - When writing H2 headers, use EXACTLY "## Header Text" - NEVER include "H2:" prefix
                        - NEVER write "H3: Header Text" or "H2: Header Text" - only write "### Header Text" or "## Header Text"
                        - NEVER include "Meta Description:" or "meta description" anywhere in visible content
                        - Bold important terms: **term**
                        - Use bullet points (-) or numbered lists (1.) for lists
                        - Keep paragraphs substantial (4-6 sentences)
                        - Use line breaks between sections
                        - Include internal links naturally
                        - Strong call-to-action at the end
                        - Meta descriptions are for SEO metadata ONLY, not visible content - DO NOT output them
                        
                        CRITICAL - DO NOT VIOLATE:
                        - NEVER write "H3:" or "H2:" before any header
                        - NEVER write "Meta Description:" in the visible content
                        - Only use "### " for H3 headers, never "H3:"
                        - Only use "## " for H2 headers, never "H2:"
                        
                        Output strictly as Markdown following this structure. Write extensively - comprehensive, valuable content.`
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