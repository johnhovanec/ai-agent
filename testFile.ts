import OpenAI from 'openai'
import 'dotenv/config'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

console.log('\n\nRunning testFile...\n\n')

const run = async () => {
  const assistant = await openai.beta.assistants.create({
    name: 'test',
    model: 'gpt-4o-mini',
  })

  const thread = await openai.beta.threads.create()
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'Hello world — just testing text content',
  })

  const result = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  })

  console.log('✅ created run:', result.id)
}

run().catch(console.error)
