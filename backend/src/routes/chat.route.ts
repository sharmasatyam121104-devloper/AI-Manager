import { createChat } from "../controllers/chat.controller";
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";

const ChatRouter = Router();

ChatRouter.post("/", requireAuth, createChat);

export default ChatRouter;