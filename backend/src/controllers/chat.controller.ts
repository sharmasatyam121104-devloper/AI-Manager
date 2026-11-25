import { Request, Response } from "express";
import { chatGraph } from "../utils/chatGraph.utils";
import { HumanMessage } from "@langchain/core/messages";

export const createChat = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        if(!message || message.length === 0){
            return res.status(400).json({
                success: false,
                message: "Message is required and should be a non-empty array",
            });
        }

        console.log("Received message:", message);

        const threadId = req.user?.id.toString(); // Assuming you have user authentication and the user ID is available in req.user
        if(!threadId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found",
            });
        }

        const data = await chatGraph.invoke({
            messages:[
                new HumanMessage(message)
            ]},
            {
                configurable: {thread_id: threadId}
            }
        );
    
        const lastMessage = data.messages[data.messages.length - 1].content;
        res.status(200).json({
            success: true,
            message: "Chat created successfully",
            data: lastMessage,
        });

    } 
    catch (error) {
        if (error instanceof Error) {
            console.error("Error in createChat:", error.message);
            res.status(500).json({
                success: false,
                message: error.message || "Something went wrong in creating chat",
            });
        }    
    }
}