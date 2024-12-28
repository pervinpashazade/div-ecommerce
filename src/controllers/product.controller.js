import Joi from "joi";
import { Product } from "../models/product.model.js";
import { error } from "../consts.js";

const productSchema = Joi.object({
	title: Joi.string().required(),
	description: Joi.string().required(),
	rating: Joi.number().optional(),
	reviewCount: Joi.number().optional(),
	price: Joi.number().required(),
	oldPrice: Joi.number().optional(),
	countInStock: Joi.number().required(),
	sku: Joi.string().required(),
	categories: Joi.array().items(Joi.string()).optional(),
	tags: Joi.array().items(Joi.string()).optional(),
	mainImg: Joi.object().optional(),
	images: Joi.array().items(Joi.object()).optional(),
	options: Joi.array()
		.items(
			Joi.object({
				key: Joi.string().optional(),
				value: Joi.string().optional(),
				code: Joi.string().optional(),
			})
		)
		.optional()   
});

const createProduct = async (req, res, next) => {

    const validData = await productSchema
        .validateAsync(
            { ...req.body, mainImg: req.files, images: req.files },
            { abortEarly: false }
        )
        .catch((err) => {
            return res.status(422).json({
                message: error[422],
                error: err?.details.map((item) => item.message),
            });
        });
        
        
    try {
        const newProduct = await Product.create({
            ...validData,
            main_img_url: req.files?.mainImg[0].filename ,
            image_urls: req.files?.images.map(item => item.filename) , 
        });

        return res.status(201).json({
            message: "Məhsul yaradıldı",
            newProduct,
        });
    } catch (err) {
        return res.status(500).json({
            message: error[500],
            error: err.message,
        });
    }
};



const listProducts = async (req, res) => {
	try {
		
		const products = await Product.find();

		return res.status(200).json({
			message: "mehsullar ugurla listlendi",
			products,
		});
	} catch (err) {
		
		return res.status(500).json({
			error: error[500],
			message: err.message,
		});
	}
};


export const ProductController = () => ({
	createProduct,
	listProducts,
});
