import { Router } from "express"
import { ProductController } from "../controllers/product.controller.js"
import { useAuth, userRole } from "../middlewares/auth.middleware.js"
import multer from "multer"

export const productRoutes = Router()
const contoller = ProductController()

const upload = multer();

productRoutes.post("/create", useAuth, userRole, upload.none(), contoller.createProduct)