import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const genkitSingleton = () => {
  return genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: 'googleai/gemini-2.0-flash',
  });
};

declare global {
  var genkitAiInstance: undefined | ReturnType<typeof genkitSingleton>;
}

export const ai = globalThis.genkitAiInstance ?? genkitSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.genkitAiInstance = ai;
}
