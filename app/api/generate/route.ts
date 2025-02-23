import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { generateLyricPrompt, generateQuestionPrompt } from './prompts';

export const runtime = 'edge';

// Schema for the response
const questionSchema = z.object({
  question: z.string().describe('The base question without any ending'),
});

const lyricSchema = z.object({
  lyric: z.string().describe('A single line response'),
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'question') {
      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: questionSchema,
        schemaName: 'DylanQuestion',
        prompt: generateQuestionPrompt(),
        temperature: 0.9,
      });

      // Return both versions of the question
      return Response.json({
        blueEyedSon: `${object.question}, my blue-eyed son?`,
        darlingYoungOne: `${object.question}, my darling young one?`,
      });
    }

    if (type === 'lyric') {
      const question = searchParams.get('question');
      const existingLyrics = searchParams.getAll('existingLyrics');

      if (!question) {
        return Response.json(
          { error: 'Question is required for generating lyrics' },
          { status: 400 }
        );
      }

      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: lyricSchema,
        schemaName: 'DylanLyric',
        prompt: generateLyricPrompt(question, existingLyrics),
        temperature: 0.9,
      });

      return Response.json(object);
    }

    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to generate line' }, { status: 500 });
  }
}
