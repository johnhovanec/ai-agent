import 'dotenv/config'
import { runLLM } from './src/llm'
import { addMessages, getMessages } from './src/memory'
const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

// Save new message in the chat history
await addMessages([{role: "user", content: userMessage}])

// Get all the message history to forward to LLM.
const messages  = await getMessages();

const response = await runLLM({
  messages,
})

// We have to save the response from the LLM or else it won't show up in the memory.
await addMessages([{role: 'assistant', content: response}]);

console.log(response)
