import { Router } from "express"
import { useAuth, roleCheck} from '../middlewares/auth.middleware.js'
import { contactController } from "../controllers/contact.controller.js"

export const contactRoutes = Router()
const controller = contactController()

contactRoutes.post("/create", useAuth, controller.create)
contactRoutes.get('/all/messages', useAuth, roleCheck(['super-admin','admin']), controller.allMessages)
contactRoutes.get('/:id', useAuth, roleCheck(['super-admin','admin']), controller.getMessage)