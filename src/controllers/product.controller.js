import { Product } from "../models/product.model.js";

//create Product 
const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Şəkil yüklənməyib!" });
        }

        const product = new Product({
            ...req.body,
            mainImg: req.file.filename, 
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({
            message: "Məhsulu yaratmaq mümkün olmadı!",
            error: error.message,
        });
    }
};


// all Product 
const getAllProduct = async (req,res) => {
    try {
        const  Products = await Product.find().populate("categories");
        res.json(Products);
    } catch (error) {
        res.status(500).json({
            message : `Mehsullari getirmek mumkun olmadi !`,
            error : error.message
        })
    }
}

// id and Product
const getProductById = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id).populate("categories");
        if (!product) {
            return res.status(404).json({message : `Mehsul tapilmadi`})
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({
            message : `Mehsullari getirmek mumkun olmadi !`,
            error : error.message
        })
    }
}


// Update Product 
const updateProduct = async (req,res) => {
    try {
        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            })
        if (!updateProduct) { 
            return res.status(404).json({message : `Mehsul  tapilmadi .`})
        }
        res.json(updateProduct);
    } catch (error) {
        res.status(500).json({
            message : `Mehsulu yenilemek mumkun olmadi !`,
            error : error.message
        })
    }
    
}


// Delete Product
const deleteProduct = async (req,res) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return res.status(404).json({message : `mehsul tapilmadi .`})
        }
        res.json(deleteProduct)
    } catch (error) {
        res.status(500).json({
            message : `Mehsulu silmek  olmadi !`,
            error : error.message
        })
    }
}


export const ProductController = {
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct
}