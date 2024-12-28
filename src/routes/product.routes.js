import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { uploads } from "../middlewares/muter.middleware.js";

export const productRouter = Router();
const controller = ProductController;

productRouter.post('/create' , controller.createProduct)
productRouter.get('/all' , controller.getAllProduct)
productRouter.get('/:id' , controller.getProductById)
productRouter.put('/update/:id' , controller.updateProduct)
productRouter.delete('/delete/:id' , controller.deleteProduct)

productRouter.post('/create', uploads.single('mainImg'), controller.createProduct);

// productRouter.post('/create', uploads.single('mainImg'), controller.createProduct);

