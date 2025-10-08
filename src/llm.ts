import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction } from 'openai/helpers/zod'
import { systemPrompt } from './systemPrompt'

export const runLLM = async ({
  messages,
  tools,
}: {
  messages: AIMessage[]
  tools: any[]
}) => {
  const formattedTools = tools.map(zodFunction)

  console.log('\n\n Calling LLM with messages:', messages)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [{ role: 'system', content: systemPrompt }, ...messages], // Messages should be saved to the db, the prompt should not be since it changes so much.
    tools: formattedTools,
    tool_choice: 'auto',
    parallel_tool_calls: false,
  })

  return response.choices[0].message
}
