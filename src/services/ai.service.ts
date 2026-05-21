import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates a B2B media alignment pitch using Groq's high-speed LLM service.
 * Explains why the channel's recent videos prime the audience to purchase from the target sponsor.
 * 
 * @param channelName YouTube Channel Name
 * @param niche Niche of the creator
 * @param targetSponsor Target Sponsor Brand Name
 * @param recentVideoTitles List of recent video titles (up to 5)
 */
export async function generateAlignmentPitch(
  channelName: string,
  niche: string,
  targetSponsor: string,
  recentVideoTitles: string[]
): Promise<string> {
  const titlesString = recentVideoTitles.map((t) => `"${t}"`).join(', ');

  const systemPrompt = `You are an elite B2B media buyer. Write exactly 3 sentences (maximum 45 words) explaining why [Channel Name]'s recent videos about [Video Titles] make their [Niche] audience perfectly primed to buy products from [Target Sponsor]. Be highly persuasive. Do not include any introductory or concluding conversational text. Output only the 3 sentences.`;

  const userPrompt = `Channel Name: ${channelName}
Niche: ${niche}
Target Sponsor: ${targetSponsor}
Video Titles: ${titlesString}`;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not defined');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 120,
    });

    const completion = chatCompletion.choices[0]?.message?.content?.trim() || '';
    if (!completion) {
      throw new Error('Received empty content from Groq API');
    }

    return completion;
  } catch (error: any) {
    console.error('⚠️ [AI Error] Groq API completion failed. Using high-converting fallback pitch. Details:', error.message || error);
    
    // Premium fallback pitch aligning precisely with the parameters
    return `${channelName}'s authority in the ${niche} space is heavily reinforced by recent high-performing videos covering topics like ${recentVideoTitles.slice(0, 2).map((t) => `"${t}"`).join(' and ')}. This active interest perfectly mirrors ${targetSponsor}'s core value proposition and product advantages. Consequently, their highly engaged, pre-qualified viewer base represents an ideal cohort primed for immediate conversion.`;
  }
}
