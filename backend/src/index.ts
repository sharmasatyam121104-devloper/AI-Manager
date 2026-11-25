
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import DBConnect from "./config/db.config";
import AuthRouter from "./routes/auth.route";
import AgentRouter from "./routes/agent.route";
import ChatRouter from "./routes/chat.route";

const app = express();

DBConnect();

app.use(
    cors({
    origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3000",
    ],
    credentials: true,
    })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
    res.status(200).json({
    success: true,
    message: "backend is running successfully",
    });
});

app.use("/auth", AuthRouter);
app.use("/agent", AgentRouter);
app.use("/chat", ChatRouter);

app.use( (_req, res) => {
    res.status(404).json({
        success: false,
        message: "This Route not found",
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`backend running on http://localhost:${PORT}`);
});
