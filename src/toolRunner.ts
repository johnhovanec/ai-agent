import type OpenAI from 'openai';
import { generateImage, generateImageToolDefinition } from './tools/generateImages';
import { reddit, redditToolDefinition } from './tools/reddit';
import { dadJoke, dadJokeToolDefinition } from './tools/dadJokes';
import { nytArticleSearch, nytArticleSearchToolDefinition } from './tools/nytArticleSearch';

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || '{}'),
  }
  console.log('running tool:', toolCall.function.name, 'with args:', input.toolArgs)
  switch (toolCall.function.name) {
    case generateImageToolDefinition.name:
        return generateImage(input)
    case redditToolDefinition.name:
        return reddit(input)
    case dadJokeToolDefinition.name:
        return dadJoke(input)
    case nytArticleSearchToolDefinition.name:
        return nytArticleSearch(input)
    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}
