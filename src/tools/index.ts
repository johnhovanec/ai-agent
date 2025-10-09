import { generateImageToolDefinition } from './generateImages'
import { redditToolDefinition } from './reddit'
import { dadJokeToolDefinition } from './dadJokes'
import { nytArticleSearchToolDefinition } from './nytArticleSearch'
import { dataSummaryToolDefinition } from './dataSummary'
import { generateChartToolDefinition } from './generateChart'

export const tools = [
  generateImageToolDefinition,
  redditToolDefinition,
  dadJokeToolDefinition,
  dataSummaryToolDefinition,
  generateChartToolDefinition,
  nytArticleSearchToolDefinition,
]
