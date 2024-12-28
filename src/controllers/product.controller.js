import { Product } from "../models/product.model.js";

// Create - Product 
// const createProduct = async (req,res) => {
//     try {
//         const product = new Product(req.body);
//         const savedProduct = await product.save();
//         res.status(200).json(savedProduct);
//     } catch (error) {
//         res.status(500).json({
//             message: 'Mehsl yaratmaq mumkun olmadi!',
//             error : error.message
//         })
        
//     }
// }
const createProduct = async (req, res) => {
    try {
        console.log(req.file);  // Faylı konsola çıxarır
        console.log(req.body);  // Body içərisini göstərir

        // Faylın adı varsa, yüklənmiş şəkilin yolunu saxla
        const mainImg = req.file ? `/uploads/${req.file.filename}` : null;

        // Məhsulun məlumatlarını body-dən götür
        const productData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            countInStock: req.body.countInStock,
            sku: req.body.sku,
            categories: req.body.categories ? req.body.categories.split(',') : [],
            tags: req.body.tags ? req.body.tags.split(',') : [],
            mainImg : req.body.
        };

        // Məhsulu yarat
        const product = new Product(productData);
        const savedProduct = await product.save();
        
        res.status(200).json(savedProduct);
    } catch (error) {
        res.status(500).json({
            message: 'Mehsul yaratmaq mümkün olmadı!',
            error: error.message
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