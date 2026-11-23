import { Router } from "express";
import { getCurrentUser, login, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const AuthRouter = Router();

AuthRouter.post("/login", login);
AuthRouter.get("/logout", logout);
AuthRouter.get("/me", requireAuth, getCurrentUser);

export default AuthRouter;