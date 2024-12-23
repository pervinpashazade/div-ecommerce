import { Router } from "express";
import { AuthContoller } from "../controllers/auth.controller.js";
import { useAuth } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();
const contoller = AuthContoller();

// -> /api/auth/login
authRoutes.post("/login", contoller.login);
authRoutes.post("/register", contoller.register);
authRoutes.put("/password/reset", useAuth, contoller.resetPass);
