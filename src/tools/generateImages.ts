import type { ToolFn } from '../../types'
import { z } from 'zod';
import { openai } from "../ai";

export const generateImageToolDefinition = {
    name:'generate_image',
    parameters: z.object({
        prompt: z.string().describe('The prompt to use to generate the image with a diffusion model image generator like Dall-E'
),
    }),
    description: 'generates an image'
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>;

export const generateImage: ToolFn<Args, string> = async ({
    toolArgs,
    userMessage
}) => {
    const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: toolArgs.prompt,
        n: 1,  // how many images you want returned
        size: '1024x1024'
    })

    return response.data[0].url!
}