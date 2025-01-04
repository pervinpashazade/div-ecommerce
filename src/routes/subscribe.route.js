import { Router } from "express"
import { useAuth, roleCheck} from '../middlewares/auth.middleware.js'
import { subscribeController } from "../controllers/subscribe.controller.js" 

export const subscribeRoutes = Router()
const controller = subscribeController()

subscribeRoutes.post("/send/email", controller.sendEmail)
subscribeRoutes.post('/check/:token', controller.checkVerifyToken)
subscribeRoutes.get('/list', useAuth, roleCheck(['super-admin', 'admin']), controller.subscribeList)