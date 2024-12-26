import { Router } from "express";
import { SubscribeController } from "../controllers/subscribe.controller.js"



export const subscribeRoutes=Router()
const contoller = SubscribeController()
subscribeRoutes.post("/createSubcriber",contoller.createSubscriber)
subscribeRoutes.post("/checkverifycode",contoller.checkVerifyCode)

