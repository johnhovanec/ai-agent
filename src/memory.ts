import {JSONFilePreset} from 'lowdb/node'
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

// Types
export type MessageWithMetadata = AIMessage & {
    id: string
    createdAt: string
}

type Data = {
    messages: MessageWithMetadata[]
}

// Adding metadata to store in our db for each chat
export const addMetadata = (message: AIMessage) => {
    return {
        ...message,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
    }
}

// Remove the metadata added for the db in order to send to the LLM
export const removeMetadata = (message: MessageWithMetadata) => {
    const {id, createdAt, ...rest} = message
    return rest;
}

const defaultData: Data = {
    messages: [],
}

export const getDb = async () => {
    const db = await JSONFilePreset<Data>('db.json', defaultData)
    return db;
}

export const addMessages = async (messages: AIMessage[]) => {
    const db = await getDb();
    db.data.messages.push(...messages.map(addMetadata));
    await db.write();
}

export const getMessages = async () => {
    const db = await getDb();
    return db.data.messages.map(removeMetadata);
}