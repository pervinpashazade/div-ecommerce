import Joi from "joi";
import { Product } from "../models/product.model.js";

const productSchema = Joi.object({
  title: Joi.string().trim().min(3).max(50).required(),
  description: Joi.string().trim().min(10).max(500).required(),
  price: Joi.number().precision(2).min(0).required(),
  oldPrice: Joi.number().precision(2).min(0).optional(),
  countInStock: Joi.number().integer().min(0).required(),
  categories: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  options: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().min(2).max(20).required(),
        value: Joi.string().min(2).max(100).required(),
        code: Joi.string().min(2).max(100).optional(),
      })
    )
    .required(),
});

const createProduct = async (req, res, next) => {
  try {
    const { value, error } = productSchema.validate(req.body, {
      abortEarly: false,
    });

    const length = 10;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    const newProduct = await Product.create({
      ...value,
      mainImg: req.files.mainImg[0].filename,
      images: req.files.images?.map((image) => image.filename),
      sku: result,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "Product successfully created",
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const productList = async (req, res) => {
  const productList = await Product.find();
 
   if (!productList.length) {
     return res.status(404).json({
       message: "No product found.",
     });
   }
 
   const page = req.query.page || 1;
   const limit = req.query.perpage || 5;
 
   const before_page = (page - 1) * limit;
   const list = await Product.find().skip(before_page).limit(limit);
 
   res.status(200).json({
     data: list,
     pagination: {
       productList,
       currentpage: page,
       messagesCount: list.length,
       allPages: Math.ceil(productList / limit),
     },
   });

};

export const ProductController = () => ({
  createProduct,
  productList
});
