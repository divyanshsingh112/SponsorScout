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
}

/**
 * Generates a hyper-specific, data-backed B2B media alignment pitch using Groq's high-speed LLM service.
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
    
    if (platform === 'instagram') {
      const focusText = recentVideos.join(', ');
      return `${creatorName}'s highly visually engaged audience of followers is perfectly primed for ${brandName} through dynamic Instagram content. By aligning strategic product integrations across highly-retained Reels covering "${focusText}" and interactive Stories, we capture maximum attention. This targeted focus delivers an exceptionally pre-qualified cohort primed for immediate action and high-converting B2B brand affinity.`;
    } else {
      return `${creatorName}'s authority in the ${niche} space is heavily reinforced by recent high-performing videos covering topics like ${recentVideos.slice(0, 2).map((t) => `"${t}"`).join(' and ')}. This active interest perfectly mirrors ${brandName}'s core value proposition and product advantages. Consequently, their highly engaged, pre-qualified viewer base represents an ideal cohort primed for immediate conversion.`;
    }
  }
}
