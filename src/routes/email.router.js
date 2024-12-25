import express from "express";
import { emailController } from "../controllers/email.controller.js";
export const emailRouter = express.Router();
const controller = emailController();
emailRouter.post("/subscribe", controller.subscribeEmail);
emailRouter.post("/subscribe-verify", controller.subscribeVerify);
