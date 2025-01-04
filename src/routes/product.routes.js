import { Router } from "express"
import { ProductController } from "../controllers/product.controller.js"
import { useAuth, roleCheck } from "../middlewares/auth.middleware.js"
import { uploads } from "../middlewares/muter.middleware.js"

export const productRoutes = Router()
const controller = ProductController()


productRoutes.post("/create", useAuth,
  roleCheck(['super-admin', 'admin', 'saler']),
  uploads.fields([
    { name: 'mainImg', maxCount: 1 }, 
    { name: 'images', maxCount: 10 } 
]),

  controller.createProduct
);


