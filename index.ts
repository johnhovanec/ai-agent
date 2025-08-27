import 'dotenv/config';
import { runLLM } from './src/llm';

const userMessage = process.argv[2];

if (!userMessage) {
  console.error("Pleae provide a user message.")
  process.exit(1);
}

const response = await runLLM({ userMessage });

console.log(response);
