import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AlignmentPitchParams {
  creatorName: string;
  platform: string;
  niche: string;
  recentVideos: string[];
  brandName: string;
  brandCategory: string;
  geoTier: string;
  placementFormat: string;
  contentPillars?: string[];
}

/**
 * Generates a hyper-specific, data-backed B2B media alignment pitch using Groq's high-speed LLM service.
 * For YouTube creators.
 */
export async function generateAlignmentPitch(params: AlignmentPitchParams): Promise<string> {
  const {
    creatorName,
    platform,
    niche,
    recentVideos,
    brandName,
    brandCategory,
    geoTier,
    placementFormat,
  } = params;

  const groqMessages = [
    {
      role: 'system' as const,
      content: `You are a senior B2B influencer marketing strategist specializing in the Indian creator economy. You write hyper-specific, data-backed campaign alignment paragraphs for sponsorship pitch decks. Your writing is direct, professional, and never uses generic filler phrases. You always reference specific content the creator has made and connect it concretely to the brand's product category. Maximum 4 sentences. No bullet points. No em dashes.`
    },
    {
      role: 'user' as const,
      content: `Write a campaign alignment paragraph for a sponsorship pitch deck.

Creator Name: ${creatorName}
Platform: ${platform}
Niche: ${niche}
Recent Content Titles: ${recentVideos.join(', ')}
Target Brand: ${brandName}
Brand Product Category: ${brandCategory}
Audience Geography: ${geoTier}
Format: ${placementFormat}

Requirements:
- Reference at least one of the recent content titles by name
- Explain WHY this creator's specific audience is pre-qualified for THIS brand
- Suggest one concrete, specific campaign integration idea (e.g. "a dedicated unboxing segment", "a 60-second mid-roll during setup tours")
- End with a sentence about expected conversion quality, not just reach
- NEVER use these phrases: "leverage creator trust", "seamlessly integrate", "organic contextual", "turning passive viewers into brand advocates"`
    }
  ];

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not defined');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 200,
    });

    const completion = chatCompletion.choices[0]?.message?.content?.trim() || '';
    if (!completion) {
      throw new Error('Received empty content from Groq API');
    }

    return completion;
  } catch (error: any) {
    console.error('⚠️ [AI Error] Groq API completion failed. Using high-converting fallback pitch. Details:', error.message || error);
    
    return `${creatorName}'s authority in the ${niche} space is heavily reinforced by recent high-performing videos covering topics like ${recentVideos.slice(0, 2).map((t) => `"${t}"`).join(' and ')}. This active interest perfectly mirrors ${brandName}'s core value proposition and product advantages. Consequently, their highly engaged viewer base represents an ideal cohort for immediate conversion.`;
  }
}

/**
 * BUG 03 FIX: Instagram-specific Groq prompt.
 * Generates exactly 3 sentences referencing creator's actual content topics,
 * explains why their audience is specifically pre-qualified for the brand,
 * and suggests one concrete named integration idea.
 * Blacklists generic boilerplate phrases.
 */
export async function generateInstagramAlignmentPitch(params: AlignmentPitchParams): Promise<string> {
  const {
    creatorName,
    niche,
    recentVideos,
    brandName,
    brandCategory,
    geoTier,
    placementFormat,
    contentPillars = [],
  } = params;

  // Combine content pillars and recent content for context
  const contentContext = [...contentPillars, ...recentVideos].filter(Boolean).join(', ');

  const groqMessages = [
    {
      role: 'system' as const,
      content: `You are a senior B2B influencer marketing strategist specializing in the Indian Instagram creator economy. You write hyper-specific, data-backed campaign alignment paragraphs for sponsorship pitch decks.

STRICT RULES:
- Write EXACTLY 3 sentences. No more, no less.
- Reference the creator's actual content topics by name.
- Explain specifically why this creator's audience is pre-qualified for the target brand.
- Suggest one concrete, named integration idea (e.g. "a 60-second Reel featuring a morning routine product demo", "a 3-part Stories series showing real-time product testing").
- Be direct and professional. No filler.

BLACKLISTED PHRASES (never use any of these):
- "leverage creator trust"
- "seamlessly integrate"
- "turning passive viewers into brand advocates"
- "pre-qualified cohort"
- "ensure campaign success"
- "organic contextual"
- "capture maximum attention"
- "high-converting B2B brand affinity"
- "dynamic Instagram content"`
    },
    {
      role: 'user' as const,
      content: `Write a 3-sentence campaign alignment paragraph for an Instagram sponsorship pitch deck.

Creator Name: ${creatorName}
Platform: Instagram
Content Niche: ${niche}
Content Pillars: ${contentPillars.join(', ') || niche}
Recent Reel Topics: ${recentVideos.join(', ') || 'Not specified'}
Target Brand: ${brandName}
Brand Product Category: ${brandCategory}
Audience Geography: ${geoTier}
Proposed Format: ${placementFormat}

Sentence 1: Reference the creator's specific content topics (${contentContext}) and explain what their audience actively watches.
Sentence 2: Explain WHY this specific audience would respond to ${brandName}'s ${brandCategory} products — be concrete about the connection.
Sentence 3: Suggest one specific, named integration idea using the proposed format (${placementFormat}).`
    }
  ];

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not defined');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 250,
    });

    const completion = chatCompletion.choices[0]?.message?.content?.trim() || '';
    if (!completion) {
      throw new Error('Received empty content from Groq API');
    }

    return completion;
  } catch (error: any) {
    console.error('⚠️ [AI Error] Instagram Groq API completion failed. Using targeted fallback. Details:', error.message || error);
    
    const topicRef = recentVideos[0] || contentPillars[0] || niche;
    return `${creatorName}'s Instagram content consistently covers ${topicRef}, attracting an audience that actively seeks out ${brandCategory} recommendations. This audience demographic in ${geoTier} directly overlaps with ${brandName}'s target customer profile, making them receptive to authentic product demonstrations. A ${placementFormat} integration featuring a hands-on ${brandCategory} review through ${creatorName}'s signature content style would drive measurable purchase consideration.`;
  }
}
