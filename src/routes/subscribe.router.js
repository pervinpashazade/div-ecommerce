import express from "express";
import { subscribeController } from "../controllers/subscribe.controller.js";
export const subscribeRouter = express.Router();
const controller = subscribeController();
subscribeRouter.post("/", controller.subscribeEmail);
subscribeRouter.post("/verify", controller.subscribeVerify);
