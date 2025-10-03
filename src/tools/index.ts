import { generateImageToolDefinition} from "./generateImages";
import { redditToolDefinition } from "./reddit";
import { dadJokeToolDefinition } from "./dadJokes";
import { nytArticleSearchToolDefinition } from "./nytArticleSearch";

export const tools = [
    generateImageToolDefinition,
    redditToolDefinition,
    dadJokeToolDefinition,
    nytArticleSearchToolDefinition
];