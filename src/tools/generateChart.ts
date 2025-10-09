import type { ToolFn } from '../../types'
import { z } from 'zod'
import { openai } from '../ai'
import fs from 'fs/promises'

export const generateChartToolDefinition = {
  name: 'generate_chart',
  parameters: z.object({
    prompt: z
      .string()
      .describe(
        'The prompt to use to generate the chart using code interpreter tool'
      ),
  }),
  description: 'generates a chart',
}

type Args = z.infer<typeof generateChartToolDefinition.parameters>

// export const generateChart: ToolFn<Args, string> = async ({ toolArgs }) => {
//   const summaryPrompt = `You are a data visualization assistant, use the Code Interpreter tool to analyze the JSON provided
//     and generate a chart based on the user's prompt. When a chart is created, return the image file as a url for the user`
//   return JSON.stringify(summaryPrompt, null, 2) // Formatting json to the llm helps improve how it reads the json
// }

export const generateChart: ToolFn<Args, string> = async ({
  toolArgs,
  userMessage,
}) => {
  const assistant = await openai.beta.assistants.create({
    instructions: `
        You are a data visualization assistant.
        The user will provide data in their message.
        Use the Code Interpreter tool to generate a chart in png format based on the user's request.
        Return the image file to the user.`,
    model: 'gpt-4o-mini',
    tools: [{ type: 'code_interpreter' }],
  })

  console.log('\n\n toolArgs.prompt:', toolArgs.prompt)
  console.log('Prompt type:', typeof toolArgs.prompt)

  const cleanPrompt = String(toolArgs.prompt ?? '')
    .replace(/\u0000/g, '') // remove null bytes
    .trim()

  if (!cleanPrompt) {
    throw new Error('generateChart was called with an empty prompt string')
  }

  console.log(
    'Sending message payload:',
    JSON.stringify({ role: 'user', content: cleanPrompt }, null, 2)
  )

  // If the prompt is a JSON string produced by dataSummary, extract the generated
  // summaryPrompt and the raw data so we can send both to the assistant.
  let promptText = cleanPrompt
  let dataObj: any = null
  try {
    const parsed = JSON.parse(cleanPrompt)
    if (parsed && typeof parsed === 'object' && 'summaryPrompt' in parsed) {
      promptText = String(parsed.summaryPrompt)
      dataObj = parsed.data
    }
  } catch (e) {
    // not JSON
    console.log('\n\nNot JSON')
  }

  const userContent = dataObj
    ? `${promptText}\n\nData:\n${JSON.stringify(dataObj)}`
    : promptText

  // Create a new thread
  const thread = await openai.beta.threads.create()

  // Add message to the thread. Use userContent which may include data extracted from dataSummary
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: userContent,
  })

  console.log('\n\nThread created: ', thread.id)

  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  })

  while (run.status !== 'completed' && run.status !== 'failed') {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    console.log('\n\nRun status: ', run.status)

    if (run.status === 'failed') {
      console.error('\n\nRun failed: ', run)
      return 'Error: run failed'
    }
  }

  console.log('\n\nRun completed: ')

  // Note the image may be attached to an assistant message
  const messages = await openai.beta.threads.messages.list(thread.id)

  // Debug: log the full messages payload so we can inspect what the assistant returned
  console.log('\n\nFull thread messages:', JSON.stringify(messages, null, 2))

  const allContent = messages.data.flatMap((m) => m.content ?? [])
  console.log('\n\nAll content entries:', JSON.stringify(allContent, null, 2))

  const imageContent = allContent.find((c) => c.type === 'image_file')

  if (!imageContent) {
    // No image — return the assistant's full content as a string so it's saved and can be inspected.
    // Note: this image generation fails randomly, need to review if there are better api options to use here.
    console.error(
      'No image file found! Returning assistant content for inspection.'
    )
    return (
      'Error: no image file found. Assistant content: ' +
      JSON.stringify(allContent, null, 2)
    )
  }

  const fileId = (imageContent as any).image_file.file_id
  console.log('Found image fileId: ', fileId)

  const imageBuffer = await downloadChartFromOpenAI(fileId)
  const filePath = `Chart_${fileId}.png`
  await fs.writeFile(filePath, imageBuffer)
  return toolArgs.prompt + ' Chart saved to ' + filePath
}

async function downloadChartFromOpenAI(fileId: string) {
  const response = await openai.files.content(fileId)
  const buffer = Buffer.from(await response.arrayBuffer())
  return buffer
}
