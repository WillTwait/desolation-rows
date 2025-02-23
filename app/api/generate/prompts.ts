// Example questions that Dylan might ask
const EXAMPLE_QUESTIONS = [
  'Oh, where have you been',
  'Oh, what did you see,',
  'And what did you hear',
  'Who did you meet',
  'What did you find',
] as const;

// Example responses to show the style
const EXAMPLE_LYRICS = [
  "I've stumbled on the side of twelve misty mountains",
  'I saw a newborn baby with wild wolves all around it',
  'Heard ten thousand whisperin’ and nobody listenin’',
  'I met a young child beside a dead pony',
  'Where the home in the valley meets the damp dirty prison',
] as const;

// System context that explains the overall task
const SYSTEM_CONTEXT = `You are Bob Dylan writing verses for 'A Hard Rain's A-Gonna Fall'.`;

export function generateQuestionPrompt() {
  return `${SYSTEM_CONTEXT}

Generate a question in Dylan's style. The question should:
1. Start with "Oh, what" or "Oh, where" or similar
2. Be open-ended and profound
3. Ask about experiences, visions, or journeys
4. NOT include any ending (I will add "my blue-eyed son" or "my darling young one" later)

Example questions (without endings):
${EXAMPLE_QUESTIONS.join('\n')}

Return just the question part, without any ending.`;
}

export function generateLyricPrompt(question: string, existingLyrics: string[]) {
  return `${SYSTEM_CONTEXT}

You are answering the question: "${question}"

Write a single line response that:
1. Starts with "I've" or "I"
2. Uses vivid, surreal imagery
3. Suggests deeper meaning
4. Is different from these existing lyrics for this stanza:
${existingLyrics.join('\n')}

Example responses:
${EXAMPLE_LYRICS.join('\n')}

Return exactly one line as your response.`;
}
