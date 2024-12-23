import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js"
import { useAuth } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();
const controller = AuthController();

// -> /api/auth/login
authRoutes.post("/login", controller.login);
authRoutes.post("/register", controller.register);
authRoutes.put("/password/reset", useAuth, controller.resetPass);
