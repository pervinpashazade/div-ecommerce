import { Router } from "express"
import { ProductController } from "../controllers/product.controller.js"
import { useAuth, roleCheck } from "../middlewares/auth.middleware.js"
import multer from "multer"

export const productRoutes = Router()
const controller = ProductController()

const upload = multer();

productRoutes.post("/create", useAuth,
    //  roleCheck(['super-admin, admin']),
      upload.single('mainImg'),  controller.createProduct)
productRoutes.get("/product-lists",useAuth, controller.createProduct)
