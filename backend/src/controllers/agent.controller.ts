import { Request, Response } from "express";
import AgentModel from "../models/agent.model";

export const createAgent = async (req: Request, res: Response) => {
    try {
        const { name, knowledgeBase, instructions, tools } = req.body;
        if (!name || !knowledgeBase || !instructions || !tools) {
            return res.status(400).json({ message: "Missing required fields, like name, knowledgeBase, instructions, or tools" });
        }

        const userId = req.user?.id; 
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const newAgent = await AgentModel.create({
            userId,
            name,
            knowledgeBase,
            instructions,
            tools
        });

        if (!newAgent) {
            return res.status(500).json({ message: "Failed to create agent" });
        }

        res.status(201).json({ message: "Agent created successfully", agent: newAgent });
    } 
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: `Error creating agent: ${error.message}` });
        }
    }
}

export const getAllAgents = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const agents = await AgentModel.find({ userId });
        res.status(200).json({ agents });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: `Error fetching agents: ${error.message}` });
        }
    }
}

export const getAgentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;             
        if (!id) {
            return res.status(400).json({ message: "Agent ID is required" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const agent = await AgentModel.findOne({ _id: id, userId });
        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.status(200).json({ agent });
    } 
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: `Error fetching agent: ${error.message}` });
        }

    }
}

export const deleteAgentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;             
        if (!id) {
            return res.status(400).json({ message: "Agent ID is required" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const deletedAgent = await AgentModel.findOneAndDelete({ _id: id, userId });
        if (!deletedAgent) {
            return res.status(404).json({ message: "Agent not found or already deleted" });
        }

        res.status(200).json({ message: "Agent deleted successfully", agent: deletedAgent });
    } 
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: `Error deleting agent: ${error.message}` });
        }
    }
}