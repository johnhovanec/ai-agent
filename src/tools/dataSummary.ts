import type { ToolFn } from '../../types'
import { z } from 'zod';
import 'dotenv/config';
import data2022 from '../data/BLL_NumberOfChildrenUnder6Tested_2022.json' with { type: 'json' };
import data2023 from '../data/BLL_NumberOfChildrenUnder6Tested_2023.json' with { type: 'json' };


export const dataSummaryToolDefinition = {
    name: 'summarize_data',
    parameters: z.object({}),
    description: 'summarizes the data provided to it in a concise manner',
}

type Args = z.infer<typeof dataSummaryToolDefinition.parameters>;

export const dataSummary: ToolFn<Args, string> = async ({ toolArgs }) => {
    const data = [...data2022, ...data2023];
    const summaryPrompt = `Summarize this JSON data about the numbers of children under age 6 tested for elevated blood lead levels: ${JSON.stringify(data)}`

    // Return both the prompt and the raw data as a JSON string so callers (and tools)
    // receive the generated prompt along with the original data object.
    return JSON.stringify({ summaryPrompt, data }, null, 2)
}
