import { Router } from "express";

import { createAgent, getAllAgents, getAgentById, deleteAgentById } from "../controllers/agent.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const AgentRouter = Router();


AgentRouter.use(requireAuth); // Apply authentication middleware to all routes

AgentRouter.post("/", createAgent);
AgentRouter.get("/", getAllAgents);
AgentRouter.get("/:id", getAgentById);
AgentRouter.delete("/:id", deleteAgentById);

export default AgentRouter;