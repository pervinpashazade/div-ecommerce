import { Router } from "express"
import { ProductController } from "../controllers/product.controller.js"
import { useAuth, roleCheck } from "../middlewares/auth.middleware.js"
import {uploads} from '../middlewares/muter.middleware.js'

export const productRoutes = Router()
const controller = ProductController()

productRoutes.post('/create', useAuth, uploads.fields([
    { name: "mainImg", maxCount: 1 }, // Təkli fayl üçün
    { name: "images", maxCount: 5 },// Çoxlu fayllar üçün
]),controller.createProduct)

productRoutes.get('/list', useAuth, roleCheck(['super-admin', 'admin']), controller.productList)