// The use server directive is necessary here because the functions use genkit.
'use server';

/**
 * @fileOverview Generates a texture for a 3D model based on a text prompt.
 *
 * - generateTextureForModel - A function that generates a texture for a 3D model.
 * - GenerateTextureForModelInput - The input type for the generateTextureForModel function.
 * - GenerateTextureForModelOutput - The return type for the generateTextureForModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextureForModelInputSchema = z.object({
  modelId: z.string().describe('The ID of the 3D model to apply the texture to.'),
  texturePrompt: z.string().describe('A text prompt describing the desired texture.'),
});
export type GenerateTextureForModelInput = z.infer<typeof GenerateTextureForModelInputSchema>;

const GenerateTextureForModelOutputSchema = z.object({
  textureDataUri: z
    .string()
    .describe(
      'The generated texture as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type GenerateTextureForModelOutput = z.infer<typeof GenerateTextureForModelOutputSchema>;

export async function generateTextureForModel(
  input: GenerateTextureForModelInput
): Promise<GenerateTextureForModelOutput> {
  return generateTextureForModelFlow(input);
}

const generateTexturePrompt = ai.definePrompt({
  name: 'generateTexturePrompt',
  input: {schema: GenerateTextureForModelInputSchema},
  output: {schema: GenerateTextureForModelOutputSchema},
  prompt: `Generate a texture for the 3D model with ID {{{modelId}}} based on the following description: {{{texturePrompt}}}. The texture should be returned as a data URI.
`,
});

const generateTextureForModelFlow = ai.defineFlow(
  {
    name: 'generateTextureForModelFlow',
    inputSchema: GenerateTextureForModelInputSchema,
    outputSchema: GenerateTextureForModelOutputSchema,
  },
  async input => {
    try {
      // Call the image generation model to generate the texture.
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: input.texturePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        const err = new Error('Texture generation did not return a valid media URL');
        console.error('Texture generation error:', err);
        throw err;
      }

      return {textureDataUri: media.url};
    } catch (error) {
      console.error('Error in generateTextureForModelFlow:', error);
      throw error;
    }
  }
);
