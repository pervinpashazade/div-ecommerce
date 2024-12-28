import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";

export const productRouter = Router();
const controller = ProductController;

productRouter.post('/create' , controller.createProduct)
productRouter.get('/all' , controller.getAllProduct)
productRouter.get('/:id' , controller.getProductById)
productRouter.put('/update/:id' , controller.updateProduct)
productRouter.delete('/delete/:id' , controller.deleteProduct)