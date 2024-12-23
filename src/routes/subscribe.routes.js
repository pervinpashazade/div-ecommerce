import { Router } from "express";
import { SubscribeController } from "../controllers/subscribe.controller.js";


export const subscribeRoutes =Router()
const contoller = SubscribeController()
subscribeRoutes.post("/",contoller.subscriber)


