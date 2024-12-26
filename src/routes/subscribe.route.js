import { Router } from "express"
import { useAuth, roleCheck} from '../middlewares/auth.middleware.js'
import { subscribeController } from "../controllers/subscribe.controller.js" 

export const subscribeRoutes = Router()
const controller = subscribeController()

subscribeRoutes.post("/verify/email", controller.verifyEmail)
subscribeRoutes.post('/check/verify/email/:token', controller.checkVerifyToken)