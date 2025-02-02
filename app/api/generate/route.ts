import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { type Perspective, generateAnswerPrompt, generateQuestionPrompt } from './prompts';

export const runtime = 'edge';

// Schema for the response
const verseSchema = z.object({
  lyric: z.string().describe("The complete generated line in Dylan's style"),
  question: z
    .string()
    .describe('The core question being asked (e.g., "Where have you been?", "What did you see?")'),
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isQuestion = searchParams.get('isQuestion') === 'true';
    const perspective = searchParams.get('perspective') as Perspective;
    const currentQuestion = searchParams.get('currentQuestion');

    // Validate parameters
    if (isQuestion && !perspective) {
      return Response.json(
        { error: 'Perspective is required for generating questions' },
        { status: 400 }
      );
    }
    if (!isQuestion && !currentQuestion) {
      return Response.json(
        { error: 'Current question is required for generating answers' },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: verseSchema,
      schemaName: 'DylanVerse',
      schemaDescription:
        'A verse line from "A Hard Rain\'s A-Gonna Fall" with its associated question',
      prompt: isQuestion
        ? generateQuestionPrompt(perspective)
        : generateAnswerPrompt(currentQuestion!),
      temperature: 0.9,
    });

    return Response.json(object);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to generate line' }, { status: 500 });
  }
}
