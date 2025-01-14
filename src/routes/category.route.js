import { Router } from "express"
import { roleCheck, useAuth } from '../middlewares/auth.middleware.js'
import { categoryController } from "../controllers/category.controller.js"
import { uploads } from "../middlewares/muter.middleware.js"

export const categoryRoutes = Router()
const controller = categoryController()

categoryRoutes.post("/create", useAuth, roleCheck(['admin', 'super-admin']), uploads.single('img'), controller.create)
categoryRoutes.get('/all', controller.allCategories)
categoryRoutes.get('/:id', controller.getCategory)
categoryRoutes.patch('/edit/:id', useAuth, roleCheck(['super-admin', 'admin']), uploads.single('img'), controller.CategoryEdit)
categoryRoutes.delete('/delete/:id', useAuth, roleCheck(['super-admin', 'admin']), controller.DeleteCategory)
