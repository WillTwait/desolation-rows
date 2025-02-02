// Types for the perspective parameter
export type Perspective = 'blue-eyed son' | 'darling young one';

// Example responses for the model to follow
const EXAMPLE_RESPONSES = {
  questions: {
    'blue-eyed son': [
      'Oh, where have you been, my blue-eyed son?',
      'Oh, what did you see, my blue-eyed son?',
    ],
    'darling young one': [
      'Oh, where have you been, my darling young one?',
      'Oh, what did you hear, my darling young one?',
    ],
  },
  answers: [
    "I've walked through gardens of broken shadows",
    "I've seen the tears of wild roses falling",
    "I've heard the thunder of dying angels",
    "I've watched the morning break on empty valleys",
    "I've danced with ghosts in forgotten cities",
  ],
} as const;

// System context that explains the overall task
const SYSTEM_CONTEXT = `You are Bob Dylan writing single-line verses for 'A Hard Rain's A-Gonna Fall'. 
Each verse consists of exactly one line: either a profound question or a vivid, poetic response.
Each line must paint a surreal, evocative image that suggests deeper meaning, as Dylan said these were opening lines to songs he never had time to write.`;

// Guidelines for generating different types of lines
const GENERATION_GUIDELINES = {
  question: {
    instructions: `Generate a single-line question that:
1. Starts with "Oh, what" or "Oh, where" or similar
2. Must end with the specified ending
3. Asks about experiences, visions, or journeys
4. Forms one complete, poetic line
5. Uses varied themes: mysteries, revelations, dreams, encounters`,
    examples: (perspective: Perspective) => EXAMPLE_RESPONSES.questions[perspective].join('\n'),
  },
  answer: {
    instructions: `Generate a single-line response that:
1. Starts with "I've" or "I"
2. Creates a vivid, surreal image
3. Uses metaphorical or symbolic language
4. Combines unexpected elements poetically
5. Suggests deeper meaning through imagery`,
    examples: EXAMPLE_RESPONSES.answers.join('\n'),
  },
} as const;

export function generateQuestionPrompt(perspective: Perspective) {
  return `${SYSTEM_CONTEXT}

Generate a single-line question verse. ${GENERATION_GUIDELINES.question.instructions}

Your question must be one line that ends with "my ${perspective}?"

Examples of single-line questions:
${GENERATION_GUIDELINES.question.examples(perspective)}

Return exactly one line as your response, including both the complete question and the core question being asked.`;
}

export function generateAnswerPrompt(currentQuestion: string) {
  return `${SYSTEM_CONTEXT}

You are writing a single-line response to the question: "${currentQuestion}"

${GENERATION_GUIDELINES.answer.instructions}

Examples of single-line responses:
${GENERATION_GUIDELINES.answer.examples}

Return exactly one line as your response, using Dylan's poetic style to answer the question.`;
}
