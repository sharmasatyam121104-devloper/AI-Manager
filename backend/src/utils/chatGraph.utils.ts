
import { ChatGroq } from "@langchain/groq";
import {
    MessagesAnnotation,
    StateGraph,
} from "@langchain/langgraph";

import { MongoClient } from "mongodb6";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";


const client = new MongoClient(
    process.env.DB_URL || "mongodb://localhost:27017"
);

const checkpointer = new MongoDBSaver({
    client,
    dbName: process.env.DB_NAME || "automat_ai",
});

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
});

const chatNode = async (state: typeof MessagesAnnotation.State) => {
    const response = await llm.invoke(state.messages);

    return {
        messages: [response],
    };
};

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("chatNode", chatNode)
    .addEdge("__start__", "chatNode")
    .addEdge("chatNode", "__end__");

export const chatGraph = workflow.compile({
    checkpointer,
});

export const connectChatDB = async () => {
    await client.connect();
    console.log("LangGraph MongoDB connected");
};

export const disconnectChatDB = async () => {
    await client.close();
};
