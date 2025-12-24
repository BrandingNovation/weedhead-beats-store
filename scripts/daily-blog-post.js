#!/usr/bin/env node

/**
 * Daily Blog Post Generator
 * 
 * This script automatically generates and posts a new blog post every day.
 * Run this script daily using a cron job or scheduled task.
 * 
 * Usage:
 *   node scripts/daily-blog-post.js [topic]
 * 
 * If no topic is provided, it will use a default topic.
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if it exists
const loadEnv = () => {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
    return env;
  } catch (e) {
    return {};
  }
};

const env = loadEnv();

// Get configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
const apiKey = process.env.VITE_API_KEY || env.VITE_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!apiKey) {
  console.error('❌ Error: Missing Gemini API key');
  console.error('   Set VITE_API_KEY');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey });

// Default topics for blog posts
const DEFAULT_TOPICS = [
  'Hip Hop Production',
  'Trap Beats',
  'Music Production Tips',
  'FL Studio Tutorials',
  'Beat Making',
  'Music Business',
  'Producer News',
  'Rap Culture',
  'Music Industry',
  'Home Studio Setup'
];

// Get topic from command line or use random default
const topic = process.argv[2] || DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];

console.log(`📝 Generating daily blog post about: "${topic}"`);

/**
 * Generate blog content using Gemini AI
 */
async function generateBlogContent(topic) {
  const modelsToTry = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`   Trying model: ${modelName}...`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `You are the content engine for 'Weedhead Beats', a brand for urban home producers (ages 18-35).
        
        Task:
        1. Search for trending news, tips, tutorials, or insights related to: "${topic}" (Cover ALL aspects of beat making: production techniques, mixing, mastering, sound design, music theory, DAWs, hardware, software, plugins, sampling, drum programming, melody creation, chord progressions, arrangement, music business, marketing, selling beats, collaborations, industry news, artist features, producer spotlights, and more).
        2. Choose the most valuable and high-impact content for an independent producer trying to make it.
        3. Write a comprehensive, SEO-optimized blog post with substantial content (minimum 800-1200 words).
        
        IMPORTANT: Do NOT focus only on FL Studio. Cover diverse beat making topics including all DAWs, production techniques, mixing, mastering, sound design, music theory, sampling, drum programming, melody, arrangement, music business, marketing, collaborations, hardware, software, plugins, industry trends, and artist features.
        
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
        - **Meta Description**: DO NOT write or include meta descriptions in the content. Meta descriptions are for SEO metadata only and should NOT appear in the blog post content.
        - **Header Structure**: Use H2 and H3 headers that include keywords naturally. When using H3 headers, write them EXACTLY as "### Header Text" - NEVER include "H3:" prefix text. NEVER write "H3: Header Text" - only write "### Header Text"
        - **Internal Linking**: Reference "Weedhead Beats store", "our beat catalog", "check out our beats"
        
        CRITICAL FORMATTING RULES - DO NOT VIOLATE:
        - NEVER include "Meta Description:" or "meta description" anywhere in the content
        - NEVER write "H3:" before headers - only use "### " for H3 headers
        - NEVER write headers like "H3: Header Text" - only write "### Header Text"
        - Meta descriptions are for SEO metadata ONLY, not for visible content
        
        Standard Blog Format Protocol:
        1. **Title (H1)**: SEO-optimized headline (50-60 chars) with focus keyword, compelling and click-worthy
        2. **Introduction Paragraph**: 5-7 sentences that hook the reader, introduce the topic, provide context, and preview what they'll learn. End with a clear value proposition.
        3. **Body Sections (H2 and H3 headers)**: Each section should be 3-5 paragraphs (4-6 sentences each). Use descriptive H2 headers for main sections and H3 headers for subsections. Minimum 4-5 H2 sections. When writing H3 headers, use EXACTLY "### Header Text" format - NEVER include "H3:" prefix text.
        5. **Bullet Points or Numbered Lists**: Use for actionable takeaways, tips, or key points. Make lists substantial (5-8 items).
        6. **Examples and Case Studies**: Include real-world examples, scenarios, or brief case studies to add depth.
        7. **Conclusion Paragraph**: 5-7 sentences summarizing key points, reinforcing main message, and strong call to action to visit Weedhead Beats store.
        
        Content Requirements:
        - **Minimum Word Count**: 800-1200 words (aim for comprehensive, detailed content)
        - **Paragraph Length**: 4-6 sentences per paragraph (not 2-4)
        - **Section Depth**: Each H2 section must have 3-5 paragraphs minimum
        - **Value**: Provide actionable insights, tips, strategies, or information readers can use immediately
        - **Engagement**: Use rhetorical questions, relatable scenarios, and engaging language
        - **Authority**: Demonstrate expertise through detailed explanations and industry knowledge
        
        Formatting Rules:
        - Use proper Markdown: # for H1, ## for H2, ### for H3
        - Bold important terms and keywords: **term**
        - Use bullet points (-) or numbered lists (1.) for lists (make them substantial)
        - Keep paragraphs substantial (4-6 sentences)
        - Use line breaks between sections
        - Include internal links naturally (e.g., "check out our beat store", "browse our catalog")
        - Include a strong call-to-action at the end encouraging readers to visit Weedhead Beats
        
        Output strictly as Markdown following this structure. Write extensively - this should be a comprehensive, valuable piece of content.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const content = response.text || '';
      if (content) {
        console.log(`   ✅ Successfully generated content with ${modelName}`);
        return content;
      }
    } catch (error) {
      console.warn(`   ⚠️  Model ${modelName} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All models failed to generate content');
}

/**
 * Generate blog image using Gemini AI
 */
async function generateBlogImage(title) {
  const imagePrompt = `Create a high-resolution, photorealistic image for a modern hip-hop beat store blog post.

Subject:
${title}

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
❌ NO AI-looking faces - use realistic human faces
❌ NO fantasy elements
❌ NO logos (including WeedHead Beats logo)
✅ MUST be PHOTOREALISTIC PHOTOGRAPHY that looks like a real camera photograph`;

  // Try image generation models - prioritize imagen models for photorealistic images
  const imageModels = ['imagen-3', 'imagen-3.0-generate-001', 'nano-banana', 'gemini-2.5-flash-image', 'gemini-2.0-flash-exp'];
  const textModels = ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
  
  for (const modelName of [...imageModels, ...textModels]) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: imagePrompt }]
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

/**
 * Convert base64 image to file and upload to Supabase Storage
 */
async function uploadImageToStorage(base64Image, title) {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    return null;
  }
  
  try {
    const base64Data = base64Image.split(',')[1];
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';
    const byteCharacters = Buffer.from(base64Data, 'base64');
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(fileName, byteCharacters, {
        contentType: mimeType,
        upsert: false
      });
    
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);
      console.log(`   ✅ Image uploaded to Storage: ${publicUrl}`);
      return publicUrl;
    }
  } catch (error) {
    console.warn(`   ⚠️  Failed to upload image:`, error.message);
  }
  
  return null;
}

/**
 * Extract title from markdown content
 */
function extractTitle(content) {
  const titleMatch = content.match(/^# (.+)$/m);
  return titleMatch ? titleMatch[1].trim() : `Daily Update: ${topic}`;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting daily blog post generation...\n');
    
    // 1. Generate blog content
    console.log('📝 Step 1: Generating blog content...');
    const content = await generateBlogContent(topic);
    
    // 2. Extract title
    const title = extractTitle(content);
    const slug = generateSlug(title);
    const excerpt = content.substring(0, 200) + '...';
    
    console.log(`   ✅ Title: ${title}`);
    console.log(`   ✅ Content length: ${content.length} characters\n`);
    
    // 3. Generate image
    console.log('🖼️  Step 2: Generating blog image...');
    const imageBase64 = await generateBlogImage(title);
    let imageUrl = null;
    
    if (imageBase64) {
      imageUrl = await uploadImageToStorage(imageBase64, title);
    }
    
    if (!imageUrl) {
      // Use fallback image
      imageUrl = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop';
      console.log('   ⚠️  Using fallback image');
    }
    
    // 4. Save to Supabase
    console.log('\n💾 Step 3: Saving to Supabase...');
    const postData = {
      title: title,
      excerpt: excerpt,
      content: content,
      image: imageUrl,
      slug: slug,
      is_ai_generated: true,
      published: true
    };
    
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();
    
    if (error) {
      throw error;
    }
    
    if (data && data[0]) {
      console.log(`   ✅ Blog post saved successfully!`);
      console.log(`   📄 Post ID: ${data[0].id}`);
      console.log(`   🔗 Slug: ${slug}`);
      console.log(`\n✨ Daily blog post created successfully!`);
      process.exit(0);
    } else {
      throw new Error('No data returned from insert');
    }
    
  } catch (error) {
    console.error('\n❌ Error generating daily blog post:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();



