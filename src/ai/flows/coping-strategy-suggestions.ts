'use server';

/**
 * @fileOverview An AI agent that suggests coping strategies based on addiction type, progress, and triggers.
 *
 * - suggestCopingStrategies - A function that returns coping strategies.
 * - CopingStrategyInput - The input type for the suggestCopingStrategies function.
 * - CopingStrategyOutput - The return type for the suggestCopingStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CopingStrategyInputSchema = z.object({
  addictionType: z
    .string()
    .describe('The type of addiction the user is struggling with (e.g., smoking, alcohol, drugs).'),
  progress: z
    .string()
    .describe(
      'The user’s progress in quitting their addiction (e.g., number of days without substance, reduced consumption).'
    ),
  triggers: z
    .string()
    .describe('The user’s stated triggers or situations that lead to cravings or urges.'),
});

export type CopingStrategyInput = z.infer<typeof CopingStrategyInputSchema>;

const CopingStrategyOutputSchema = z.object({
  strategies: z
    .array(z.string())
    .describe(
      'A list of coping strategies tailored to the user’s addiction, progress, and triggers.'
    ),
});

export type CopingStrategyOutput = z.infer<typeof CopingStrategyOutputSchema>;

export async function suggestCopingStrategies(
  input: CopingStrategyInput
): Promise<CopingStrategyOutput> {
  return copingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'copingStrategyPrompt',
  input: {schema: CopingStrategyInputSchema},
  output: {schema: CopingStrategyOutputSchema},
  prompt: `You are an AI assistant that provides coping strategies for people trying to overcome their addictions.

  Consider the user's addiction type, their progress, and their stated triggers when suggesting coping strategies.

  Select from the following list of established coping techniques:
  - Deep breathing exercises
  - Meditation or mindfulness
  - Physical exercise (e.g., walking, jogging)
  - Calling a friend or family member for support
  - Attending a support group meeting
  - Engaging in a hobby or enjoyable activity
  - Practicing progressive muscle relaxation
  - Using visualization techniques
  - Writing in a journal
  - Listening to music
  - Reframing negative thoughts
  - Avoiding triggers
  - Seeking professional help

  Addiction Type: {{addictionType}}
  Progress: {{progress}}
  Triggers: {{triggers}}

  Suggest coping strategies that are most relevant to the user's situation. Return the strategies as a list of strings.
  `,
});

const copingStrategyFlow = ai.defineFlow(
  {
    name: 'copingStrategyFlow',
    inputSchema: CopingStrategyInputSchema,
    outputSchema: CopingStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
